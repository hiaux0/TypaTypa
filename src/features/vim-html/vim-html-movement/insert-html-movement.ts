import {
  VimCommandNames,
  VIM_COMMAND,
} from "../../vim/vim-commands-repository";
import { AbstractHtmlMovement } from "./abstract-html-movement";
import { ACTIVE_CLASS } from "./constants";
import { CommandHandledReturn } from "./vim-html-connection-types";

export class InsertHtmlMovement extends AbstractHtmlMovement {
  public handleCommand(targetCommand: VimCommandNames): CommandHandledReturn {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-html-movement.ts:11 ~ targetCommand:', targetCommand);
    let nextActive: HTMLElement | undefined;

    switch (targetCommand) {
      // case VIM_COMMAND.enterInsertMode: {
      //   this.isMoveMode = false;
      //   break;
      // }
      case VIM_COMMAND.enterVisualMode: {
        // this.isMoveMode = true;
        // this.setElementToMove();
        break;
      }
    }
    return {
      currentElement: document.querySelector(`.${ACTIVE_CLASS}`),
      nextElement: nextActive,
    };
  }
}
