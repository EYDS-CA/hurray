# Hurray Bot - WIP

A Slackbot that reads from a Google Sheet to post scheduled, fun updates.

# Setup

1. Create a .env file containing the `GOOGLE_SHEET_ID` from which the bot will
   read event details.

2. Update the `config.json` to point to the correct columns in the
   configuration Google Sheet.

# Installation

More details coming soon.

# Slash Commands

List all workiversaries for a specific month:
```
/hurray work [month]
```

Example:
```
/hurray work september
```

Example response:
```
Jane Smith - 13
Billy Bob - 22
```
