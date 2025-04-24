# eBridge-web Test Architecture

## Overview

The project uses Vitest as the primary testing framework, along with React Testing Library for component testing. The test setup includes various configurations to handle browser-specific APIs and DOM manipulation.

## Test Framework

- **Vitest**: Main testing framework
- **React Testing Library**: For component testing
- **Jest DOM**: For DOM testing utilities
- **Happy DOM**: For browser environment simulation

## Test Configuration

The test configuration is primarily set up in `vitest.setup.ts`, which includes:

1. DOM environment setup
2. Mock implementations for browser APIs:
   - TextEncoder
   - ResizeObserver
   - matchMedia
   - Canvas context
3. Global cleanup after each test
4. React global setup

## Running Tests

The project provides several npm scripts for running tests:

```bash
# Run tests in watch mode (default)
yarn test

# Run tests without watch mode
yarn test:not-watch

# Update snapshots
yarn test:update

# Run tests with coverage
yarn test:coverage

# Run tests in CI environment
yarn test:ci
```

## Test Structure

Tests should be placed in the same directory as the component or module they're testing, with the following naming convention:
- `*.test.ts` or `*.test.tsx` for component tests
- `*.spec.ts` or `*.spec.tsx` for utility/function tests

## Test Dependencies

Key testing dependencies in `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@vitest/coverage-v8": "^3.0.5",
    "happy-dom": "^17.1.0",
    "vitest": "^3.0.5"
  }
}
```

## Best Practices

1. **Component Testing**:
   - Use React Testing Library for component tests
   - Focus on testing component behavior rather than implementation details
   - Use meaningful test names that describe the test's purpose

2. **Utility Testing**:
   - Test pure functions with clear inputs and outputs
   - Use appropriate test cases to cover edge cases
   - Mock external dependencies when necessary

3. **Test Coverage**:
   - Aim for meaningful test coverage
   - Focus on testing critical business logic
   - Use coverage reports to identify untested areas

4. **Mocking**:
   - Use Vitest's built-in mocking capabilities
   - Mock external services and APIs
   - Keep mocks simple and focused

## CI Integration

Tests are automatically run in the CI environment using the `test:ci` script, which includes coverage reporting. The CI configuration ensures that:

1. All tests pass before merging
2. Coverage thresholds are met
3. Test results are properly reported

## Debugging Tests

To debug tests:

1. Use the `debug()` function from React Testing Library
2. Add `console.log` statements in test files
3. Use the `--inspect` flag with Vitest for Node.js debugging

## Common Issues and Solutions

1. **DOM Environment Issues**:
   - Use the provided mock implementations in `vitest.setup.ts`
   - Ensure proper cleanup after each test

2. **Async Testing**:
   - Use `waitFor` from React Testing Library
   - Handle promises and async operations properly

3. **Mocking Issues**:
   - Ensure mocks are properly reset between tests
   - Use appropriate mock implementations for different scenarios 