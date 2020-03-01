const fs = require('fs').promises;
const readline = require('readline-sync');
const { google } = require('googleapis');

const authClient = async () => {
  const content = await fs.readFile('credentials.json');
  const credentials = JSON.parse(content);
  return new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0],
  );
};

const requestToken = async () => {
  const client = await authClient();
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const code = readline.question(`Visit ${authUrl} and enter code: `);
  const token = await client.getToken(code);
  await fs.writeFile('token.json', JSON.stringify(token));
};

const getSheetContent = async (id, ranges) => {
  const rangeArray = Array.isArray(ranges) ? ranges : [ranges]; // Force ranges to be array
  const client = await authClient();
  const token = await fs.readFile('token.json');
  client.setCredentials(JSON.parse(token));
  const sheets = google.sheets('v4');
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    ranges: rangeArray,
    auth: client,
  });
  return response.data.valueRanges;
};

module.exports = { getSheetContent };

if (require.main === module) {
  // Module run directly, generate token
  (async () => {
    await requestToken();
  })();
}
