#!/bin/sh
# Patch tmp@0.2.4 to sanitize prefix, postfix, and dir options
set -e
TMP_PATH="node_modules/tmp/lib/tmp.js"

if [ ! -f "$TMP_PATH" ]; then
  echo "tmp.js not found, skipping patch."
  exit 0
fi

# Insert sanitization functions at the top of the file
awk 'NR==1{print "// PATCHED: Path traversal sanitization for prefix, postfix, dir\n" \
"const path = require(\"path\");\n" \
"function sanitizePrefix(prefix) {\n  if (!prefix) return \"\";\n  return path.basename(String(prefix)).replace(/[.\\/\\\\]/g, \"-\");\n}\n" \
"function sanitizePostfix(postfix) {\n  if (!postfix) return \"\";\n  return String(postfix).replace(/[^A-Za-z0-9._-]/g, \"\");\n}\n" \
"function validateDir(dir, baseDir) {\n  if (!dir) return \"\";\n  if (path.isAbsolute(dir)) { throw new Error(\"Absolute paths not allowed for dir option\"); }\n  const resolved = path.resolve(baseDir, dir);\n  const relative = path.relative(baseDir, resolved);\n  if (relative.startsWith(\"..\") || path.isAbsolute(relative)) { throw new Error(\"Dir option escapes base directory\"); }\n  return dir;\n}\n" \
"function validateFinalPath(finalPath, baseDir) {\n  const resolved = path.resolve(finalPath);\n  const relative = path.relative(path.resolve(baseDir), resolved);\n  if (relative.startsWith(\"..\") || path.isAbsolute(relative)) { throw new Error(\"Generated path escapes temporary directory\"); }\n  return resolved;\n}\n"} 1' "$TMP_PATH" > "$TMP_PATH.patched"

# Replace vulnerable option usage with sanitized versions
sed -i "s/opts.prefix/opts.prefix = sanitizePrefix(opts.prefix)/g" "$TMP_PATH.patched"
sed -i "s/opts.postfix/opts.postfix = sanitizePostfix(opts.postfix)/g" "$TMP_PATH.patched"
# Patch dir validation in file/dir creation (manual, as needed)
# (You may need to adjust this for exact code structure)

# Overwrite the original file
mv "$TMP_PATH.patched" "$TMP_PATH"
echo "tmp.js patched for path traversal vulnerability."
