import { ChainId } from 'types';
import { isMobileDevices } from 'utils/isMobile';
import { getTXLink, openWithBlank } from 'utils/link';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('utils/isMobile', () => ({
  isMobileDevices: vi.fn(),
}));

vi.mock('utils', () => ({
  getExploreLink: vi.fn((data: string, type: string, _chainId: ChainId) => `https://explore.com/${type}/${data}`),
  shortenString: vi.fn((str: string, chars: number) => `${str.slice(0, chars)}...`),
}));

describe('getTXLink', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  const txId = '0x1234567890123456789012345678901234567890';
  const chainId = 'AELF' as ChainId;
  const hrefResult = 'https://explore.com/transaction/0x1234567890123456789012345678901234567890';

  it('should return a link with shortened transaction ID if isMobileDevices is false', () => {
    // Mock isMobileDevices function return false
    vi.mocked(isMobileDevices).mockReturnValue(false);

    const link = getTXLink(txId, chainId, 6);

    expect(link.props.href).toBe(hrefResult);
    expect(link.props.children).toBe('0x1234...');
  });

  it('should return a link with shortened transaction ID if isMobileDevices is true', () => {
    // Mock isMobileDevices function return true
    vi.mocked(isMobileDevices).mockReturnValue(true);

    const link = getTXLink(txId, chainId, 6);

    expect(link.props.href).toBe(hrefResult);
    expect(link.props.children).toBe('0x1234...');
  });

  it('should return a link with shortened transaction ID id not input shortenChars', () => {
    // Mock isMobileDevices function return true
    vi.mocked(isMobileDevices).mockReturnValue(true);

    const link = getTXLink(txId, chainId);

    expect(link.props.href).toBe(hrefResult);
    expect(link.props.children).toBe('0x1234567890123456789012345678901234567890...');
  });
});

describe('openWithBlank', () => {
  const mockTargetUrl = 'https://example.com';

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should open a new window with the provided URL', () => {
    // Attach the mock to the global window object
    const openMock = vi.fn();
    Object.defineProperty(window, 'open', {
      value: openMock,
      writable: true,
    });

    openWithBlank(mockTargetUrl);
    expect(openMock).toHaveBeenCalledWith(mockTargetUrl, '_blank');
  });

  it('should open a new window with the provided URL and opener is null', () => {
    // Attach the mock to the global window object
    const openMock = vi.fn().mockReturnValue({ opener: mockTargetUrl });
    Object.defineProperty(window, 'open', {
      value: openMock,
      writable: true,
    });

    openWithBlank(mockTargetUrl);
    expect(openMock).toHaveBeenCalledWith(mockTargetUrl, '_blank');
  });
});
