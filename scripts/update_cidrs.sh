#!/usr/bin/env bash
# scripts/update_cidrs.sh
# Downloads published crawler lists (JSON/other) for several AI/search providers
# and extracts CIDR ranges into cidrs/<provider>_cidrs.txt
# Usage: ./scripts/update_cidrs.sh
# Requires: curl, grep, sort, uniq

set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$DIR/cidrs"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"

# Providers and candidate URLs (some providers may not publish a single canonical JSON)
declare -A URLS
URLS[openai]="https://openai.com/gptbot.json https://openai.com/searchbot.json https://openai.com/adsbot.json"
URLS[google]="https://developers.google.com/crawling/ipranges/common-crawlers.json https://developers.google.com/crawling/ipranges/"
URLS[bing]="https://www.bing.com/toolbox/bingbot.json"
# Anthropic may not publish a stable public JSON; we try common places but expect no result in many cases
URLS[anthropic]="https://claude.ai/claudebot.json https://support.claude.com/claudebot.json https://support.claude.com/anthropic-cidrs.json"
# DeepSeek does not publish official IP ranges; left for manual population
URLS[deepseek]=""

# Generic CIDR regex for IPv4 and IPv6
CIDR_REGEX='([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}|[0-9a-fA-F:]+/[0-9]{1,3}'

fetch_and_extract() {
  local provider="$1"
  local out="$OUT_DIR/${provider}_cidrs.txt"
  : > "$out"

  for url in ${URLS[$provider]}; do
    if [[ -z "$url" ]]; then
      continue
    fi
    echo "Fetching $url ..."
    if curl -fsS --max-time 30 "$url" -o "$TMP_DIR/${provider}.$(basename ${url})"; then
      grep -Eo "$CIDR_REGEX" "$TMP_DIR/${provider}.$(basename ${url})" || true
    else
      echo "  (no response from $url)" >&2
    fi
  done | sort -u > "$out" || true

  # If file is empty, add explanatory comment
  if [[ ! -s "$out" ]]; then
    echo "# No CIDRs discovered automatically for $provider. Check provider documentation or add CIDRs manually." > "$out"
  fi
}

# Run for each provider
for provider in "openai" "google" "bing" "anthropic" "deepseek"; do
  echo "Processing $provider"
  fetch_and_extract "$provider"
done

# create combined list
COMBINED="$OUT_DIR/all_cidrs.txt"
grep -hv '^#' "$OUT_DIR"/*_cidrs.txt | sort -u > "$COMBINED" || true
if [[ ! -s "$COMBINED" ]]; then
  echo "# No CIDRs collected. Please run the script and inspect individual provider files." > "$COMBINED"
fi

echo "CIDR update complete. Files in: $OUT_DIR"

# Print summary
for f in "$OUT_DIR"/*_cidrs.txt; do
  echo "---- $f ----"
  sed -n '1,20p' "$f" || true
done
