#!/bin/bash
set -e

# Path to conflicted file
FILE_PATH="src/components/RequestModal/MovieRequestModal.tsx"

# Create temporary directory
TEMP_DIR=$(mktemp -d)

# Get upstream version (theirs)
git show REBASE_HEAD:$FILE_PATH > $TEMP_DIR/theirs.tsx

# Create merged file
echo "// Automatically merged by GitHub Actions" > $TEMP_DIR/merged.tsx

# Add imports from our version (add anime constants)
grep -A 20 "import " $FILE_PATH | grep -B 20 "from 'swr'" > $TEMP_DIR/our_imports.tsx
cat $TEMP_DIR/our_imports.tsx > $TEMP_DIR/merged.tsx

# Add rest of the file from their version
grep -A 1000 "const messages = defineMessages" $TEMP_DIR/theirs.tsx >> $TEMP_DIR/merged.tsx

# Add isAnime definition (after data declaration, before useEffect)
sed -i '/const { data: quota } =/a\
\n  const isAnime = data?.keywords.some(\n    (keyword) => keyword.id === ANIME_KEYWORD_ID\n  );' $TEMP_DIR/merged.tsx

# Add isAnime to sendRequest dependencies array
sed -i 's/hasPermission,/hasPermission,\n    isAnime,/' $TEMP_DIR/merged.tsx

# Add isAnime to request parameters
sed -i '/mediaType: '\''movie'\'',/a\        isAnime,' $TEMP_DIR/merged.tsx

# Add isAnime prop to AdvancedRequester component
sed -i 's/<AdvancedRequester\n          type="movie"\n          is4k={is4k}/<AdvancedRequester\n          type="movie"\n          is4k={is4k}\n          isAnime={isAnime}/' $TEMP_DIR/merged.tsx

# Copy the merged file back
cp $TEMP_DIR/merged.tsx $FILE_PATH

# Add the file to mark as resolved
git add $FILE_PATH

echo "MovieRequestModal.tsx conflict resolved with smart merge"
