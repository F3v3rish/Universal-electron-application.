# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Electron 28.x
- TypeScript 5.x
- All development dependencies

### 2. Build the Application

```bash
npm run build
```

This compiles:
- Main process TypeScript → `dist/main/`
- Renderer process TypeScript → `dist/renderer/`
- Preload script TypeScript → `dist/preload/`
- Worker scripts TypeScript → `dist/main/workers/`

### 3. Run the Application

```bash
npm start
```

The application window will open showing:
- System information (CPU, memory, worker pool status)
- Worker thread test button
- Loaded plugins list
- Architecture features

## 🎨 What You'll See

The application opens with a beautiful gradient UI displaying:

1. **System Information Panel**
   - Platform, architecture, Node/Electron versions
   - CPU core count
   - Memory usage
   - Worker pool status
   - Child process count

2. **Worker Thread Test**
   - Click "Run Worker Task" to test the worker pool
   - See real-time results from parallel computation

3. **Plugin List**
   - Example plugin is pre-loaded
   - Shows plugin metadata

4. **Architecture Overview**
   - Lists all implemented features

## 📝 Next Steps

### Try the Worker Pool

Click the "Run Worker Task" button to see the worker pool in action. It will:
1. Submit a task to compute the sum of [1,2,3,4,5,6,7,8,9,10]
2. Worker thread processes it
3. Result appears in the output box

### Create Your First Plugin

1. Create a directory: `plugins/my-plugin/`
2. Add `plugin.json`:
   ```json
   {
     "id": "my-plugin",
     "name": "My Plugin",
     "version": "1.0.0",
     "description": "My first plugin",
     "mainEntry": "index.js"
   }
   ```
3. Add `index.js`:
   ```javascript
   class MyPlugin {
     async onLoad() {
       console.log('My plugin loaded!');
     }
     async onActivate() {
       console.log('My plugin activated!');
     }
   }
   module.exports = MyPlugin;
   ```
4. Restart the application
5. Your plugin will appear in the plugins list!

### Add Custom Worker Tasks

Edit `src/workers/base-worker.ts` and add:

```typescript
registerTaskHandler('my-task', async (data: { numbers: number[] }) => {
  // Your computation here
  const sum = data.numbers.reduce((a, b) => a + b, 0);
  return { sum, count: data.numbers.length };
});
```

Rebuild with `npm run build` and submit the task from renderer!

## 🛠️ Development Workflow

### Watch Mode (Recommended)

```bash
# Terminal 1: Auto-rebuild on file changes
npm run watch

# Terminal 2: Run the application
npm start
```

### Individual Builds

```bash
npm run build:main      # Build main process only
npm run build:renderer  # Build renderer only
npm run build:preload   # Build preload only
```

## 📚 Documentation

- **README.md** - Overview and architecture
- **ARCHITECTURE.md** - Deep technical details
- **USAGE.md** - Complete API reference and examples
- **ROADMAP.md** - Future enhancement ideas

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Build everything
npm run build

# Start application
npm start

# Development mode
npm run dev

# Watch mode (auto-rebuild)
npm run watch

# Package for distribution
npm run package
```

## 🎯 Key Concepts

### Single Window Architecture
Everything runs in one main window. No popup windows, no separate windows. All functionality is accessible from the main UI.

### Worker Threads
CPU-intensive tasks run in parallel worker threads. The pool automatically scales to your CPU core count.

### Child Processes
Heavy or isolated tasks can run in separate Node.js processes for better isolation and performance.

### Plugins
Add functionality by dropping plugins into the `plugins/` directory. They're automatically discovered and loaded.

### IPC Communication
Renderer communicates with main process via secure IPC using `window.electronAPI`. All communications are type-safe.

## 🐛 Troubleshooting

### Application won't start?
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
npm start
```

### TypeScript errors?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
- Check Node.js version (18+ required)
- Verify all dependencies installed
- Check for TypeScript compilation errors

## 💡 Tips

1. **Use watch mode** during development for instant feedback
2. **Check the console** for detailed logs and error messages
3. **Start with the example plugin** to understand the structure
4. **Read USAGE.md** for complete API documentation
5. **Profile with DevTools** - Press Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)

## 🎓 Learning Path

1. ✅ Run the application (you're here!)
2. 📖 Read ARCHITECTURE.md to understand the design
3. 🔨 Create a simple plugin
4. ⚡ Add a custom worker task
5. 🚀 Build something awesome!

## 📞 Need Help?

- Check USAGE.md for API reference
- Review ARCHITECTURE.md for technical details
- Look at the example plugin in `plugins/example-plugin/`
- Check the inline code comments

## 🎉 You're Ready!

The application is running and ready for customization. Start by:
- Exploring the UI
- Creating a simple plugin
- Adding worker tasks
- Building your dream application!

---

**Pro Tip**: Open DevTools (F12) to see detailed logs of everything happening in the application!
