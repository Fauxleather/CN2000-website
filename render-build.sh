#!/bin/sh
# Render Static Site build: write gitignored config.local.js from env.
# Do not put the real key in git.
printf 'window.CN2000_GEMINI_KEY="%s";\n' "$GEMINI_API_KEY" > config.local.js
