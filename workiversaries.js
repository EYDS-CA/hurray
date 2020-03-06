const dayjs = require('dayjs');

// Dates between date and date + n days in format MMDD (defaults from today)
const getNextDays = (n, from = dayjs()) => {
  const range = [...Array(n).keys()];
  return range.map((v) => from.add(v, 'days').format('MMDD'));
};

// Workiversaries celebrated on date (defaults to today)
const reportingDates = (from = dayjs()) => {
  const days = getNextDays(from.format('dddd') === 'Friday' ? 3 : 1, from); // Account for weekends
  if (days.includes('0228')) days.push('0229'); // Account for leap years
  return [...new Set(days)]; // Remove duplicates
};

// Map row from Google Sheets array to object
const employeeFromRow = (v) => ({
  name: v[0],
  preferred: v[1],
  hireDate: dayjs(v[2], 'MMMM D, YYYY'),
});

// Employees with workiversaries in reporting dates (format MMDD) employed for over one year
const workiversariesByDates = (employees, dates) => {
  const currentYear = dayjs().year();
  return employees
    .filter((v) => v.hireDate.year() < currentYear) // Ignore new hires
    .filter((v) => dates.includes(v.hireDate.format('MMDD'))); // Only reporting days
};

// Employees with workiversaries in reporting month employed for over one year
const workiversariesByMonth = (employees, month) => {
  const currentYear = dayjs().year();
  return employees
    .filter((v) => v.hireDate.year() < currentYear) // Ignore new hires
    .filter((v) => v.hireDate.format('MMMM').toLowerCase() === month.toLowerCase()); // Only reporting month
};

module.exports = {
  reportingDates,
  employeeFromRow,
  workiversariesByDates,
  workiversariesByMonth,
};
