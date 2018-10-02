/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

"use strict";

const { expect } = require("chai");
const { views } = require("./views");
const { variables } = require("./variables");
const _ = require("lodash");

const {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  PlayAudio,
  VoxaApp
} = require("../src");
const { AlexaRequestBuilder } = require("./tools");

const rb = new AlexaRequestBuilder();

const TEST_URLS = [
  "https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3",
  "https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3",
  "https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3"
];

const states = {
  entry: {
    LaunchIntent: "launch",
    ResumeIntent: "resume",
    StopIntent: "exit",
    CancelIntent: "exit"
  },
  resume: function enter(request) {
    let index = 0;
    let shuffle = 0;
    let loop = 0;
    let offsetInMilliseconds = 0;

    if (request.rawEvent.context && request.rawEvent.context.AudioPlayer) {
      const token = JSON.parse(request.rawEvent.context.AudioPlayer.token);
      index = token.index;
      shuffle = token.shuffle;
      loop = token.loop;
      offsetInMilliseconds =
        request.rawEvent.context.AudioPlayer.offsetInMilliseconds;
    }

    const directives = [
      new PlayAudio(
        TEST_URLS[index],
        createToken(index, shuffle, loop),
        offsetInMilliseconds,
        "REPLACE_ALL"
      )
    ];

    return { ask: "LaunchIntent.OpenResponse", directives };
  },
  exit: function enter() {
    return { tell: "ExitIntent.Farewell" };
  },
  launch: function enter() {
    return { ask: "LaunchIntent.OpenResponse" };
  }
};

function createToken(index, shuffle, loop) {
  return JSON.stringify({ index, shuffle, loop });
}

describe("VoxaApp", () => {
  let app;
  let skill;

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    skill = new AlexaPlatform(app);
    _.map(states, (state, name) => {
      app.onState(name, state);
    });
  });

  itIs("ResumeIntent", reply => {
    expect(reply.speech).to.include("Hello! Good ");
    expect(reply.response.directives[0].type).to.equal("AudioPlayer.Play");
    expect(reply.response.directives[0].playBehavior).to.equal("REPLACE_ALL");
    expect(
      reply.response.directives[0].audioItem.stream.offsetInMilliseconds
    ).to.equal(353160);
  });

  function itIs(intentName, cb) {
    it(intentName, () => {
      const event = rb.getIntentRequest(intentName);
      event.context.AudioPlayer = {
        offsetInMilliseconds: 353160,
        token: '{"index":1,"shuffle":1,"loop":0}',
        playerActivity: "STOPPED"
      };

      return skill.execute(event).then(cb);
    });
  }
});
