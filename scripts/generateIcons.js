#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SVG_FILE = path.join(ASSETS_DIR, 'icon.svg');
const PNG_512 = path.join(ASSETS_DIR, 'icon.png');
const PNG_256 = path.join(ASSETS_DIR, 'icon-256.png');
const ICNS_FILE = path.join(ASSETS_DIR, 'icon.icns');
const ICO_FILE = path.join(ASSETS_DIR, 'icon.ico');
const TEMP_DIR = path.join(ASSETS_DIR, '.temp-icons');

async function generateIcons() {
  try {
    if (!fs.existsSync(SVG_FILE)) {
      console.error(`Error: ${SVG_FILE} not found`);
      console.error('Please create an icon.svg file in the assets/ directory');
      process.exit(1);
    }

    console.log('🎨 Generating icons from SVG...');

    // Create temp directory
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Generate PNG at 512x512 for Linux
    console.log('  → Generating Linux icon (512x512)...');
    await sharp(SVG_FILE).png().resize(512, 512).toFile(PNG_512);

    // Generate PNG at 256x256 for backup
    console.log('  → Generating 256x256 icon...');
    await sharp(SVG_FILE).png().resize(256, 256).toFile(PNG_256);

    // Try to generate .ico and .icns using ImageMagick (convert command)
    try {
      // Generate Windows .ico from 256x256 PNG
      console.log('  → Generating Windows icon (.ico)...');
      execSync(`convert "${PNG_256}" -define icon:auto-resize=256,128,96,64,48,32,16 "${ICO_FILE}"`);
    } catch (err) {
      console.warn('    ⚠ ImageMagick not found. Skipping .ico generation.');
      console.warn('    Install ImageMagick (brew install imagemagick) to auto-generate .ico files.');
    }

    try {
      // Generate macOS .icns from 512x512 PNG
      console.log('  → Generating macOS icon (.icns)...');
      // Using sips on macOS
      if (process.platform === 'darwin') {
        execSync(`sips -s format icns "${PNG_512}" -o "${ICNS_FILE}"`);
      } else {
        // On Linux, try convert if available
        execSync(`convert "${PNG_512}" "${ICNS_FILE}"`);
      }
    } catch (err) {
      console.warn('    ⚠ Icon generation tool not found. Skipping .icns generation.');
      console.warn('    On macOS: sips is built-in');
      console.warn('    On Linux/Windows: install ImageMagick (apt install imagemagick / brew install imagemagick)');
    }

    // Cleanup temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true });
    }

    console.log('✅ PNG icons generated successfully!');
    console.log(`   📱 ${PNG_512} (Linux)`);
    console.log(`   🍎 ${ICNS_FILE} (macOS - generated if sips/convert available)`);
    console.log(`   🪟 ${ICO_FILE} (Windows - generated if convert available)`);
    console.log(
      '\n💡 For guaranteed .ico/.icns generation, install ImageMagick: https://imagemagick.org/script/download.php'
    );
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
