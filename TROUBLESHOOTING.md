# Troubleshooting Guide

## VSCode TypeScript Errors: "Cannot find module"

If you see errors in VSCode like "Cannot find module './MessageBubble'" even though the files exist, this is a TypeScript language server cache issue. Here are solutions:

### Solution 1: Restart TypeScript Server (Recommended)
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

### Solution 2: Reload VSCode Window
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Developer: Reload Window`
3. Press Enter

### Solution 3: Delete TypeScript Cache
1. Close VSCode
2. Delete the `.next` folder: `rm -rf .next` (or manually delete it)
3. Delete `tsconfig.tsbuildinfo`: `rm tsconfig.tsbuildinfo`
4. Reopen VSCode

### Solution 4: Verify Build Works
Run the build command to verify everything compiles correctly:
```bash
npm run build
```

If the build succeeds, the code is correct and it's just a VSCode display issue.

## Common Issues

### Module Resolution Errors
If you see "Cannot find module '@/...'":
- Ensure `tsconfig.json` has the correct paths configuration
- Restart the TypeScript server (Solution 1 above)

### Type Errors After npm install
After installing new packages:
1. Restart TypeScript server
2. If that doesn't work, reload the window

### Linting Errors
If ESLint shows errors:
```bash
npm run lint
```

To auto-fix many issues:
```bash
npm run lint -- --fix
```

## Verification Commands

### Check TypeScript Compilation
```bash
npx tsc --noEmit
```
Should exit with code 0 (no errors)

### Check Build
```bash
npm run build
```
Should complete successfully

### Check Linting
```bash
npm run lint
```
Should show no errors or only warnings

## Still Having Issues?

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Clear all caches:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   ```

3. Restart your computer (sometimes helps with file system watchers)

## Known VSCode Issues

- **Slow TypeScript Server**: Large projects can slow down the TS server. Consider increasing VSCode's memory limit.
- **File Watcher Limits**: On Linux, you may need to increase inotify limits.
- **Extension Conflicts**: Disable other TypeScript-related extensions temporarily to test.

## Project-Specific Notes

This project uses:
- Next.js 14 App Router
- TypeScript strict mode
- Path aliases (`@/*` maps to `./src/*`)
- Zustand for state management
- Framer Motion for animations

All imports should work correctly once the TypeScript server is properly initialized.