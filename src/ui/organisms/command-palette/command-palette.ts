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
import {
  CommandsService,
  ICommandsService,
} from "../../../common/services/CommandsService";

export class CommandPalette {
  @bindable() isOpen: boolean;
  isOpenChanged(): void {
    if (!this.isOpen) {
      // so the key handler triggers the command palette, and not the previous context
      window.requestAnimationFrame(() => {
        this.vimInputHandler.popIdIf(VIM_ID_MAP.global);
      });
    } else {
      this.init();
    }
  }

  public message = "command-palette.html";
  public autocompleteSource: AutocompleteSource<VimCommand>[];

  constructor(
    private keyMappingService: IKeyMappingService = resolve(IKeyMappingService),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private commandsService: CommandsService = resolve(ICommandsService),
  ) {}

  public acceptCommand = (suggestion: UiSuggestion<VimCommand>): void => {
    /*prettier-ignore*/ console.log("[command-palette.ts,29] suggestion: ", suggestion);
    const vimCore = this.vimInputHandler.vimCore;
    this.commandsService.executeCommand(vimCore, suggestion.data);
    this.close();
  };

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
    const commandsRepository = this.commandsService.commandsRepository;
    const first = commandsRepository[VIM_ID_MAP.global];
    const second = commandsRepository[VIM_ID_MAP.gridNavigation];
    const merged = mergeKeybindings(first, second);
    /*prettier-ignore*/ console.log("[command-palette.ts,63] merged: ", merged);

    const converted: AutocompleteSource<VimCommand>[] = [];
    Object.entries(merged).forEach((entry) => {
      const [key, bindings] = entry as [string, VimCommand[]];
      bindings.forEach((binding) => {
        converted.push({
          text: binding.desc || binding.sequence || binding.command,
          right: binding.key,
          bottomLeft: binding.context?.join(", "),
          bottomRight: key,
          data: binding,
        });
      });
    });

    this.autocompleteSource = converted;
  }

  private close(): void {
    this.isOpen = false;
  }
}
