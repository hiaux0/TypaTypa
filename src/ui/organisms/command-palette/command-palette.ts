import { bindable, resolve } from "aurelia";
import "./command-palette.scss";
import {
  IKeyMappingService,
  mergeKeybindings,
} from "../../../features/vim/vimCore/commands/KeyMappingService";
import { IVimInputHandlerV2 } from "../../../features/vim/VimInputHandlerV2";
import { KeyBindingModes, VimMode } from "../../../features/vim/vim-types";
import { AutocompleteSource } from "../../../types";
import { VIM_ID_MAP } from "../../../common/modules/constants";
import { VimCommand } from "../../../features/vim/vim-commands-repository";
import { UiSuggestion } from "../../../domain/types/uiTypes";

export class CommandPalette {
  @bindable() isOpen: boolean;
  isOpenChanged(): void {
    this.init();
    if (!this.isOpen) {
      this.vimInputHandler.popIdIf(VIM_ID_MAP.global);
    }
  }

  public message = "command-palette.html";
  public autocompleteSource: AutocompleteSource[];

  constructor(
    private keyMappingService: IKeyMappingService = resolve(IKeyMappingService),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
  ) {}

  public hello(suggestion: UiSuggestion): void {
    /*prettier-ignore*/ console.log("[command-palette.ts,29] suggestion: ", suggestion);
  }

  private init(): void {
    this.convertToAutocompleteSource();
  }

  private convertToAutocompleteSource(): void {
    //this.autocompleteSource = this.keyMappingService.keyBindings[
    //  VimMode.NORMAL
    //].map<AutocompleteSource>((binding) => ({
    //  text: binding.desc || binding.sequence || binding.command,
    //  right: binding.key,
    //}));
    //
    const { inputMap } = this.vimInputHandler;
    const first = inputMap[VIM_ID_MAP.global];
    const second = inputMap[VIM_ID_MAP.gridNavigation];
    const merged = mergeKeybindings(first, second);

    const converted: AutocompleteSource[] = [];
    Object.entries(merged).forEach((entry) => {
      const [key, bindings] = entry as [string, VimCommand[]];
      bindings.forEach((binding) => {
        converted.push({
          text: binding.desc || binding.sequence || binding.command,
          right: binding.key,
          bottom: key,
        });
      });
    });

    this.autocompleteSource = converted;
  }
}
