.. _voxa-platforms:


Voxa Platforms
==================

Voxa Platforms wrap your :js:class:`VoxaApp <VoxaApp>` and allows you to define handlers for the different supported voice platforms.


.. js:class:: VoxaPlatform(voxaApp, config)

  :param VoxaApp voxaApp: The app
  :param config: The config

  .. js:method:: startServer([port])

    :returns: A promise that resolves to a running ``http.Server`` on the specified port number, if no port number is specified it will try to get a port number from the ``PORT`` environment variable or default to port 3000

    This method can then be used in combination with a proxy server like `ngrok <https://ngrok.com/>`_ or `Bespoken tools proxy <http://docs.bespoken.io/en/latest/commands/proxy/>`_ to enable local development of your voice application


  .. js:method:: lambda()


    :returns: A lambda handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

    .. code-block:: javascript

        exports.handler = alexaSkill.lambda();

  .. js:method:: lambdaHTTP()


    :returns: A lambda handler to use as an AWS API Gateway ProxyEvent handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

    .. code-block:: javascript

        exports.handler = dialogflowAction.lambdaHTTP();

  .. js:method:: azureFunction()


    :returns: An azure function handler

    .. code-block:: javascript

        module.exports = cortanaSkill.azureFunction();




.. _alexa-platform:

Alexa
-------

The Alexa Platform allows you to use Voxa with Alexa

.. code-block:: javascript

  const { AlexaPlatform } = require('voxa');
  const { voxaApp } = require('./app');

  const alexaSkill = new AlexaPlatform(voxaApp);
  exports.handler = alexaSkill.lambda();



.. _dialogflow-platform:

Dialogflow
-------------

The GoogleAssistant and Facebook Platforms allow you to use Voxa with these 2 type of bots

.. code-block:: javascript

  const { GoogleAssistantPlatform, FacebookPlatform } = require('voxa');
  const { voxaApp } = require('./app');

  const googleAction = new GoogleAssistantPlatform(voxaApp);
  exports.handler = googleAction.lambdaHTTP();

  const facebookBot = new FacebookPlatform(voxaApp);
  exports.handler = facebookBot.lambdaHTTP();


.. _botframework-platform:

Botframework
------------------

The BotFramework Platform allows you to use Voxa with Microsoft Botframework

.. code-block:: javascript

  const { BotFrameworkPlatform } = require('voxa');
  const { AzureBotStorage, AzureTableClient } = require('botbuilder-azure');
  const { voxaApp } = require('./app');
  const config = require('./config');

  const tableName = config.tableName;
  const storageKey = config.storageKey; // Obtain from Azure Portal
  const storageName = config.storageName;
  const azureTableClient = new AzureTableClient(tableName, storageName, storageKey);
  const tableStorage = new AzureBotStorage({ gzipData: false }, azureTableClient);

  const botframeworkSkill = new BotFrameworkPlatform(voxaApp, {
    storage: tableStorage,
    recognizerURI: process.env.LuisRecognizerURI,
    applicationId: process.env.MicrosoftAppId,
    applicationPassword: process.env.MicrosoftAppPassword,
    defaultLocale: 'en',
  });

  module.exports = botframeworkSkill.azureFunction();
