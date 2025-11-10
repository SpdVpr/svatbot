const fs = require('fs');
const path = require('path');

// Fonts to convert
const fonts = [
  {
    name: 'Roboto-Regular',
    input: '../public/fonts/Roboto-Regular.ttf',
    output: 'roboto-regular.ts',
    exportName: 'Roboto_Regular_base64'
  },
  {
    name: 'Roboto-Bold',
    input: '../public/fonts/Roboto-Bold.ttf',
    output: 'roboto-bold.ts',
    exportName: 'Roboto_Bold_base64'
  }
];

// Create output directory
const outputDir = path.join(__dirname, '../src/lib/fonts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert each font
for (const font of fonts) {
  try {
    // Read the font file
    const fontPath = path.join(__dirname, font.input);
    if (!fs.existsSync(fontPath)) {
      console.error(`❌ Font file not found: ${fontPath}`);
      continue;
    }

    const fontBuffer = fs.readFileSync(fontPath);
    const base64Font = fontBuffer.toString('base64');

    // Create the font file for jsPDF
    const output = `// ${font.name} font for jsPDF
// Auto-generated from ${font.input}
// Generated on ${new Date().toISOString()}

export const ${font.exportName} = '${base64Font}';
`;

    const outputPath = path.join(outputDir, font.output);
    fs.writeFileSync(outputPath, output);

    console.log(`✅ ${font.name} font converted to base64`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Size: ${(base64Font.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.error(`❌ Error converting ${font.name}:`, error.message);
  }
}

// Create index file
const indexContent = `// Auto-generated font exports
export { Roboto_Regular_base64 } from './roboto-regular';
export { Roboto_Bold_base64 } from './roboto-bold';
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
console.log('✅ Generated index.ts');
console.log('\n🎉 All fonts converted successfully!');

