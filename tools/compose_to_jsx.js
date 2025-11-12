#!/usr/bin/env node
/**
 * Heuristic Jetpack Compose -> React Native JSX converter.
 * It scans Kotlin files for common Compose primitives and emits basic JSX nodes.
 * This is not a full parser—it's meant to improve generated stubs and reduce manual work.
 *
 * Usage: node compose_to_jsx.js <srcKotlinDir> <destRootDir>
 */

const fs = require('fs');
const path = require('path');

function usage() { console.log('Usage: node compose_to_jsx.js <srcKotlinDir> <destRootDir>'); process.exit(1); }
const [srcDir, destRoot] = process.argv.slice(2);
if (!srcDir || !destRoot) usage();

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

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function extractStates(content) {
  const re = /var\s+(\w+)\s+by\s+remember\s*\{\s*mutableStateOf\(([^)]*)\)\s*\}/g;
  const states = [];
  let m;
  while ((m = re.exec(content))) states.push({ name: m[1], value: m[2].trim() });
  return states;
}

function mapLineToJsx(line) {
  line = line.trim();
  if (!line) return null;
  // Image with model url
  let m = line.match(/rememberAsyncImagePainter\(\s*model\s*=\s*"([^"]+)"/);
  if (m) return `  <Image source={{ uri: '${m[1]}' }} style={{ width: 200, height: 200 }} />`;

  // Simple Text("...") or Text(text = "...")
  m = line.match(/Text\(\s*"([^"]+)"\s*\)/);
  if (m) return `  <Text>${m[1]}</Text>`;
  m = line.match(/Text\(.*?text\s*=\s*"([^"]+)"/);
  if (m) return `  <Text>${m[1]}</Text>`;

  // Spacer(modifier = Modifier.height(16.dp))
  m = line.match(/Spacer\(.*?height\s*=\s*(\d+)\.dp/);
  if (m) return `  <View style={{ height: ${m[1]} }} />`;

  // OutlinedTextField -> TextInput (value and onValueChange will be wired by developer)
  if (line.includes('OutlinedTextField(') || line.includes('TextField(')) return `  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />`;

  // Button { Text("...") } or Button(onClick = { ... }) { Text("...") }
  if (line.includes('Button(') || line.startsWith('Button')) return `  <Button title="Action" onPress={() => { /* TODO */ }} />`;

  // IconButton -> TouchableOpacity placeholder
  if (line.includes('IconButton(')) return `  <TouchableOpacity>{/* Icon */}</TouchableOpacity>`;

  // Column/Row/Box map to View containers
  if (line.startsWith('Column(') || line.startsWith('Row(') || line.startsWith('Box(')) return `  <View style={{ /* container */ }}>`;
  if (line.startsWith('}')) return `  </View>`;

  // default: ignore
  return null;
}

function buildJsxFromKotlin(content) {
  const lines = content.split('\n');
  const jsxLines = [];
  for (const l of lines) {
    const mapped = mapLineToJsx(l);
    if (mapped) jsxLines.push(mapped);
  }
  // Wrap in a container
  const body = `    <ScrollView contentContainerStyle={styles.container}>\n${jsxLines.join('\n')}\n    </ScrollView>`;
  return body;
}

function convertFile(kotlinPath, destPath) {
  const content = fs.readFileSync(kotlinPath, 'utf8');
  const states = extractStates(content);

  // find composable name
  const nameMatch = content.match(/@Composable[\s\S]*?fun\s+(\w+)/);
  const comp = nameMatch ? nameMatch[1] : path.basename(kotlinPath, '.kt');
  const compName = comp.replace(/Screen$/, '') + 'Screen';

  let header = `import React, { useState, useEffect } from 'react';\nimport { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';\n\n`;

  header += `// Auto-converted UI from ${kotlinPath}\n// Manual adjustments required.\n\n`;

  header += `export default function ${compName}(props: any) {\n`;
  // states
  for (const s of states) {
    const val = s.value.replace(/^"|"$/g, '');
    header += `  const [${s.name}, set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}] = useState(${val ? `'${val}'` : "''"});\n`;
  }
  if (states.length === 0) header += `  // Add necessary useState hooks here\n`;

  header += `\n  useEffect(() => {\n    // port side-effects here\n  }, []);\n\n`;
  const jsx = buildJsxFromKotlin(content);

  const footer = `\n  return (\n${jsx}\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { padding: 16 },\n});\n`;

  const out = header + footer;
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, out, 'utf8');
}

const files = readAllKotlin(srcDir);
console.log('Converting', files.length, 'files...');
for (const f of files) {
  const rel = path.relative(srcDir, f);
  const dest = path.join(destRoot, rel).replace(/\.kt$/i, '.tsx');
  try { convertFile(f, dest); console.log('Converted', dest); } catch (e) { console.error('Failed', f, e); }
}
console.log('Compose -> JSX conversion complete. Review files under', destRoot);
