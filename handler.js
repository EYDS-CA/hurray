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

const theView = (content) => ({
  type: 'modal',
  callback_id: 'shoutout_submitted',
  title: {
    type: 'plain_text',
    text: 'Hurray',
  },
  close: {
    type: 'plain_text',
    text: 'Close',
  },
  blocks: [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: content,
    },
  }],
});

app.command('/hurray', async ({
  body,
  ack,
  context,
}) => {
  try {
    await ack();

    const data = await getSheetContent(process.env.SHEET_ID, process.env.SHEET_RANGE);
    const employees = data[0].values.map(employeeFromRow);
    const workiversaries = workiversariesByMonth(employees, 'September');
    const content = JSON.stringify(workiversaries.map((x) => x.name));

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: theView(content),
    });
  } catch (e) {
    console.log(e);
  }
});

const server = awsServerlessExpress.createServer(expressReceiver.app);
module.exports.dispatcher = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
