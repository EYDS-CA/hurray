const express = require('express');
const { getSheetContent } = require('./sheets.js');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const content = await getSheetContent();
  res.send(content);
});

app.listen(port);
