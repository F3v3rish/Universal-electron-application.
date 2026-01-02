# Contributing to Universal Electron Application

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Plugin Development](#plugin-development)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Universal-electron-application.git`
3. Add upstream remote: `git remote add upstream https://github.com/F3v3rish/Universal-electron-application.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Git

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Available Scripts

```bash
npm run build          # Build all components
npm run build:main     # Build main process only
npm run build:renderer # Build renderer process only
npm run build:preload  # Build preload script only
npm run watch          # Watch mode for development
npm run dev            # Build and start in development mode
npm start              # Build and start application
npm run lint           # Run ESLint
npm run lint:fix       # Run ESLint with auto-fix
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

## Project Structure

```
src/
├── main/           # Main process (Node.js)
│   ├── index.ts
│   ├── window-manager.ts
│   ├── plugin-manager.ts
│   ├── worker-pool-manager.ts
│   ├── child-process-manager.ts
│   ├── ipc-handler.ts
│   └── settings-manager.ts
├── renderer/       # Renderer process (Browser)
│   ├── App.tsx
│   ├── index.tsx
│   ├── components/
│   └── styles/
├── preload/        # Preload script
│   └── index.ts
├── shared/         # Shared code
│   ├── types.ts
│   ├── logger.ts
│   ├── event-bus.ts
│   └── error-handler.ts
└── workers/        # Worker threads
    ├── base-worker.ts
    └── child-process.ts
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide explicit types for function parameters and return values
- Avoid using `any` type (use `unknown` or specific types)

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Check your code
npm run lint
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format
```

### Naming Conventions

- **Files**: Use kebab-case: `window-manager.ts`, `plugin-manager.ts`
- **Classes**: Use PascalCase: `WindowManager`, `PluginManager`
- **Variables/Functions**: Use camelCase: `windowManager`, `loadPlugin`
- **Constants**: Use UPPER_SNAKE_CASE: `MAX_WORKERS`, `DEFAULT_TIMEOUT`

### Comments

- Use JSDoc comments for public APIs
- Write clear, concise inline comments for complex logic
- Update comments when changing code

Example:

```typescript
/**
 * Load a plugin by its ID
 * @param pluginId - Unique identifier for the plugin
 * @returns Promise that resolves to true if successful
 */
async loadPlugin(pluginId: string): Promise<boolean> {
  // Implementation
}
```

## Making Changes

### Branch Naming

- Features: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(plugins): add hot-reload support for plugins
fix(worker): resolve memory leak in worker pool
docs(readme): update installation instructions
```

### Best Practices

1. **Keep changes focused**: One feature or fix per PR
2. **Write tests**: Add tests for new features
3. **Update documentation**: Keep docs in sync with code
4. **Follow existing patterns**: Match the style of existing code
5. **Check for errors**: Run linter and build before committing

## Testing

Currently, the project does not have automated tests. When adding tests:

1. Place tests in `__tests__` directories
2. Name test files with `.test.ts` or `.spec.ts` suffix
3. Test both success and error cases
4. Mock external dependencies

Example test structure:

```typescript
describe('PluginManager', () => {
  it('should load a valid plugin', async () => {
    // Test implementation
  });

  it('should reject an invalid plugin', async () => {
    // Test implementation
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**:
   ```bash
   npm run lint
   npm run format:check
   npm run build
   ```

3. **Push changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

### PR Requirements

- [ ] Code follows the project's coding standards
- [ ] Changes are well-documented
- [ ] All checks pass (lint, build)
- [ ] PR description explains what and why
- [ ] Related issues are linked

### PR Review

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Keep the PR focused and manageable

## Plugin Development

See [PLUGINS.md](PLUGINS.md) for detailed plugin development guide.

### Plugin Checklist

- [ ] Plugin has a unique ID
- [ ] `plugin.json` is properly formatted
- [ ] Plugin class implements all lifecycle hooks
- [ ] Resources are cleaned up in `onUnload()`
- [ ] Plugin is documented in a README.md
- [ ] Plugin follows security best practices

## Questions?

- Check existing [Issues](https://github.com/F3v3rish/Universal-electron-application/issues)
- Review [Documentation](README.md)
- Ask in [Discussions](https://github.com/F3v3rish/Universal-electron-application/discussions)

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Git commit history

Thank you for contributing!
