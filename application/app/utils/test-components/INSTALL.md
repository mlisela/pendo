# Installation Guide - Pendo Test Components

## Prerequisites

The Pendo test components require React to be installed in your project.

## Installation Steps

### 1. Install Dependencies

These test components are designed to be used in a React application. Ensure you have the following installed:

```bash
npm install --save-dev @types/react @types/react-dom
npm install react react-dom
```

Or if using yarn:

```bash
yarn add --dev @types/react @types/react-dom
yarn add react react-dom
```

### 2. Install Testing Dependencies (Optional)

For automated tests:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 3. TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "lib": ["DOM", "ES2020"],
    "types": ["node"]
  }
}
```

### 4. Verify Installation

Run the linter to check for errors:

```bash
npx tsc --noEmit
```

All test component files should compile without errors once React types are installed.

## Troubleshooting

### Error: "Cannot find module 'react'"

**Solution:** Install React and its type definitions:
```bash
npm install --save-dev @types/react @types/react-dom
npm install react react-dom
```

### Error: "JSX element implicitly has type 'any'"

**Solution:** Add React types to your tsconfig.json:
```json
{
  "compilerOptions": {
    "jsx": "react",
    "types": ["node"]
  }
}
```

### Error: Cannot find '@testing-library/react'

**Solution:** Install testing library:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## Project Setup (If Starting Fresh)

If you're setting up a new project, use the provided `package.json`:

```bash
cd application
npm install
```

The `package.json` includes all necessary dependencies:
- `react` and `react-dom` for components
- `@types/react` and `@types/react-dom` for TypeScript
- `@testing-library/react` for testing
- `typescript` for compilation

## Usage Without Installation

If you don't want to install React in this utility project, you can:

1. **Copy files to your React project**
   ```bash
   cp -r application/app/utils/test-components /path/to/your/react-app/src/
   ```

2. **Use them in your existing React app** where React is already installed

## Next Steps

Once dependencies are installed:

1. ✅ Run tests: `npm test -- PendoTestComponents.spec.tsx`
2. ✅ Check types: `npx tsc --noEmit`
3. ✅ Use components in your app
4. ✅ Run CI script: `node app/scripts/verify-pendo-ci.js`

## Notes

- These components are designed for **development/testing only**
- They require a React environment to run
- The main verification utility (`verifyPendoData.ts`) works standalone without React
- Test components are **optional** - the core utility can be used independently

## Support

If you encounter issues:
- Verify React is installed: `npm list react`
- Check TypeScript config: `cat tsconfig.json`
- Review error messages carefully
- Consult the main `README.md` for more details

