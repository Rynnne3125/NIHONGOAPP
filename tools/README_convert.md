Kotlin -> TSX conversion helper
=================================

What this does
---------------
This repository includes a simple Node.js script `convert_kotlin_to_tsx.js` that will walk a source folder containing Kotlin files and generate React Native .tsx stub files that preserve the directory structure. It does not attempt to translate Kotlin/Android APIs; it only creates component placeholders and copies the first few lines of the original file as a comment so you can manually port functionality.

How to use
----------
1. Copy the Kotlin source tree you want converted into the workspace. Example recommended location:

   D:\Android\Projects\NIHONGOAPP\import_kotlin\app\src\main\java\com\example\nihongo

2. Run the converter from project root (PowerShell):

```powershell
npm run gen:tsx -- <src> <dest>
# or directly
node ./tools/convert_kotlin_to_tsx.js ./import_kotlin/app/src/main/java/com/example/nihongo ./src/generated_kotlin_tsx
```

Example:

```powershell
# copy the kotlin tree into the workspace first, then
node ./tools/convert_kotlin_to_tsx.js .\import_kotlin\app\src\main\java\com\example\nihongo .\src\generated_kotlin_tsx
```

3. After the script finishes, review the generated files under `src/generated_kotlin_tsx`. Manually port behavior, UI and wiring to React Native. The generated files are stubs named like `SomeActivity.kt` -> `SomeActivity.tsx` and default to a `<ComponentName>Screen` export.

Limitations and next steps
--------------------------
- This script cannot translate Kotlin Android lifecycle, view XML layouts, or Android-specific APIs. It only provides a starting point.
- You'll need to port XML layouts into JSX, replace Android resource references (R.drawable...) with require(...) or asset imports, and implement navigation, state and business logic.
- Once you confirm the generated structure is acceptable, I can help port key screens (User and Admin) manually, mapping layouts and logic to React Native idioms.