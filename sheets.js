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

const getSheetContent = async () => {
  const client = await authClient();
  const token = await fs.readFile('token.json');
  client.setCredentials(JSON.parse(token));
  const sheets = google.sheets('v4');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1aJOtfVhFacpWEpKifFzKegI0x49_rqbhiR0o3fPwneg',
    range: 'Sheet1!A2:C',
    auth: client,
  });
  const rows = res.data.values;
  if (!rows.length) throw Error('No data');
  const headers = 'Name, Preferred Name, Workiversary';
  const content = rows.map((row) => `${row[0]}, ${row[1]}, ${row[2]}`).join('\n');
  const csv = `${headers}\n${content}\n`;
  return csv;
};

module.exports = { getSheetContent };

if (require.main === module) {
  // Module run directly, generate token
  (async () => {
    await requestToken();
  })();
}
