const { App, ExpressReceiver } = require('@slack/bolt');
const awsServerlessExpress = require('aws-serverless-express');
const { getSheetContent } = require('./sheets.js');
const {
  reportingDates, employeeFromRow, workiversariesByDates, workiversariesByMonth,
} = require('./workiversaries.js');

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
  processBeforeResponse: true,
});
const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const titleCase = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

const queryView = (month, blocks) => ({
  type: 'modal',
  title: {
    type: 'plain_text',
    text: `${titleCase(month)} Workiversaries`,
  },
  close: {
    type: 'plain_text',
    text: 'Close',
  },
  blocks,
});

const errorView = (month) => ({
  type: 'modal',
  title: {
    type: 'plain_text',
    text: 'Error',
  },
  close: {
    type: 'plain_text',
    text: 'Close',
  },
  blocks: [{
    type: 'section',
    text: { type: 'mrkdwn', text: `Invalid month: "${month}"` },
  }],
});

const employeeBlocks = (employees) => {
  if (employees.length <= 0) {
    return [{
      type: 'section',
      text: { type: 'mrkdwn', text: 'No employees with workiversaries this period' },
    }];
  }
  return employees.map((employee) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${employee.preferred}* ${employee.hireDate.format('MMMM D')}`,
    },
  }));
};

app.command('/hurray', async ({ body, ack, context }) => {
  try {
    await ack();
    console.log(body);

    const data = await getSheetContent(process.env.SHEET_ID, process.env.SHEET_RANGE);
    const employees = data[0].values.map(employeeFromRow);

    if (typeof body.text !== 'string' || body.text.trim() === '') { // Empty
      const workiversaries = workiversariesByDates(employees, reportingDates());
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.SLACK_CHANNEL_ID,
        text: { blocks: employeeBlocks(workiversaries) },
      });
    } else if (months.includes(body.text.trim().toLowerCase())) { // Valid month
      const month = body.text.trim();
      const workiversaries = workiversariesByMonth(employees, month);
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: queryView(month, employeeBlocks(workiversaries)),
      });
    } else { // Invalid month
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: errorView(body.text),
      });
    }
  } catch (error) {
    console.error(error);
  }
});

const server = awsServerlessExpress.createServer(expressReceiver.app);
module.exports.dispatcher = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
