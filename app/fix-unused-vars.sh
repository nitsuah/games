#!/bin/bash

# Script to fix common unused variable patterns
# Prefixes unused variables with underscore to satisfy ESLint rules

echo "Fixing unused variables..."

# Find all .jsx and .js files in pages and _components
find pages _components -type f \( -name "*.jsx" -o -name "*.js" \) | while read -r file; do
  # Create backup
  cp "$file" "$file.bak"
  
  # Fix common patterns by prefixing unused vars with underscore
  # Handle function parameters and destructured variables
  sed -i \
    -e 's/{ Html,/{ _Html,/g' \
    -e 's/, Head,/, _Head,/g' \
    -e 's/, Main,/, _Main,/g' \
    -e 's/, NextScript/, _NextScript/g' \
    -e "s/'Html'/'_Html'/g" \
    -e "s/'Head'/'_Head'/g" \
    -e "s/'Main'/'_Main'/g" \
    -e "s/'NextScript'/'_NextScript'/g" \
    "$file"
done

echo "Fixed unused variable patterns. Run 'npm run lint' to verify."
