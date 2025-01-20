import { resolve } from "aurelia";
import { VimCommand } from "../../features/vim/vim-commands-repository";
import { Store } from "../modules/store";
import {
  CommandsService,
  ICommandsService,
  createCommandId,
} from "./CommandsService";
import { VimIdMapKeys } from "../../types";

export interface RecentlyUsedDataMap<T> {
  lastUsed: string;
  item: T;
}

export class RecentlyUsedService {
  private commands: RecentlyUsedDataMap<VimCommand>[] = [];

  constructor(
    private store: Store = resolve(Store),
    private commandsService: CommandsService = resolve(ICommandsService),
  ) {
    const saved = this.store.getServiceItem(
      "RecentlyUsedService",
    ) as RecentlyUsedDataMap<VimCommand>[];
    if (!Array.isArray(saved)) return;
    saved.forEach((c) => {
      c.item.id = createCommandId(c.item);
    });
    this.commands = saved;
  }

  public getLastCommand(
    context: VimIdMapKeys,
  ): RecentlyUsedDataMap<VimCommand> | undefined {
    const last = this.commands[0].item;
    /*prettier-ignore*/ console.log("[RecentlyUsedService.ts,33] last: ", last);
    const command = this.commandsService.getCommand(context, last);
    if (!command) return;
    const result: RecentlyUsedDataMap<VimCommand> = {
      lastUsed: new Date().toISOString(),
      item: command,
    };
    return result;
  }

  public getCommands(): RecentlyUsedDataMap<VimCommand>[] {
    return this.commands;
  }

  public isPresent(command: VimCommand): boolean {
    const is = this.commands.some((c) => c.item.id === command.id);
    return is;
  }

  public addCommand(command: VimCommand): void {
    if (this.isPresent(command)) return;

    const converted: RecentlyUsedDataMap<VimCommand> = {
      lastUsed: new Date().toISOString(),
      item: command,
    };
    this.commands.unshift(converted);
    this.save();
  }

  public clearCommands(): void {
    this.commands = [];
  }

  private save(): void {
    this.store.setServiceItem("RecentlyUsedService", this.commands);
  }
}
