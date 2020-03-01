const express = require('express');
const { getSheetContent } = require('./sheets.js');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const sheetId = '1aJOtfVhFacpWEpKifFzKegI0x49_rqbhiR0o3fPwneg';
  const ranges = 'Sheet1!A2:C';
  const content = await getSheetContent(sheetId, ranges);
  res.send(content);
});

app.listen(port);
