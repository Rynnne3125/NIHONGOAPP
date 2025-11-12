#!/usr/bin/env node
/**
 * Simple Kotlin -> TSX stub generator.
 * Usage: node convert_kotlin_to_tsx.js <srcDir> <destDir>
 *
 * Notes:
 * - This generates React Native functional component stubs that preserve directory
 *   structure. It does NOT translate Kotlin logic. Manual porting of behavior is required.
 * - It copies comments at the top of the generated file referencing the original Kotlin file.
 */

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node convert_kotlin_to_tsx.js <srcDir> <destDir>');
  process.exit(1);
}

const [srcDir, destDir] = process.argv.slice(2);
if (!srcDir || !destDir) usage();

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toComponentName(fileName) {
  // Remove extension and non alpha-numeric, then PascalCase
  const base = path.basename(fileName, path.extname(fileName)).replace(/[^a-zA-Z0-9]/g, ' ');
  return base
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Screen';
}

function generateStub(kotlinPath, outPath) {
  const kotlinContent = fs.readFileSync(kotlinPath, 'utf8');
  // try to guess a class name
  const classMatch = kotlinContent.match(/class\s+(\w+)/);
  const compName = classMatch ? classMatch[1] + 'Screen' : toComponentName(kotlinPath);

  const stub = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: Manually port logic from: ${kotlinPath}
// Original file excerpt:
// ----------------------
// ${kotlinContent.split('\n').slice(0,6).map(l => l.replace(/\*/g,'')).join('\n// ')}
// ----------------------

export default function ${compName}() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${compName}</Text>
      <Text style={styles.note}>Ported from ${path.basename(kotlinPath)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  note: { color: '#666' }
});
`;

  ensureDirSync(path.dirname(outPath));
  fs.writeFileSync(outPath, stub, 'utf8');
}

function walkAndConvert(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name.replace(/\.kt$|\.kts$/i, '.tsx'));
    if (e.isDirectory()) {
      walkAndConvert(srcPath, path.join(dest, e.name));
    } else if (e.isFile()) {
      if (/\.kt$|\.kts$/i.test(e.name)) {
        const outFile = destPath;
        generateStub(srcPath, outFile);
        console.log('Wrote', outFile);
      } else {
        // for non-Kotlin files (xml, resources), copy them optionally
        // skip by default
      }
    }
  }
}

const absSrc = path.resolve(srcDir);
const absDest = path.resolve(destDir);
if (!fs.existsSync(absSrc)) {
  console.error('Source directory does not exist:', absSrc);
  process.exit(2);
}
ensureDirSync(absDest);
walkAndConvert(absSrc, absDest);
console.log('Conversion complete. Review generated files in', absDest);
