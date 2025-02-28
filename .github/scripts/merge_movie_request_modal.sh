#!/bin/bash
set -e

echo "Starting smart merge for MovieRequestModal.tsx"

# Path to conflicted file
FILE_PATH="src/components/RequestModal/MovieRequestModal.tsx"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temp directory: $TEMP_DIR"

# Get "theirs" version (upstream)
git show REBASE_HEAD:$FILE_PATH > $TEMP_DIR/theirs.tsx
echo "Extracted 'theirs' version to $TEMP_DIR/theirs.tsx"

# Get "ours" version with our changes
git show :2:$FILE_PATH > $TEMP_DIR/ours.tsx
echo "Extracted 'ours' version to $TEMP_DIR/ours.tsx"

# Make sure imports include ANIME_KEYWORD_ID
if ! grep -q "ANIME_KEYWORD_ID" $TEMP_DIR/theirs.tsx; then
    echo "Adding ANIME_KEYWORD_ID import"
    sed -i '/import { MediaStatus } from/i import { ANIME_KEYWORD_ID } from '\''@server/api/themoviedb/constants'\'';' $TEMP_DIR/theirs.tsx
fi

# Create merged file starting from "theirs" version
cp $TEMP_DIR/theirs.tsx $TEMP_DIR/merged.tsx
echo "Created base merged file from 'theirs' version"

# Check if isAnime definition exists, add if missing
if ! grep -q "const isAnime" $TEMP_DIR/merged.tsx; then
    echo "Adding isAnime definition"
    sed -i '/const { data: quota }/a \
\n  const isAnime = data?.keywords.some(\n    (keyword) => keyword.id === ANIME_KEYWORD_ID\n  );' $TEMP_DIR/merged.tsx
fi

# Check if isAnime is in sendRequest dependencies, add if missing
if ! grep -q "isAnime," $TEMP_DIR/merged.tsx; then
    echo "Adding isAnime to dependencies array"
    sed -i '/\] = useState<RequestOverrides/,/}, \[/ {
        s/intl,/intl,\n    isAnime,/g
    }' $TEMP_DIR/merged.tsx
fi

# Check if isAnime is in request parameters, add if missing
if ! grep -q "isAnime," $TEMP_DIR/merged.tsx; then
    echo "Adding isAnime to request parameters"
    sed -i '/mediaType: '\''movie'\'',/ {
        s/mediaType: '\''movie'\'',/mediaType: '\''movie'\'',\n        isAnime,/g
    }' $TEMP_DIR/merged.tsx
fi

# Add isAnime prop to AdvancedRequester component
if ! grep -q "isAnime={isAnime}" $TEMP_DIR/merged.tsx; then
    echo "Adding isAnime prop to AdvancedRequester"
    sed -i '/<AdvancedRequester.*type="movie"/,/onChange=/ {
        s/is4k={is4k}/is4k={is4k}\n          isAnime={isAnime}/g
    }' $TEMP_DIR/merged.tsx
fi

# Copy the merged file back
cp $TEMP_DIR/merged.tsx $FILE_PATH
echo "Copied merged file back to $FILE_PATH"

# Add the file to mark as resolved
git add $FILE_PATH
echo "Added resolved file to git"

echo "MovieRequestModal.tsx conflict resolved with smart merge"
