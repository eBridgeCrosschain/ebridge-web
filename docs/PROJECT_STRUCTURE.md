# eBridge-web Project Architecture Documentation

## Project Overview

eBridge-web is a frontend application built with Next.js framework, designed to implement cross-chain bridge functionality. The project uses TypeScript as the development language and employs a modern frontend technology stack and toolchain.

## Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Package Manager**: Yarn
- **UI Library**: Ant Design
- **State Management**: React Query
- **Web3 Libraries**: 
  - aelf-sdk
  - aelf-sdk-cross-chain
  - wagmi
  - viem
- **Code Standards**: ESLint, Prettier
- **Testing**: Vitest
- **CI/CD**: GitHub Actions

## Testing

The project uses Vitest for unit testing. Test files are located alongside the source files with the `.test.ts` or `.test.tsx` extension.

### Test Structure

- Test files follow the naming convention: `[filename].test.ts` or `[filename].test.tsx`
- Tests are organized using the `describe` and `it` blocks
- Each test file should be placed in the same directory as the component/function it tests

### Test Coverage

The project maintains a minimum test coverage requirement:
- Statement coverage: 80%
- Branch coverage: 70%
- Function coverage: 80%
- Line coverage: 80%

### Running Tests

```bash
# Run all tests
yarn test

# Run tests without watch mode
yarn test:not-watch

# Update test snapshots
yarn test:update

# Run tests with coverage report
yarn test:coverage

# Run tests for CI
yarn test:ci
```

### Test Utilities

The project provides several test utilities:
- `@testing-library/react` for component testing
- `@testing-library/react-hooks` for hook testing
- `@testing-library/jest-dom` for DOM testing
- `happy-dom` for browser environment simulation

### Testing Best Practices

1. **Component Testing**
   - Test component rendering
   - Test user interactions
   - Test component props
   - Test component state changes

2. **Hook Testing**
   - Test hook initialization
   - Test hook state changes
   - Test hook side effects
   - Test hook cleanup

3. **Utility Function Testing**
   - Test input/output
   - Test edge cases
   - Test error handling

4. **Integration Testing**
   - Test component interactions
   - Test API calls
   - Test state management

### Mocking

The project uses Vitest's mocking capabilities for:
- API calls
- Web3 interactions
- Contract calls
- External dependencies

Example of a test file:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## Package Management

The project uses Yarn as its package manager. Key Yarn-related files and configurations:

- `yarn.lock`: Lock file that ensures consistent dependency versions across all installations
- `.yarnrc.yml`: Yarn configuration file for managing package registry and other settings
- `.yarn/`: Directory containing Yarn's cache and other internal files

### Yarn Commands

Common Yarn commands used in the project:

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Run development server for mainnet
yarn dev:mainnet

# Run development server for test1
yarn dev:test1

# Build for production
yarn build

# Build for mainnet
yarn build:mainnet

# Start production server
yarn start

# Start production server for mainnet
yarn start:mainnet

# Run linting
yarn lint

# Run bundle analysis
yarn dev:analyze
```

## Directory Structure

```
ebridge-web/
├── src/                    # Source code directory
│   ├── api/               # API interface definitions and request handling
│   ├── assets/            # Static resources (images, fonts, etc.)
│   ├── components/        # Reusable React components
│   ├── constants/         # Constant definitions
│   ├── contexts/          # React Context related code
│   ├── contracts/         # Smart contract related code
│   ├── hooks/             # Custom React Hooks
│   ├── i18n/             # Internationalization config and translation files
│   ├── modals/           # Modal components
│   ├── page-components/   # Page-level components
│   ├── pages/            # Next.js page components
│   ├── styles/           # Global styles and theme configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── wagmiConnectors/  # Web3 wallet connection related code
├── public/                # Static resources directory
├── docs/                  # Project documentation
└── ...                   # Other configuration files

```

## Main Directory Descriptions

### src/api
Contains all API interface definitions and network request handling logic.

### src/components
Contains reusable React components that are used across multiple pages.

### src/contexts
React Context related code for global state management.

### src/contracts
Smart contract related code, including contract ABI and contract interaction logic.

### src/hooks
Custom React Hooks that provide reusable state logic.

### src/i18n
Internationalization configuration and translation files, supporting multiple languages.

### src/modals
Modal components for displaying popups, dialogs, etc.

### src/page-components
Page-level components that are typically associated with specific pages.

### src/pages
Next.js page components that define the application's routing structure.

### src/styles
Global style definitions and theme configuration.

### src/types
TypeScript type definition files.

### src/utils
General utility functions and helper methods.

### src/wagmiConnectors
Web3 wallet connection related code for handling blockchain wallet interactions.

## Configuration Files

- `next.config.js`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.json`: ESLint configuration
- `.prettierrc`: Prettier code formatting configuration
- `vite.config.mts`: Vite configuration
- `vitest.setup.ts`: Vitest test configuration

## Development Tools and Scripts

The project uses multiple development tools and scripts to ensure code quality:

- ESLint for code quality checking
- Prettier for code formatting
- Husky for Git hooks
- Vitest for unit testing
- Next.js bundle analyzer for performance optimization

## Deployment

The project includes a Dockerfile for containerized deployment. Additionally, automated build and deployment processes are implemented through GitHub Actions.

## Environment Configuration

The project supports multiple environments:
- Mainnet
- Test1
- Development

Each environment has corresponding rewrite configuration files:
- `rewrites.mainnet.js`
- `rewrites.testnet.js`
- `rewrites.test1.js` 