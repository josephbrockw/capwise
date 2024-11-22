#!/bin/bash

# Function to check if a file contains JSX
contains_jsx() {
    grep -l "React\|jsx\|<.*>.*<\/.*>\|<.*\/>" "$1" > /dev/null
}

# Find all .js files in src directory
find src -name "*.js" | while read file; do
    # Skip test files and setup files
    if [[ $file == *".test.js" ]] || [[ $file == *"setupTests.js" ]] || [[ $file == *"reportWebVitals.js" ]]; then
        continue
    fi

    # Check if file contains JSX
    if contains_jsx "$file"; then
        # Create the new filename
        newfile="${file%.js}.jsx"

        # Rename the file
        mv "$file" "$newfile"
        echo "Renamed $file to $newfile"

        # Update imports in all files
        old_import="${file%.js}"
        new_import="${old_import}.jsx"
        find src -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|${old_import}|${new_import}|g" {} +
    fi
done

# Update index.html to point to index.jsx
sed -i '' 's|/src/index.js|/src/index.jsx|g' index.html
