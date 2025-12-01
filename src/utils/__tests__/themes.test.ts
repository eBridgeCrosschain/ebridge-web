import { getThemes, setThemes } from 'utils/themes';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Attach the mock to the global document object
vi.mock('react-dom');

describe('getThemes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should return the dark theme from HTML attribute', () => {
    // Mock document object
    document.getElementsByTagName = vi.fn().mockImplementation(() => {
      return [
        {
          setAttribute: vi.fn(),
          getAttribute: vi.fn().mockReturnValue('dark'),
        },
      ];
    });

    const html = document.getElementsByTagName('html')[0];
    html.setAttribute('data-theme', 'dark');

    // Execution Method
    const result = getThemes();

    // Assertions
    expect(result).toBe('dark');
  });

  it('should return the light theme from HTML attribute', () => {
    // Mock document object
    document.getElementsByTagName = vi.fn().mockImplementation(() => {
      return [
        {
          setAttribute: vi.fn(),
          getAttribute: vi.fn().mockReturnValue('light'),
        },
      ];
    });

    const html = document.getElementsByTagName('html')[0];
    html.setAttribute('data-theme', 'light');

    // Execution Method
    const result = getThemes();

    // Assertions
    expect(result).toBe('light');
  });
});

describe('setThemes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should set the theme on HTML attribute if different from current theme', () => {
    // Mock document object
    document.getElementsByTagName = vi.fn().mockImplementation(() => {
      return [
        {
          setAttribute: vi.fn(),
          getAttribute: vi.fn().mockReturnValue('light'),
        },
      ];
    });

    // Execution Method
    setThemes('dark');

    // Assertions
    const html = document.getElementsByTagName('html')[0];
    expect(html.getAttribute('data-theme')).toBe('light');
  });

  it('should not change the theme if it matches the current theme', () => {
    // Mock document object
    document.getElementsByTagName = vi.fn().mockImplementation(() => {
      return [
        {
          setAttribute: vi.fn(),
          getAttribute: vi.fn().mockReturnValue('dark'),
        },
      ];
    });

    const html = document.getElementsByTagName('html')[0];
    html.setAttribute('data-theme', 'dark');

    // Execution Method
    setThemes('dark');

    // Assertions
    expect(html.getAttribute('data-theme')).toBe('dark');
  });
});
