import { bindable, resolve } from "aurelia";
import "./command-palette.scss";
import { IKeyMappingService } from "../../../features/vim/vimCore/commands/KeyMappingService";
import { IVimInputHandlerV2 } from "../../../features/vim/VimInputHandlerV2";
import { VimMode } from "../../../features/vim/vim-types";
import { AutocompleteSource } from "../../../types";

export class CommandPalette {
  @bindable() isOpen: boolean;
  isOpenChanged(): void {
    this.init();
  }

  public message = "command-palette.html";
  public autocompleteSource: AutocompleteSource[];

  constructor(
    private keyMappingService: IKeyMappingService = resolve(IKeyMappingService),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
  ) {}

  private init(): void {
    this.autocompleteSource = this.keyMappingService.keyBindings[
      VimMode.NORMAL
    ].map<AutocompleteSource>((binding) => ({
      text: binding.desc || binding.sequence || binding.command,
      right: binding.key,
    }));

    /*prettier-ignore*/ console.log("[command-palette.ts,26] this.vimInputHandler.inputMap: ", this.vimInputHandler.inputMap);
  }
}
