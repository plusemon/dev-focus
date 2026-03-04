# Contributing to DevFocus

Thank you for your interest in contributing to DevFocus! We welcome contributions from the community and are excited to see what you'll build.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- Be respectful and inclusive in all interactions
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Follow the [Development Setup](#development-setup) instructions

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates.

When filing a bug report, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Browser and OS information
- Any error messages from the console

### Suggesting Features

We love new ideas! When suggesting a feature:

- Explain the use case and problem it solves
- Describe how it would work
- Consider potential drawbacks or alternatives
- Be open to discussion and feedback

### Pull Requests

1. Ensure your code follows our [Coding Standards](#coding-standards)
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Update the README.md if your changes affect usage
6. Fill out the pull request template completely

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dev-focus.git
cd dev-focus

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for props, state, and function parameters
- Avoid using `any` type
- Use interface for object shapes, type for unions/complex types

### React Components

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use meaningful component and prop names
- Extract reusable logic into custom hooks

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme and design patterns
- Ensure responsive design for all screen sizes
- Test dark mode appearance

### Code Organization

```
components/     # React components
context/        # React context providers
hooks/          # Custom React hooks
services/       # External service integrations
utils/          # Helper functions
```

### Naming Conventions

- Components: PascalCase (e.g., `TaskCard.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useTimer.ts`)
- Utilities: camelCase (e.g., `cn.ts`)
- Types/Interfaces: PascalCase (e.g., `Task`, `UserSettings`)

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests where appropriate

Examples:
```
Add keyboard shortcut for task creation
Fix drag-and-drop issue in Firefox
Update README with Firebase setup instructions
```

## Submitting Changes

1. Push your branch to your fork
2. Open a Pull Request against the main repository
3. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing performed
4. Wait for review and address any feedback

## Testing

- Write tests for new utilities and hooks
- Ensure existing tests pass before submitting
- Test your changes manually in different browsers
- Verify mobile responsiveness

## Questions?

Feel free to open an issue with the "question" label if you need help or clarification.

Thank you for contributing to DevFocus! 🚀