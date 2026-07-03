# App Icons

The `icon` parameter in `forge.config.ts` references `./assets/icon` (no extension).
Electron Forge automatically looks for platform-specific formats:

- **macOS**: `icon.icns` (multiple resolutions, 16–1024px)
- **Linux**: `icon.png` (512x512)
- **Windows**: `icon.ico` (multiple resolutions, 16–256px)

## Automated SVG → Icons Workflow

If you have an SVG, the build system can automatically generate all required formats:

### Setup

1. **Place your SVG** at `assets/icon.svg`
   - SVG should be square and ideally at least 1024x1024
   - Make sure it renders well at small sizes (test at 16x16)

2. **Run the icon generator**:
   ```bash
   node scripts/generateIcons.js
   ```

   This will create:
   - `assets/icon.png` (512x512 for Linux)
   - `assets/icon.icns` (macOS, multiple sizes)
   - `assets/icon.ico` (Windows, multiple sizes)

3. **Done!** Your app will now use these icons when you build.

### Example: "A Pretty Lady Kicking" 👧🥋

Create an SVG with that concept, drop it in `assets/icon.svg`, run the generator, and you're all set!

## Manual Icon Creation

If you prefer to create icons manually:

- **ImageMagick** (CLI):
  ```bash
  convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
  convert icon.png icon.icns
  ```

- **Online converters**:
  - png to ico: https://convertio.co/png-ico/
  - png to icns: https://icoconvert.com/

- **macOS native**:
  ```bash
  sips -s format icns icon.png -o icon.icns
  ```

## Current Status

No icon files included yet. App will build with Electron's default icon.
Add `assets/icon.svg` and run `node scripts/generateIcons.js` to customize.
