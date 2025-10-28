#!/bin/bash
cd /mnt/c/Users/ajhar/code/games/app
find . -type f \( -name "*.jsx" -o -name "*.js" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./coverage/*" | while read file; do
  # Remove standalone React imports
  sed -i "/^import React from 'react';*/d" "$file"
  # Fix imports with hooks - remove "React, " from destructured imports
  sed -i "s/import React, { /import { /g" "$file"
done
echo "Fixed React imports"
