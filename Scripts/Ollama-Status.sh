#!/usr/bin/env bash
# Ollama Status Check - macOS/Linux
# Checks Ollama connectivity, lists models, verifies required models.
#
# Usage:
#   ./Ollama-Status.sh              # Check status
#   ./Ollama-Status.sh --pull       # Also pull missing models

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/ollama-models.json"
PULL_MISSING=false

if [[ "${1:-}" == "--pull" ]]; then
    PULL_MISSING=true
fi

# Check config exists
if [[ ! -f "$CONFIG" ]]; then
    echo "Config not found: $CONFIG" >&2
    exit 1
fi

# Parse config with jq or python
if command -v jq &>/dev/null; then
    OLLAMA_URL=$(jq -r '.ollamaUrl' "$CONFIG")
    DEFAULT_MODEL=$(jq -r '.defaultModel' "$CONFIG")
    EMBEDDING_MODEL=$(jq -r '.embeddingModel' "$CONFIG")
    MODELS=$(jq -r '.models[]' "$CONFIG")
elif command -v python3 &>/dev/null; then
    OLLAMA_URL=$(python3 -c "import json; print(json.load(open('$CONFIG'))['ollamaUrl'])")
    DEFAULT_MODEL=$(python3 -c "import json; print(json.load(open('$CONFIG'))['defaultModel'])")
    EMBEDDING_MODEL=$(python3 -c "import json; print(json.load(open('$CONFIG'))['embeddingModel'])")
    MODELS=$(python3 -c "import json; print('\n'.join(json.load(open('$CONFIG'))['models']))")
else
    echo "Error: jq or python3 required" >&2
    exit 1
fi

echo "=== Ollama Status ==="
echo ""

# Check if Ollama is running
echo "Checking Ollama at $OLLAMA_URL ..."
if curl -s --connect-timeout 5 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
    echo "Ollama is running"
else
    echo "Ollama is NOT running or not reachable"
    echo "Start it with: ollama serve"
    exit 1
fi

# List installed models
echo ""
echo "=== Installed Models ==="
INSTALLED=$(curl -s "$OLLAMA_URL/api/tags" | jq -r '.models[].name' 2>/dev/null || echo "")
if [[ -z "$INSTALLED" ]]; then
    echo "No models installed"
else
    echo "$INSTALLED" | while read -r model; do
        echo "  - $model"
    done
fi

# Check required models
echo ""
echo "=== Required Models ==="
MISSING=0
while IFS= read -r model; do
    if echo "$INSTALLED" | grep -q "^${model}"; then
        echo "  [OK] $model"
    else
        echo "  [MISSING] $model"
        MISSING=$((MISSING + 1))
    fi
done <<< "$MODELS"

# Pull missing models if requested
if [[ "$PULL_MISSING" == "true" && "$MISSING" -gt 0 ]]; then
    echo ""
    echo "=== Pulling Missing Models ==="
    while IFS= read -r model; do
        if ! echo "$INSTALLED" | grep -q "^${model}"; then
            echo "Pulling $model ..."
            ollama pull "$model"
        fi
    done <<< "$MODELS"
    echo "Done"
elif [[ "$MISSING" -gt 0 ]]; then
    echo ""
    echo "Run with --pull to download missing models"
fi

# Summary
echo ""
echo "=== Summary ==="
echo "Default model: $DEFAULT_MODEL"
echo "Embedding model: $EMBEDDING_MODEL"
TOTAL=$(echo "$MODELS" | wc -l | tr -d ' ')
echo "Installed: $(echo "$INSTALLED" | grep -c . || echo 0) | Required: $TOTAL | Missing: $MISSING"
