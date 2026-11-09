#!/usr/bin/env bash
# Headless screenshots for visual checks (uses the installed Chrome; temporary profile in _workbench).
# Usage: tools/snap.sh <out.png> <url> [width] [height] [wait_ms]
OUT="$1"; URL="$2"; W="${3:-1280}"; H="${4:-900}"; WAIT="${5:-8000}"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PROFILE="D:/SpaceLegacy/_workbench/chrome-profile-$$"
rm -f "$OUT"
timeout 90 "$CHROME" --headless=new --no-first-run --no-default-browser-check --hide-scrollbars \
  --user-data-dir="$PROFILE" --window-size="$W,$H" --virtual-time-budget="$WAIT" \
  --use-angle=swiftshader --enable-unsafe-swiftshader \
  --screenshot="$OUT" "$URL" >/dev/null 2>&1
rm -rf "$PROFILE"
ls -la "$OUT" 2>/dev/null || echo "no screenshot written"
