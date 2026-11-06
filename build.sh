#!/bin/sh
# Baut das XPI aus dem Quellverzeichnis. werkzeuge/ und katalog/ bleiben draussen.
set -eu
cd "$(dirname "$0")"
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
OUT="eisenhower-matrix-$VERSION.xpi"
rm -f "$OUT"
zip -q -r -X "$OUT" \
    manifest.json quadrants.js background.js \
    matrix.html matrix.css matrix.js \
    _locales \
    icons/matrix.svg icons/eisenhower-32.png icons/eisenhower-64.png icons/eisenhower-128.png \
    LICENSE \
    -x '*.swp' '.*'
echo "$OUT gebaut ($(du -h "$OUT" | cut -f1))"
