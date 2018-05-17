import { AssistantApp, Responses } from "actions-on-google";
import * as _ from "lodash";

import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, IVoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { InputValueDataTypes, StandardIntents } from "./interfaces";

export class List implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowList";

  public viewPath?: string;
  public list?: Responses.List;

  constructor(viewPath: string|Responses.List) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let listSelect;
    if (this.viewPath) {
      listSelect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      listSelect = this.list;
    }

    const systemIntent = {
      data: {
        "@type": InputValueDataTypes.OPTION,
        listSelect,
      },
      intent: "actions.intent.OPTION",
    };

    (reply as DialogFlowReply).data.google.systemIntent =  systemIntent;
  }
}

export class Carousel implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCarousel";

  public viewPath?: string;
  public list?: Responses.Carousel;

  constructor(viewPath: string|Responses.Carousel) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let carouselSelect;
    if (this.viewPath) {
      carouselSelect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      carouselSelect = this.list;
    }

    const systemIntent = {
      data: {
        "@type": InputValueDataTypes.OPTION,
        carouselSelect,
      },
      intent: "actions.intent.OPTION",
    };

    (reply as DialogFlowReply).data.google.systemIntent =  systemIntent;
  }
}

export class Suggestions implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowSuggestions";

  public viewPath?: string;
  public suggestions?: string[];

  constructor(suggestions: string|string[]) {

    if (_.isString(suggestions)) {
      this.viewPath = suggestions;
    } else {
      this.suggestions = suggestions;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let suggestions;
    if (this.viewPath) {
      suggestions = await event.renderer.renderPath(this.viewPath, event);
    } else {
      suggestions = this.suggestions;
    }

    const richResponse = _.get(reply, "data.google.richResponse", new Responses.RichResponse());
    (reply as DialogFlowReply).data.google.richResponse = richResponse.addSuggestions(suggestions);
  }
}

export class BasicCard implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCard";

  public viewPath?: string;
  public basicCard?: Responses.BasicCard;

  constructor(viewPath: string|Responses.BasicCard) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.basicCard = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let basicCard;
    if (this.viewPath) {
      basicCard = await event.renderer.renderPath(this.viewPath, event);
    } else {
      basicCard = this.basicCard;
    }

    const richResponse = _.get(reply, "data.google.richResponse", new Responses.RichResponse());
    (reply as DialogFlowReply).data.google.richResponse = richResponse.addBasicCard(basicCard);
  }
}

export class AccountLinkingCard implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowAccountLinkingCard";

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    reply.speech = "login";
    const google: any = (reply as DialogFlowReply).data.google;
    google.expectUserResponse = true;
    google.inputPrompt = {
      initialPrompts: [
        {
          textToSpeech: "PLACEHOLDER_FOR_SIGN_IN",
        },
      ],
      noInputPrompts: [],
    };
    google.systemIntent = {
      inputValueData: {},
      intent: "actions.intent.SIGN_IN",
    };
  }
}

export class MediaResponse implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowMediaResponse";

  public constructor(public mediaObject: Responses.MediaObject) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const dialogFlowEvent = event as DialogFlowEvent;
    if (!_.includes(dialogFlowEvent.capabilities, "actions.capability.AUDIO_OUTPUT")) {
      return;
    }

    const mediaResponse = new Responses.MediaResponse(Responses.MediaValues.Type.AUDIO)
    .addMediaObjects(this.mediaObject);

    const richResponse = _.get(reply, "data.google.richResponse", new Responses.RichResponse());
    if (richResponse.items.length === 0) {
      throw new Error("MediaResponse requires another simple response first");
    }

    (reply as DialogFlowReply).data.google.richResponse = richResponse.addMediaResponse(mediaResponse);
  }
}
