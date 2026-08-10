#!/bin/bash
set -e
CLIENT_DIR="dist/client"
ASSETS_DIR="$CLIENT_DIR/assets"
JS_FILE=$(ls $ASSETS_DIR/index-*.js 2>/dev/null | head -1 | sed 's|dist/client/||')
CSS_FILE=$(ls $ASSETS_DIR/app-*.css 2>/dev/null | head -1 | sed 's|dist/client/||')
cat > "$CLIENT_DIR/index.html" << EOF
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/$CSS_FILE">
<script type="module" src="/$JS_FILE"></script>
</head>
<body><div id="root"></div></body>
</html>
EOF
echo "Generated index.html ($JS_FILE / $CSS_FILE)"
