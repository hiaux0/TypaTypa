import { CELL_EVENT_SOURCE_MAP } from "../../../common/modules/constants";

export interface CellFunctionEntities {}

export const GRID_FUNCTIONS = {
  audio: {
    start: "START",
    end: "END",
  },
};

export interface ICellEventsPayload {
  source: string;
  name: string;
  data: any;
}

export interface IAudioCellStartPayload extends ICellEventsPayload {
  name: typeof GRID_FUNCTIONS.audio.start;
  data: {
    start: number;
  };
}

export interface IAudioCellEndPayload extends ICellEventsPayload {
  name: typeof GRID_FUNCTIONS.audio.end;
  data: {
    end: number;
  };
}

export function isAudioStartFunction(
  payload: ICellEventsPayload,
): payload is IAudioCellStartPayload {
  const isSource = payload.source === CELL_EVENT_SOURCE_MAP.audioPlayer;
  const isFunctionName = payload.name === GRID_FUNCTIONS.audio.start;
  const is = isFunctionName && isSource;
  return is;
}

export function isAudioEndFunction(
  payload: ICellEventsPayload,
): payload is IAudioCellEndPayload {
  const isSource = payload.source === CELL_EVENT_SOURCE_MAP.audioPlayer;
  const isFunctionName = payload.name === GRID_FUNCTIONS.audio.end;
  const is = isFunctionName && isSource;
  return is;
}
