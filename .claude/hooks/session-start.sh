#!/bin/bash
# Instala graphify en las sesiones en la nube (ver CLAUDE.md).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Con [sql] los tabla-*.sql aportan nodos; sin eso `graphify update` no pisa el grafo.
if ! command -v graphify >/dev/null 2>&1; then
  uv tool install 'graphifyy[sql]'
fi

# uv deja los ejecutables en ~/.local/bin.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$CLAUDE_ENV_FILE"
fi
