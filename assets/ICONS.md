# App Icons

The `icon` parameter in `forge.config.ts` references `./assets/icon` (no extension).
Electron Forge automatically looks for platform-specific formats:

- **macOS**: `icon.icns` (1024x1024 recommended)
- **Linux**: `icon.png` (512x512 or larger)
- **Windows**: `icon.ico` (256x256)

## Generating Icons

To create icons from a single source image, use a tool like:

- **ImageMagick** (CLI):
  ```bash
  convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
  convert icon.png icon.icns
  ```

- **Online converters**:
  - png to ico: https://convertio.co/png-ico/
  - png to icns: https://icoconvert.com/

- **macOS native** (if you have a .png):
  ```bash
  sips -s format icns icon.png -o icon.icns
  ```

## Current Status

No icon files are included yet (app will build with Electron's default icon).
Add your icon files here to customize the app appearance on each platform.

## User's Idea: "A Pretty Lady Kicking" 👧🥋

When you're ready, you can create a custom icon based on this concept!
