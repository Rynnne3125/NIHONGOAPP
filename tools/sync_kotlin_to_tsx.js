#!/usr/bin/env node
/**
 * Sync Kotlin files from an imported Android source tree into src/App as .tsx files.
 * This is a best-effort converter: it creates React Native TSX component stubs, converts
 * simple Jetpack Compose state patterns into useState, and preserves the original Kotlin
 * content as comments for manual porting.
 *
 * Usage: node sync_kotlin_to_tsx.js <srcKotlinDir> <destRootDir>
 */

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node sync_kotlin_to_tsx.js <srcKotlinDir> <destRootDir>');
  process.exit(1);
}

const [srcDir, destRoot] = process.argv.slice(2);
if (!srcDir || !destRoot) usage();

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function readAllKotlin(src) {
  const out = [];
  function walk(p) {
    const items = fs.readdirSync(p, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(p, it.name);
      if (it.isDirectory()) walk(full);
      else if (/\.kt$/.test(it.name)) out.push(full);
    }
  }
  walk(src);
  return out;
}

function parseComposable(content) {
  // find @Composable fun NAME(params) { ... }
  const compRegex = /@Composable[\s\S]*?fun\s+(\w+)\s*\(([^)]*)\)/g;
  const comps = [];
  let m;
  while ((m = compRegex.exec(content))) {
    comps.push({ name: m[1], params: m[2].trim() });
  }
  return comps;
}

function extractRememberStates(content) {
  // var foo by remember { mutableStateOf("") }
  const stateRegex = /var\s+(\w+)\s+by\s+remember\s*\{\s*mutableStateOf\(([^)]*)\)\s*\}/g;
  const states = [];
  let m;
  while ((m = stateRegex.exec(content))) {
    states.push({ name: m[1], value: m[2].trim() });
  }
  return states;
}

function kotlinToTsx(kotlinPath, kotlinContent, destPath) {
  const comps = parseComposable(kotlinContent);
  const states = extractRememberStates(kotlinContent);

  const headerComment = `// Ported (automatically) from: ${kotlinPath}\n// Manual review required. Original Kotlin excerpt:\n`;
  const excerpt = kotlinContent.split('\n').slice(0, 20).map(l => '// ' + l).join('\n');

  let body = '';
  if (comps.length > 0) {
    // create one file exporting first composable as default
    const c = comps[0];
    const compName = c.name.replace(/Screen$/, '') + 'Screen';
    const props = c.params || '';

    const propLines = [];
    if (props.includes('NavController') || /navController/.test(kotlinContent)) {
      propLines.push('navigation: any');
    }
    if (props.match(/UserRepository|userRepo/)) {
      propLines.push('userRepo?: any');
    }

    body += `import React, { useState, useEffect } from 'react';\n`;
    body += `import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet } from 'react-native';\n\n`;
    body += `// ${headerComment}\n${excerpt}\n\n`;
    body += `type Props = { ${propLines.join('; ')} };\n\n`;
    body += `export default function ${compName}(props: Props) {\n`;

    // states
    states.forEach(s => {
      const val = s.value.replace(/^"|"$/g, '');
      body += `  const [${s.name}, set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}] = useState(${val ? `'${val}'` : "''"});\n`;
    });
    if (states.length === 0) body += `  // Add state hooks converted from remember/mutableStateOf here\n`;

    body += `\n  useEffect(() => {\n    // TODO: convert LaunchedEffect and other lifecycle logic\n  }, []);\n\n`;
    body += `  return (\n    <ScrollView contentContainerStyle={styles.container}>\n      <Text style={styles.title}>${compName}</Text>\n      <Text style={styles.note}>Auto-generated stub. Manual port required.</Text>\n    </ScrollView>\n  );\n}\n\n`;
    body += `const styles = StyleSheet.create({\n  container: { padding: 16 },\n  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },\n  note: { color: '#666' }\n});\n`;
  } else {
    // no composable: produce a module or utility stub
    body += `// ${headerComment}\n${excerpt}\n\n`;
    body += `export default {} as any;\n`;
  }

  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, body, 'utf8');
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const kotlinFiles = readAllKotlin(srcDir);
console.log('Found', kotlinFiles.length, 'Kotlin files.');
for (const kf of kotlinFiles) {
  const rel = path.relative(srcDir, kf);
  const dest = path.join(destRoot, rel).replace(/\.kt$/i, '.tsx');
  try {
    const content = fs.readFileSync(kf, 'utf8');
    kotlinToTsx(kf, content, dest);
    console.log('Wrote', dest);
  } catch (err) {
    console.error('Error processing', kf, err);
  }
}

console.log('Sync complete. Review files under', destRoot);
