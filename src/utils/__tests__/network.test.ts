import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNetworkInfo,
  getSupportedChainIdsFromWalletConnectSession,
  isChainAllowed,
  switchChain,
  switchNetwork,
} from 'utils/network';
import { ChainId } from 'types';
import { eventBus } from 'utils/eBridgeEventBus';
import { isELFChain } from 'utils/aelfUtils';
import storages from 'constants/storages';
import CommonMessage from 'components/CommonMessage';
import { Connector } from 'wagmi';

// Mock the NetworkList in the network module
vi.mock('constants/index', async (importOriginal) => {
  const actual: any = await importOriginal();

  // Mock NetworkList
  const NetworkList = [
    {
      info: {
        chainId: 'AELF' as ChainId,
        name: 'MainNet',
        url: 'https://mainnet.api.com',
      },
    },
    {
      info: {
        chainId: 'tDVV' as ChainId,
        name: 'TestNet',
        url: 'https://testnet.api.com',
      },
    },
  ];

  return {
    ...actual,
    NetworkList,
  };
});

vi.mock('constants/chain', async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,
    ALL_SUPPORTED_CHAIN_IDS: [11155111, 1, 3, 4, 56, 137, 42161],
  };
});

vi.mock('utils/aelfUtils', () => ({
  isELFChain: vi.fn(),
}));

vi.mock('components/CommonMessage', () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock('walletConnectors', () => ({
  injectedConnection: {
    connector: {
      activate: vi.fn(),
      connectEagerly: vi.fn(),
    },
  },
  coinbaseWalletConnection: {
    connector: 'coinbaseWalletConnector',
  },
  walletConnectConnection: {
    connector: {
      activate: vi.fn(),
      provider: {
        session: {
          namespaces: {
            'eip:11155111': {
              chains: ['eip:11155111'],
              accounts: ['eip:11155111:0x123'],
            },
            'eip155:3': {
              chains: ['eip155:3'],
              accounts: ['eip155:3:0x123'],
            },
          },
        },
      },
    },
  },
  networkConnection: {
    connector: {
      activate: vi.fn(),
      provider: {
        session: {
          namespaces: {
            'eip155:11155111': {
              chains: ['eip155:11155111'],
              accounts: ['eip155:11155111:0x123'],
            },
          },
        },
      },
    },
  },
}));

vi.mock('constants/storages', () => {
  return {
    default: {
      storages: { serERCChainId: 'user-erc-chain-id', userELFChainId: 'user-elf-chain-id' },
    },
  };
});

vi.mock('utils/eBridgeEventBus', () => {
  return {
    eventBus: {
      emit: vi.fn(),
    },
  };
});

// Mock global objects
const mockEthereum = {
  providerMap: new Map([
    ['MetaMask', { isMetaMask: true, request: vi.fn() }],
    ['OtherWallet', {}],
  ]),
  request: vi.fn(),
};

// Mock dependencies
vi.stubGlobal('ethereum', mockEthereum);

vi.stubGlobal('console', {
  log: vi.fn(),
  error: vi.fn(),
});

const mainChainId = 'AELF' as ChainId;
const dappChainId = 'tDVV' as ChainId;

const mainnetChainId = 11155111 as ChainId;

const mockSepoliaInfo = {
  chainId: mainnetChainId,
  exploreUrl: 'https://sepolia.etherscan.io/',
  rpcUrl: 'https://sepolia.drpc.org',
  chainName: 'sepolia',
  nativeCurrency: { name: 'SETH', decimals: 18, symbol: 'ETH' },
  rpcUrls: ['https://sepolia.drpc.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  iconUrls: ['https://mock.icon.com'],
};

const mockAelfInfo = {
  chainId: mainChainId,
  exploreUrl: 'https://testnet.aelfscan.io/AELF/',
  rpcUrl: 'https://aelf-test-node.aelf.io',
  chainName: 'aelf MainChain',
  nativeCurrency: { name: 'ELF', decimals: 8, symbol: 'ELF' },
};

describe('switchNetwork', () => {
  const baseInfo = {
    chainId: 1,
    chainName: 'Test Chain',
    nativeCurrency: {
      name: 'Test',
      symbol: 'TEST',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.test.com'],
    blockExplorerUrls: ['https://explorer.test.com'],
    iconUrls: ['https://icon.test.com'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle string chainId (ELF chain)', async () => {
    // Test ELF chain scenario
    const result = await switchNetwork({ ...baseInfo, chainId: 'AELF' });

    // Verify event emission
    expect(eventBus.emit).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should add new chain when nativeCurrency and chainName exist', async () => {
    // Test wallet_addEthereumChain path
    const result = await switchNetwork(baseInfo);

    expect(result).toBe(true);
  });

  it('should switch chain when missing nativeCurrency or chainName', async () => {
    // Test wallet_switchEthereumChain path
    const result = await switchNetwork({
      ...baseInfo,
      nativeCurrency: undefined,
      chainName: undefined,
    });

    expect(result).toBe(true);
  });

  it('should handle ERC chain with missing provider', async () => {
    // Remove ethereum provider
    vi.stubGlobal('ethereum', undefined);

    const result = await switchNetwork(baseInfo);

    // Verify error logging
    expect(console.error).toHaveBeenCalledWith(
      "Can't setup the RPC network on metamask because window.ethereum is undefined",
    );
    expect(result).toBe(false);
  });

  it('should handle metamask provider in providerMap', async () => {
    // Test providerMap handling
    vi.stubGlobal('ethereum', {
      providerMap: new Map([['MetaMask', { isMetaMask: true, request: vi.fn() }]]),
    });

    const result = await switchNetwork(baseInfo);

    expect(result).toBe(true);
  });

  it('should handle request errors gracefully', async () => {
    // Mock rejected request
    vi.stubGlobal('ethereum', {
      providerMap: 'invalid' as any,
      request: vi.fn().mockRejectedValue(new Error('User rejected')),
    });

    const result = await switchNetwork(baseInfo);

    // Verify error logging
    expect(console.error).toHaveBeenCalledWith('switchNetwork', Error('User rejected'));
    expect(result).toBe(false);
  });

  it('should handle invalid chainId conversions', async () => {
    vi.stubGlobal('ethereum', mockEthereum);

    // Test non-numeric chainId
    const result = await switchNetwork({ ...baseInfo, chainId: 'invalid' });

    expect(result).toBe(true);
  });

  it('should handle providerMap iteration errors', async () => {
    // Break providerMap iteration
    vi.stubGlobal('ethereum', {
      providerMap: {
        AELF: { url: 'http://aelf.com' },
        ERC: { url: 'http://erc.com' },
      },
      request: vi.fn(),
    });

    const result = await switchNetwork(baseInfo);

    expect(result).toBe(true);
  });
});

describe('isChainAllowed', () => {
  const supportedChainId = 1; // Example supported chain ID
  const unsupportedChainId = 999; // Example unsupported chain ID

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for supported chainId with injectedConnection.connector', () => {
    const result = isChainAllowed(injectedConnection.connector, supportedChainId);

    expect(result).toBe(true);
  });

  it('should return false for unsupported chainId with injectedConnection.connector', () => {
    const result = isChainAllowed(injectedConnection.connector, unsupportedChainId);

    expect(result).toBe(false);
  });

  it('should return true for supported chainId with coinbaseWalletConnection.connector', () => {
    const result = isChainAllowed(coinbaseWalletConnection.connector, supportedChainId);

    expect(result).toBe(true);
  });

  it('should return false for unsupported chainId with coinbaseWalletConnection.connector', () => {
    const result = isChainAllowed(coinbaseWalletConnection.connector, unsupportedChainId);

    expect(result).toBe(false);
  });

  it('should return true for supported chainId with walletConnectConnection.connector', () => {
    const result = isChainAllowed(walletConnectConnection.connector, supportedChainId);

    expect(result).toBe(true);
  });

  it('should return false for unsupported chainId with walletConnectConnection.connector', () => {
    const result = isChainAllowed(walletConnectConnection.connector, unsupportedChainId);

    expect(result).toBe(false);
  });

  it('should return true for supported chainId with networkConnection.connector', () => {
    const result = isChainAllowed(networkConnection.connector, supportedChainId);

    expect(result).toBe(true);
  });

  it('should return false for unsupported chainId with networkConnection.connector', () => {
    const result = isChainAllowed(networkConnection.connector, unsupportedChainId);

    expect(result).toBe(false);
  });

  it('should return false for any chainId with an unknown connector', () => {
    const result = isChainAllowed('unknownConnector' as any, supportedChainId);

    expect(result).toBe(false);
  });
});

describe('getSupportedChainIdsFromWalletConnectSession', () => {
  it('should return empty array for empty session', () => {
    // Test undefined session
    expect(getSupportedChainIdsFromWalletConnectSession()).toEqual([]);

    // Test empty object
    expect(getSupportedChainIdsFromWalletConnectSession({})).toEqual([]);

    // Test null input
    expect(getSupportedChainIdsFromWalletConnectSession(null)).toEqual([]);
  });

  it('should extract unique chainIds from complex session structure', () => {
    // Mock complex session data
    const mockSession = {
      namespaces: {
        'eip155:1': {
          chains: ['eip155:1', 1, 'invalid'],
          accounts: ['eip155:1:0x123', 'eip155:3'],
        },
        'eip155:3': {
          chains: [3, 'eip155:3'],
          accounts: ['eip155:3:0x456'],
        },
        cosmos: {
          chains: ['cosmos:cosmoshub-4'],
          accounts: ['cosmos:cosmoshub-4:cosmos1...'],
        },
      },
    };

    const result = getSupportedChainIdsFromWalletConnectSession(mockSession);
    expect(result).toEqual([1, 3]);
  });

  it('should handle mixed data types and invalid values', () => {
    // Test session with mixed valid/invalid values
    const mockSession = {
      namespaces: {
        'eip155:invalid': {
          // Should be ignored
          chains: [NaN, {}],
          accounts: [null],
        },
        'eip155:5': {
          chains: ['eip155:5', '5', 5],
          accounts: [5, 'eip155:5:0x789'],
        },
        6: {
          // Number key
          chains: ['6'],
          accounts: ['eip155:6'],
        },
      },
    };

    const result = getSupportedChainIdsFromWalletConnectSession(mockSession);
    expect(result).toEqual([5, 6, 0]);
  });

  it('should deduplicate chainIds', () => {
    // Test duplicate values in different locations
    const mockSession = {
      namespaces: {
        'eip155:1': {
          chains: ['eip155:1'],
          accounts: ['eip155:1:0x123'],
        },
        'eip155:2': {
          chains: [2],
          accounts: ['eip155:1'], // Duplicate with namespace key
        },
      },
    };

    const result = getSupportedChainIdsFromWalletConnectSession(mockSession);
    expect(result).toEqual([1, 2]);
  });

  it('should handle numeric chainIds', () => {
    // Test numeric values in chains array
    const mockSession = {
      namespaces: {
        'eip155:1': {
          chains: [1, 100],
          accounts: [42],
        },
      },
    };

    const result = getSupportedChainIdsFromWalletConnectSession(mockSession);
    expect(result).toEqual([1, 100, 42]);
  });

  it('should filter out null values', () => {
    // Test session with invalid entries
    const mockSession = {
      namespaces: {
        'eip155:invalid': {
          chains: ['invalid'],
          accounts: [{}],
        },
        'eip155:10': {
          chains: [10],
          accounts: ['eip155:10:0xabc'],
        },
      },
    };

    const result = getSupportedChainIdsFromWalletConnectSession(mockSession);
    expect(result).toEqual([10]);
  });
});

describe('switchChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Handle string chainId case
  it('should handle string chainId and emit event', async () => {
    const result = await switchChain(mockAelfInfo);

    expect(eventBus.emit).toHaveBeenCalledWith(storages.userELFChainId, mainChainId);
    expect(result).toBe(true);
  });

  // Test 2: Handle non-ELF chain with matching web3ChainId
  it('should return undefined for non-ELF chain with matching web3ChainId', async () => {
    // Mock isELFChain return false
    vi.mocked(isELFChain).mockReturnValue(false);

    const result = await switchChain(mockSepoliaInfo, undefined, true, 1);
    expect(result).toBeUndefined();
  });

  // Test 3: Handle missing connector or string connector
  it('should return early with invalid connector', async () => {
    const result1 = await switchChain(mockSepoliaInfo);
    const result2 = await switchChain(mockSepoliaInfo, 'metamask');

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });

  // Test 4: Handle WalletConnect chain validation failure
  it('should show error for unsupported WalletConnect chain', async () => {
    const mockConnector = {
      provider: { session: { namespaces: {} } },
      activate: vi.fn(),
    };

    await expect(switchChain(mockSepoliaInfo, mockConnector as unknown as Connector, true)).rejects.toThrow(
      'Chain 11155111 not supported for connector (object)',
    );
  });

  // Test 5: Executed switchNetwork
  it('should executed switchNetwork method', async () => {
    const mockConnector = {
      provider: { session: { namespaces: {} } },
      activate: vi.fn(),
    };

    const result = await switchChain(mockSepoliaInfo, mockConnector as unknown as Connector, false);

    expect(result).toBeUndefined();
  });

  // Test 6: Handle WalletConnect activation
  it('should activate wallet connector', async () => {
    await switchChain({ ...mockSepoliaInfo, chainId: 3 as any }, walletConnectConnection.connector, true);

    expect(walletConnectConnection.connector.activate).toHaveBeenCalledWith(3);
  });

  // Test 7: Handle network connection activation
  it('should activate network connector', async () => {
    await switchChain(mockSepoliaInfo, networkConnection.connector, true);

    expect(networkConnection.connector.activate).toHaveBeenCalledWith(11155111);
  });

  // Test 7: The network connection activate method is not executed
  it('should not execute activate method', async () => {
    // Mock isELFChain return false
    vi.mocked(isELFChain).mockReturnValue(false);

    const result = await switchChain(mockSepoliaInfo, networkConnection.connector, true, 11155111);

    expect(result).toBeUndefined();
    expect(networkConnection.connector.activate).not.toHaveBeenCalled();
  });

  // Test 8: Handle walletConnectConnection error
  it('should show error if connector.provider.session not chainId', async () => {
    await expect(
      switchChain(mockSepoliaInfo, walletConnectConnection.connector as unknown as Connector, true),
    ).rejects.toThrow('sepolia is unsupported by your wallet.');

    expect(CommonMessage.error).toHaveBeenCalled();
  });

  // Test 9: Handle generic connector activation
  it('should activate generic connector with parameters', async () => {
    await switchChain(mockSepoliaInfo, injectedConnection.connector, true);

    expect(injectedConnection.connector.activate).toHaveBeenCalled();
  });

  // Test 10: Handle inactive web3 case
  it('should switch network when web3 is inactive', async () => {
    const result = await switchChain(mockSepoliaInfo, undefined, false);

    expect(result).toBeUndefined();
  });

  // Test 11: Boundary test - minimum valid chainId
  it('should handle minimum valid chainId (1)', async () => {
    await switchChain({ ...mockSepoliaInfo, chainId: 1 });

    expect(eventBus.emit).toHaveBeenCalledWith(storages.userERCChainId, 1);
  });

  // Test 12: Boundary test - maximum safe integer chainId
  it('should handle maximum safe chainId (2^53-1)', async () => {
    const maxSafeChainId = Number.MAX_SAFE_INTEGER;
    await switchChain({ ...mockSepoliaInfo, chainId: maxSafeChainId });

    expect(eventBus.emit).toHaveBeenCalledWith(storages.userERCChainId, maxSafeChainId);
  });
});

describe('getNetworkInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the correct network info for MainNet', () => {
    const result = getNetworkInfo(mainChainId);
    expect(result).toEqual({
      info: {
        chainId: mainChainId,
        name: 'MainNet',
        url: 'https://mainnet.api.com',
      },
    });
  });

  it('should return the correct network info for TestNet', () => {
    const result = getNetworkInfo(dappChainId);
    expect(result).toEqual({
      info: {
        chainId: dappChainId,
        name: 'TestNet',
        url: 'https://testnet.api.com',
      },
    });
  });

  it('should return undefined for an unknown chainId', () => {
    const result = getNetworkInfo('UnknownChainId' as any);
    expect(result).toBeUndefined();
  });
});
