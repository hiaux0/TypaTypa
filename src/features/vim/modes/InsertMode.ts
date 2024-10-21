import { IVimState } from "../vim-types";
import { AbstractMode } from "./AbstractMode";

export class InsertMode extends AbstractMode {
  constructor(vimState?: IVimState) {
    super(vimState);
  }
}
