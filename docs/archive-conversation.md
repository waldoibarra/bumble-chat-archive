# Archive a conversation

Use the scraper to save one manually selected Bumble Web conversation.
Read the deletion warning before running it.

**Rerunning deletes the selected match's directory under `media/`, including its previous `0-conversation.json` archive.**
Back up that directory elsewhere before rerunning if you need its contents.
The archive and browser session contain private data; keep them private.

## Before you start

Use Node.js 24 (see `.nvmrc`) and npm.
The scraper opens a visible Chromium browser; you must log in and select a conversation yourself.

## Run the scraper

1. Install the repository dependencies. The scraper's installation step installs Playwright Chromium.

   ```bash
   npm install
   ```

2. Start the scraper.

   ```bash
   npm run scrape
   ```

3. Log in manually if no browser session exists or the saved session has expired.
4. Open the target conversation and wait until messages are visible.
5. Press Enter in the terminal when the conversation is selected.

The scraper scrolls, extracts messages, recreates the selected match's media directory, and writes the archive.
It considers scrolling complete after three passes without meaningful height changes.
**This stopping rule cannot prove every message loaded.** Check the result against Bumble Web.

## Find the output

The archive is `media/<matchName>/0-conversation.json`, relative to the repository root.
Its `messages` field is a flat array, not groups organized by date.
Each message has an ID, direction, kind, and ISO timestamp derived from a day separator.
**These timestamps are not individual message times.** The extractor subtracts six hours from parsed day separators.
The archive also includes the match name and export time.

Media messages can include images, GIFs, or audio.
The extractor chooses one recognized content type per message; it does not collect multiple attachments.
Downloaded media files use numbered names in the same match directory.
Handled media request failures appear in the JSON with an `unavailable` status; inspect those entries.
Unhandled media file errors can interrupt archiving before the JSON is written.
Writing the archive can also fail.

## Protect the browser session

The scraper saves browser session state to `.auth-state.json` after manual login.
It attempts to reuse that state on later runs.
An expired session requires another manual login.
A malformed storage-state file can prevent browser setup before the manual-login prompt.
**Treat `.auth-state.json` as sensitive:** it may grant access to the account.
The file and `media/` are Git-ignored, but ignoring files does not secure or erase them.
Do not publish either without reviewing their contents and obtaining the relevant consent.

See the [glossary](../GLOSSARY.md) for archive terminology and the [project overview](../README.md) for scope.
