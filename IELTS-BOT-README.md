# 📖 IELTS Daily Digest Bot

A Node.js automation script that fetches fresh articles every morning from 4 RSS sources,
selects 3 articles by progressive IELTS band level, extracts vocabulary, and sends a
beautifully formatted HTML digest to your Gmail inbox.

---

## Features

- **4 RSS sources** mapped to Band 6.0 → 7.5
- **3 articles per day** (one per band level for progressive difficulty)
- **No repeats** — tracks sent articles in `sent-articles.json`
- **5 IELTS vocabulary words** extracted per article
- **Daily practice question** rotates across 5 IELTS question types
- **HTML email** with 30-minute reading routine table and article cards
- **Scheduled** via node-cron (configurable via `.env`)
- **`--now` flag** to send immediately for testing

---

## Prerequisites

- Node.js 18 or later
- A Gmail account with **2-Step Verification** enabled
- A **Gmail App Password** (not your regular Gmail password)

---

## Setup

### 1. Enter the project directory

```bash
cd skills-introduction-to-github
```

### 2. Install dependencies

```bash
npm install rss-parser nodemailer node-cron dotenv
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Then open `.env` and fill in:

```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASS=xxxx-xxxx-xxxx-xxxx
RECIPIENT_EMAIL=deepakthapamagar5@gmail.com
DIGEST_TIME=0 7 * * *
```

### 4. Get a Gmail App Password

> **Why?** Google does not allow apps to use your regular Gmail password.
> You need a special 16-character App Password instead.

**Step-by-step:**

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under *"How you sign in to Google"*, click **2-Step Verification**
   - Enable it if it's not already on
4. Scroll down and click **App passwords** (at the bottom of the 2-Step page)
5. Click **Select app → Mail**
6. Click **Select device → Other (Custom name)** → type `IELTS Bot`
7. Click **Generate**
8. Copy the 16-character password shown (e.g., `abcd efgh ijkl mnop`)
9. Remove the spaces and paste it as `GMAIL_APP_PASS` in your `.env`

---

## Usage

### Send immediately (for testing)

```bash
node ielts-digest-bot.js --now
```

### Run as a scheduled daemon (sends at configured time every day)

```bash
node ielts-digest-bot.js
```

To keep it running in the background with auto-restart:

```bash
# Using pm2 (recommended)
npm install -g pm2
pm2 start ielts-digest-bot.js --name ielts-bot
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot

# Or with nohup
nohup node ielts-digest-bot.js > ielts-bot.log 2>&1 &
```

---

## RSS Sources & Band Levels

| Source              | Band | IELTS Section | Style                          |
|---------------------|------|---------------|--------------------------------|
| VOA Learning English| 6.0  | Section 1     | Simple English, short news     |
| BBC News World      | 6.5  | Section 2–3   | Journalistic, concise          |
| NPR News            | 7.0  | Section 3     | Formal American English        |
| The Guardian        | 7.5  | Section 3     | Advanced, analytical essays    |

---

## Email Structure

1. **Header** — Date and article count
2. **30-Minute Routine Table** — Structured reading plan
3. **Article Cards** (one per band level):
   - Source badge + Band level badge + Section badge
   - Article title and description snippet
   - 5 IELTS vocabulary pills
   - Daily practice task (rotates Mon–Sun)
   - "Read Full Article" button
4. **Footer** — Daily writing challenge reminder

---

## File Structure

```
.
├── ielts-digest-bot.js   # Main script
├── .env                  # Your credentials (never commit this)
├── .env.example          # Template for .env
├── sent-articles.json    # Auto-created; tracks sent article URLs
├── package.json          # After npm install
└── IELTS-BOT-README.md   # This file
```

---

## Practice Question Types (daily rotation)

| Day       | Question Type              |
|-----------|----------------------------|
| Sunday    | True / False / Not Given   |
| Monday    | Matching Headings          |
| Tuesday   | Summary Completion         |
| Wednesday | Multiple Choice            |
| Thursday  | Short-Answer Questions     |
| Friday    | True / False / Not Given   |
| Saturday  | Matching Headings          |

---

## Troubleshooting

**"Invalid login" error**
- Make sure you are using a Gmail **App Password**, not your regular password
- Ensure 2-Step Verification is enabled on your Google account

**No email received**
- Check your Spam / Promotions folder
- Verify `RECIPIENT_EMAIL` is correct in `.env`

**RSS fetch fails for one source**
- The bot gracefully skips failed sources and sends with remaining articles

**Email arrives but articles look old**
- Check `sent-articles.json` — delete it to reset the history
