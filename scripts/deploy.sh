#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

for file in css/style.css js/main.js; do
  hash=$(sha1sum "$file" | cut -c1-8)
  sed -i -E "s#(${file})\?v=[0-9a-f]+#\1?v=${hash}#" index.html
done

npx vercel deploy --prod --yes
