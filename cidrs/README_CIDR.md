# CIDR automation and verification

This folder contains scripts and initial files to help you maintain an allowlist (whitelist) of crawler IP ranges for AI and search providers.

Files added:
- scripts/update_cidrs.sh - Script that fetches candidate JSONs and extracts CIDRs into files in the `cidrs/` folder.
- cidrs/openai_cidrs.txt - CIDRs extracted for OpenAI (GPTBot / SearchBot / AdsBot).
- cidrs/google_cidrs.txt - CIDRs extracted for Google crawlers.
- cidrs/bing_cidrs.txt - CIDRs extracted for Bing/Bingbot.
- cidrs/anthropic_cidrs.txt - Placeholder for Anthropic (Claude) CIDRs, may be empty if provider doesn't publish JSON.
- cidrs/deepseek_cidrs.txt - Placeholder for DeepSeek (no official published CIDR list known).
- cidrs/all_cidrs.txt - Combined unique list of all discovered CIDRs.

How to use
1. Run the script locally or on a trusted machine that will manage firewall rules:
   ./scripts/update_cidrs.sh

2. Inspect the `cidrs/` files and verify before applying to your firewall or CDN allowlist.

Important security notes
- Always prefer provider-published JSON or official documentation. This script uses heuristic extraction (grep) to find CIDRs in whatever files are fetched, so manual review is required.
- For Google and Bing, DNS verification (reverse+forward lookup) is the most authoritative method for verifying an individual request. See the README below for verification steps.
- Anthropic and DeepSeek may not publish authoritative IP ranges. For those providers, also rely on user-agent checks and behavior patterns.

Automation suggestion
- Run this script on a schedule (cron) and create a deployment step that updates your firewall/CDN allowlist after manual or automated validation.

