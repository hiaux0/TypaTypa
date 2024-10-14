export const ON_TOPIC_CHANGE = "onTopicChange";

export const EV_CELL_CHANGED = "EV_CELL_CHANGED";
export const EV_GET_CELL = (columnIndex: number, rowIndex: number) =>
  `get-cell[${columnIndex}:${rowIndex}]`;

export const EV_CELL_SELECTED = (columnIndex: number, rowIndex: number) =>
  // `cell-selected[${columnIndex}:${rowIndex}]`;
  `${columnIndex}:${rowIndex}`;
