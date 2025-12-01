import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { txSuccess, txError, txMessage, copyTxMessage } from '../message';
import { message as antMessage } from 'antd';
import writeText from 'copy-to-clipboard';
import CommonMessage from 'components/CommonMessage';
import { ChainId } from 'types';
import { render, screen } from '@testing-library/react';

// Mock external dependencies
vi.mock('antd', () => ({
  message: {
    config: vi.fn(),
    open: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('i18next', () => ({
  default: { t: (str: string) => str },
}));

vi.mock('react-i18next', () => ({
  Trans: ({ children }: any) => children,
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

// Mock IconFont component
vi.mock('components/IconFont', () => ({
  default: ({ type, onClick }: { type: string; onClick: () => void }) => (
    <span data-testid={`icon-${type}`} onClick={onClick} />
  ),
}));

// Mock getTXLink component
vi.mock('utils/link', () => ({
  getTXLink: (txId: string, chainId: ChainId, chars: number) => (
    <span data-testid="tx-link">{`${txId}-${chainId}-${chars}`}</span>
  ),
}));

vi.mock('components/CommonMessage', () => {
  return {
    default: {
      error: vi.fn(),
    },
  };
});

const mockChainId = 'AELF' as ChainId;

describe('txSuccess', () => {
  const mockChainId = 1 as ChainId;
  const mockMessage = 'Transaction completed successfully';

  // Test 1: When TransactionId exists
  it('should call copyTxMessage with correct parameters', () => {
    const mockReq = { TransactionId: '0x12345' };

    txSuccess({ req: mockReq, chainId: mockChainId, message: mockMessage });

    expect(antMessage.success).not.toHaveBeenCalled();
  });

  // Test 2: When TransactionId is missing
  it('should show antd message when TransactionId missing', () => {
    txSuccess({ req: {}, chainId: mockChainId, message: mockMessage });

    expect(antMessage.success).toHaveBeenCalledWith(mockMessage);
  });

  // Test 3: Boundary case - empty TransactionId string
  it('should handle empty TransactionId string', () => {
    txSuccess({ req: { TransactionId: '' }, chainId: mockChainId, message: mockMessage });

    expect(antMessage.success).toHaveBeenCalledWith(mockMessage);
  });

  // Test 4: Boundary case - null request object
  it('should handle null request object', () => {
    txSuccess({ req: null, chainId: mockChainId, message: mockMessage });

    expect(antMessage.success).toHaveBeenCalledWith(mockMessage);
  });

  // Test 5: Boundary case - undefined parameters
  it('should handle undefined parameters', () => {
    // @ts-ignore: Test undefined case
    txSuccess({ chainId: mockChainId, message: mockMessage });

    expect(antMessage.success).toHaveBeenCalledWith(mockMessage);
  });

  // Test 6: Different ChainId types
  it('should handle different ChainId types', () => {
    const altChainId = 4 as ChainId;
    const mockReq = { TransactionId: '0xabc' };

    txSuccess({ req: mockReq, chainId: altChainId, message: mockMessage });
  });
});

describe('txError', () => {
  const mockChainId = 'AELF' as ChainId;
  const baseParams = {
    chainId: mockChainId,
    decimals: 8,
    message: 'default_error',
    req: { TransactionId: '0x12345', error: {} },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle transaction hash display correctly', () => {
    const params = {
      ...baseParams,
      req: { ...baseParams.req, isTransactionHash: true },
    };

    txError(params);

    // Verify CommonMessage.error to be called
    expect(CommonMessage.error).toHaveBeenCalled();
  });

  it('should handle transaction hash display correctly', () => {
    const params = {
      ...baseParams,
      req: { ...baseParams.req, isTransactionHash: false },
    };

    txError(params);

    // Verify CommonMessage.error to be called
    expect(CommonMessage.error).toHaveBeenCalled();
  });

  it('should display basic error message', () => {
    txError({ ...baseParams, req: { error: {} } });
    expect(CommonMessage.error).toHaveBeenCalledWith(expect.anything());
  });

  it('should apply decimal formatting when specified', () => {
    const errorMsg = 'Balance too low';
    txError({
      ...baseParams,
      req: { error: { message: errorMsg } },
    });

    expect(CommonMessage.error).toHaveBeenCalled();
  });

  it('should enable text copy on click', () => {
    const errorText = 'Copyable error';
    txError({
      ...baseParams,
      req: { error: { message: errorText } },
    });

    const messageComponent = (CommonMessage.error as any).mock.calls[0][0];
    messageComponent.props.onClick();

    expect(writeText).toHaveBeenCalledWith(errorText);
  });

  it('should handle empty transaction ID gracefully', () => {
    txError({
      ...baseParams,
      req: { TransactionId: '', error: { message: 'Insufficient balance and Current balance is 10' } },
    });

    expect(CommonMessage.error).not.toHaveBeenCalledWith(expect.stringContaining('View TX'));
  });

  it('should handle number error.message', () => {
    txError({
      ...baseParams,
      req: { TransactionId: '', error: { message: 400 } },
    });

    expect(CommonMessage.error).not.toHaveBeenCalledWith(expect.stringContaining('View TX'));
  });

  it('should handle null request object', () => {
    txError({
      ...baseParams,
      req: null,
    });

    expect(CommonMessage.error).toHaveBeenCalledWith(expect.anything());
  });

  it('should use default message when error missing', () => {
    txError({
      ...baseParams,
      req: { error: null },
    });

    expect(CommonMessage.error).toHaveBeenCalled();
  });

  it('should use default message when error missing and decimals is undefined', () => {
    txError({
      ...baseParams,
      req: { error: null },
      decimals: undefined,
    });

    expect(CommonMessage.error).toHaveBeenCalled();
  });
});

describe('txMessage function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when request has error (req.error exists)', () => {
    it('should call txError with translated message and decimals', () => {
      const mockReq = { error: new Error('test') };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
        decimals: 18,
      });

      // Verify CommonMessage.error to be called
      expect(CommonMessage.error).toHaveBeenCalled();
    });

    it('should use default errorMessage when not provided', () => {
      const mockReq = { error: new Error('test') };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
      });

      // Verify CommonMessage.error to be called
      expect(CommonMessage.error).toHaveBeenCalled();
    });
  });

  describe('when request succeeds (no req.error)', () => {
    it('should call copyTxMessage when copy=true', () => {
      const mockReq = { txHash: '0x123' };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
        copy: true,
      });

      // Verify CommonMessage.error to be called
      expect(antMessage.open).toHaveBeenCalled();
    });

    it('should call txSuccess when copy=false', () => {
      const mockReq = { txHash: '0x123' };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
        copy: false,
      });

      // Verify CommonMessage.error to be called
      expect(antMessage.success).toHaveBeenCalled();
    });

    it('should use default successMessage when not provided', () => {
      const mockReq = { txHash: '0x123' };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
      });

      // Verify CommonMessage.error to be called
      expect(antMessage.success).toHaveBeenCalled();
    });

    it('should default to txSuccess when copy=undefined', () => {
      const mockReq = { txHash: '0x123' };

      txMessage({
        req: mockReq,
        chainId: mockChainId,
      });

      // Verify CommonMessage.error to be called
      expect(antMessage.success).toHaveBeenCalled();
    });
  });

  it('should handle undefined decimals parameter', () => {
    const mockReq = { error: new Error('test') };

    txMessage({
      req: mockReq,
      chainId: mockChainId,
    });

    // Verify CommonMessage.error to be called
    expect(CommonMessage.error).toHaveBeenCalled();
  });
});

describe('copyTxMessage', () => {
  const mockChainId = 1 as ChainId;
  const mockTransactionId = '0x1234567890abcdef';
  const mockMessage = 'Transaction Successful';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render message with all elements (with custom message)', () => {
    // Call function with all parameters
    copyTxMessage({
      req: { TransactionId: mockTransactionId },
      chainId: mockChainId,
      message: mockMessage,
    });

    // Verify antd message.open called with correct content
    expect(antMessage.open).toHaveBeenCalled();
    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;

    // Render the content to inspect structure
    render(messageContent);

    // Verify title with custom message
    expect(screen.getByText(mockMessage)).toBeInTheDocument();

    // Verify transaction link
    const txLink = screen.getByTestId('tx-link');
    expect(txLink.textContent).toBe(`${mockTransactionId}-${mockChainId}-6`);

    // Verify copy icon
    const copyIcon = screen.getByTestId('icon-copy');
    expect(copyIcon).toBeInTheDocument();
  });

  it('should render message without custom message', () => {
    // Call function without message
    copyTxMessage({
      req: { TransactionId: mockTransactionId },
      chainId: mockChainId,
    });

    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;
    render(messageContent);

    // Should not show message title
    expect(screen.queryByTestId('tx-title-row')).not.toBeInTheDocument();
  });

  it('should handle empty transaction ID', () => {
    // Call function with empty TransactionId
    copyTxMessage({
      req: { TransactionId: '' },
      chainId: mockChainId,
      message: mockMessage,
    });

    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;
    render(messageContent);

    // Should show empty transaction ID
    expect(screen.getByTestId('tx-link').textContent).toBe(`-${mockChainId}-6`);
  });

  it('should handle clipboard copy', async () => {
    // Call function with valid parameters
    copyTxMessage({
      req: { TransactionId: mockTransactionId },
      chainId: mockChainId,
      message: mockMessage,
    });

    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;
    render(messageContent);

    // Simulate copy icon click
    const copyIcon = screen.getByTestId('icon-copy');
    copyIcon.click();

    // Verify clipboard write
    expect(writeText).toHaveBeenCalledWith(mockTransactionId);

    // Verify success message
    expect(antMessage.success).toHaveBeenCalledWith('Copy Success');
  });

  it('should handle clipboard copy with req is undefined', async () => {
    // Call function with valid parameters
    copyTxMessage({
      req: undefined,
      chainId: mockChainId,
      message: mockMessage,
    });

    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;
    render(messageContent);

    // Simulate copy icon click
    const copyIcon = screen.getByTestId('icon-copy');
    copyIcon.click();

    // Verify clipboard write
    expect(writeText).toHaveBeenCalledWith(undefined);

    // Verify success message
    expect(antMessage.success).toHaveBeenCalledWith('Copy Success');
  });

  it('should handle invalid chainId', () => {
    // Call function with invalid chainId
    copyTxMessage({
      req: { TransactionId: mockTransactionId },
      chainId: 999 as ChainId,
      message: mockMessage,
    });

    const messageContent = (antMessage.open as Mock).mock.calls[0][0].content;
    render(messageContent);

    // Verify tx link with invalid chainId
    expect(screen.getByTestId('tx-link').textContent).toBe(`${mockTransactionId}-999-6`);
  });
});
