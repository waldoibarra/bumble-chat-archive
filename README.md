# Bumble Chat Archive

One-time, professional-grade archiver for exporting a full Bumble Web conversation (messages + media) before the web app is discontinued.

## How it works

1. Launches Bumble Web in Playwright
2. Uses a persisted browser session (no repeated logins)
3. Automatically scrolls the entire conversation to load all messages
4. Extracts messages grouped by day
5. Downloads images and GIFs locally
6. Outputs a UI-ready JSON archive

## Usage

```bash
npm install

npm run scrape
```

## First run

- Browser opens
- Log in to Bumble manually
- Open the target conversation
- Press ENTER on the terminal
- Session is saved to `.auth-state.json`

## Subsequent runs

- Browser opens already authenticated
- No manual login required

## Output

`conversation.json`

Structured archive grouped by day, suitable for rendering in any UI.

`media/`

Downloaded images and GIFs, organized by conversation date.

Deleted or unavailable media (expired CDN URLs) are skipped safely.

## Notes & limitations

- Bumble Web does not expose message timestamps (only day separators)
- Only one image or GIF is expected per message
- This script is designed for archival, not automation at scale
- No credentials are stored — only browser session state

## Why Playwright + manual login?

This avoids:

- Credential scraping
- MFA breakage
- Account risk

It also aligns with Playwright best practices for authenticated apps.
