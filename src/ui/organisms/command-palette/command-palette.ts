import { bindable, resolve } from "aurelia";
import "./command-palette.scss";
import {
  IKeyMappingService,
  KeyMappingService,
  mergeKeybindings,
} from "../../../features/vim/vimCore/commands/KeyMappingService";
import { IVimInputHandlerV2 } from "../../../features/vim/VimInputHandlerV2";
import { KeyBindingModes, VimMode } from "../../../features/vim/vim-types";
import { AutocompleteSource, VimIdMapKeys } from "../../../types";
import { VIM_ID_MAP } from "../../../common/modules/constants";
import { VimCommand } from "../../../features/vim/vim-commands-repository";
import { UiSuggestion } from "../../../domain/types/uiTypes";
import {
  CommandsService,
  ICommandsService,
} from "../../../common/services/CommandsService";
import { Store } from "../../../common/modules/store";
import { RecentlyUsedService } from "../../../common/services/RecentlyUsedService";
import { hashStringArray } from "../../../common/modules/strings";

export class CommandPalette {
  @bindable() isOpen: boolean;
  isOpenChanged(): void {
    if (!this.isOpen) {
      // so the key handler triggers the command palette, and not the previous context
      window.requestAnimationFrame(() => {
        this.vimInputHandler.popIdIf(VIM_ID_MAP.autoCompleteInput);
      });
    } else {
      this.init();
    }
  }

  public value = "";
  public message = "command-palette.html";
  public autocompleteSource: AutocompleteSource<VimCommand>[];

  constructor(
    private store: Store = resolve(Store),
    private keyMappingService: IKeyMappingService = resolve(IKeyMappingService),
    private vimInputHandler: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private commandsService: CommandsService = resolve(ICommandsService),
    private recentlyUsedService: RecentlyUsedService = resolve(
      RecentlyUsedService,
    ),
  ) {}

  public acceptCommand = (suggestion: UiSuggestion<VimCommand>): void => {
    const vimCore = this.vimInputHandler.vimCore;
    const context = suggestion.data?.context?.[0] as VimIdMapKeys;
    if (!context) return;
    if (!suggestion.data) return;
    const command = this.commandsService.getCommand(context, suggestion.data);
    if (!command) return;
    this.commandsService.executeCommand(vimCore, command);
    this.recentlyUsedService.addCommand(suggestion.data);
    this.keyMappingService.setLastCommandPaletteCommand(command);
    this.close();
  };

  private init(): void {
    const converted = this.convertToAutocompleteSource();
    const lastUsedCommands = this.recentlyUsedService.getCommands();
    const lastUsedConverted = lastUsedCommands
      .filter((lastUsed) => {
        return converted.some((c) => c.data?.id === lastUsed.item.id);
      })
      .map((command) => {
        return this.convertCommandToSuggestions(
          command.item,
          "",
          "(Recently Used)",
        );
      });
    const concat = lastUsedConverted.concat(converted);
    this.autocompleteSource = concat;
  }

  private convertToAutocompleteSource(): AutocompleteSource<VimCommand>[] {
    const commandsRepository = this.commandsService.commandsRepository;
    const first = commandsRepository[VIM_ID_MAP.global];
    const second = commandsRepository[VIM_ID_MAP.gridNavigation];
    const merged = mergeKeybindings(first, second);
    if (!merged) return [];

    const converted: AutocompleteSource<VimCommand>[] = [];
    Object.entries(merged).forEach((entry) => {
      const [mode, bindings] = entry as [string, VimCommand[]];
      bindings.forEach((binding) => {
        const convertedItem = this.convertCommandToSuggestions(binding, mode);
        converted.push(convertedItem);
      });
    });

    return converted;
  }

  private convertCommandToSuggestions(
    command: VimCommand,
    key: string,
    top?: string,
  ): AutocompleteSource<VimCommand> {
    const text = (command.desc || command.sequence || command.command) ?? "";
    return {
      text,
      top,
      right: command.key,
      bottomLeft: command.context?.join(", "),
      bottomRight: key,
      data: command,
    };
  }

  private close(): void {
    this.isOpen = false;
    this.value = "";
    this.store.closeCommandPalette();
    this.vimInputHandler.popIdIf(VIM_ID_MAP.autoCompleteInput);
  }
}
