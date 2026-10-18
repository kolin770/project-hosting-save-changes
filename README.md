# AI Indexing & Publication

This repository is set up to make lev-tech.net discoverable to search engines and AI crawlers.

What I changed:
- robots.txt: now explicitly allows GPTBot, OAI-SearchBot, Googlebot, GoogleOther, and Bingbot, and includes the sitemap URL.
- llms.txt: updated to reflect indexing policies and sitemap location.
- scripts/ and cidrs/: contain helper scripts and CIDR files to help maintain firewall allowlists for crawlers (manual review required).

Next recommended steps:
1. Deploy robots.txt and sitemap.xml to the root of https://lev-tech.net/ so crawlers can find them.
2. Register/submit the sitemap in Google Search Console and Bing Webmaster to accelerate indexing.
3. Optionally run the scripts/update_cidrs.sh and review cidrs/* files before applying to your firewall or CDN allowlist.

If you want, I can also:
- Prepare a pull request / branch instead of pushing directly to main.
- Create example Cloudflare rules or AWS Security Group JSON based on the CIDRs we discover.
