const fs = require('fs');
const path = require('path');

// Read the font file
const fontPath = path.join(__dirname, '../public/fonts/roboto-latin-ext-700-normal.woff');
const fontBuffer = fs.readFileSync(fontPath);
const base64Font = fontBuffer.toString('base64');

// Create the font file for jsPDF
const output = `// Roboto Bold font for jsPDF
// Auto-generated from roboto-latin-ext-700-normal.woff

export const RobotoBoldBase64 = '${base64Font}';
`;

// Write to src/lib/fonts directory
const outputDir = path.join(__dirname, '../src/lib/fonts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'roboto-bold.ts');
fs.writeFileSync(outputPath, output);

console.log('✅ Roboto Bold font converted to base64');
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Size: ${(base64Font.length / 1024).toFixed(2)} KB`);

