import * as _ from "lodash";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";

let defaultConfig: any = {};

export function autoLoad(skill: VoxaApp, config: any) {
  if (!config) {
    throw Error("Missing config object");
  }

  if (!config.adapter) {
    throw Error("Missing adapter");
  }

  if (!_.isFunction(config.adapter.get)) {
    throw Error("No get method to fetch data from");
  }

  defaultConfig = _.merge(defaultConfig, config);

  skill.onSessionStarted(
    async (voxaEvent: IVoxaEvent): Promise<IVoxaEvent> => {
      try {
        const data = await defaultConfig.adapter.get(voxaEvent.user);

        voxaEvent.log.debug("Data fetched:", { data });
        voxaEvent.model.user = data;
        return voxaEvent;
      } catch (error) {
        voxaEvent.log.error(error);
        throw error;
      }
    },
  );
}
