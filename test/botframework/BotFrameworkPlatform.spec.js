'use strict';

const simple = require('simple-mock');
const expect = require('chai').expect;
const azure = require('botbuilder-azure');

const _ = require('lodash');
const BotFrameworkPlatform = require('../../src/platforms/botframework/BotFrameworkPlatform').BotFrameworkPlatform;
const VoxaApp = require('../../src/VoxaApp').VoxaApp;
const views = require('../views').views;
const variables = require('../variables').variables;
const rawEvent = _.cloneDeep(require('../requests/botframework/microsoft.launch.json'));

describe('BotFrameworkPlatform', () => {
  let adapter;
  let recognizer;
  let app;
  let storage;
  let azureTableClient;

  afterEach(() => {
    simple.restore();
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    azureTableClient = new azure.AzureTableClient();
    storage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);

    // we need to mock this before instantiating the platforms cause otherwise
    // we try to get the authorization token

    adapter = new BotFrameworkPlatform(app, { recognizer, storage });
    simple.mock(storage, 'getData')
      .callbackWith(null, {});

    simple.mock(storage, 'saveData')
      .callbackWith(null, {});

    simple.mock(adapter, 'botApiRequest')
      .resolveWith(true);
  });

  // describe('partialReply', () => {
    // it('should send multiple partial replies', () => {
      // app.onIntent('LaunchIntent', (request) => {
        // request.model.count = (request.model.count || 0) + 1;
        // if (request.model.count > 2) {
          // return { reply: 'Count.Tell' };
        // }

        // return { reply: 'Count.Say', to: 'entry' };
      // });


      // return adapter.execute(rawEvent)
        // .then(() => {
          // expect(adapter.botApiRequest.calls.length).to.equal(3);
          // expect(adapter.botApiRequest.lastCall.args[2].text).to.equal('3');
        // });
    // });
  // });
});