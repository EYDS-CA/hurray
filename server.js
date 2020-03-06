const express = require('express');
const { getSheetContent } = require('./sheets.js');
const {
  reportingDates, employeeFromRow, workiversariesByDates, workiversariesByMonth,
} = require('./workiversaries.js');

const sheetId = '1aJOtfVhFacpWEpKifFzKegI0x49_rqbhiR0o3fPwneg';
const ranges = 'Sheet1!A2:C';
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON POST data

// Get employees with workiversaries today (or this weekend if it's Friday)
app.post('/today', async (request, response) => {
  const data = await getSheetContent(sheetId, ranges);
  const employees = data[0].values.map(employeeFromRow);
  const dates = reportingDates();
  const workiversaries = workiversariesByDates(employees, dates);
  response.send(workiversaries);
});

// Get employees with workiversaries by month
app.post('/month', async (request, response) => {
  const { month } = request.body;
  const data = await getSheetContent(sheetId, ranges);
  const employees = data[0].values.map(employeeFromRow);
  const workiversaries = workiversariesByMonth(employees, month);
  response.send(workiversaries);
});

app.listen(port);
