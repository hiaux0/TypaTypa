import { resolve } from "aurelia";
import { VimCommand } from "../../features/vim/vim-commands-repository";
import { Store } from "../modules/store";
import { createCommandId } from "./CommandsService";

export interface RecentlyUsedDataMap<T> {
  lastUsed: string;
  item: T;
}

export class RecentlyUsedService {
  private commands: RecentlyUsedDataMap<VimCommand>[] = [];

  constructor(private store: Store = resolve(Store)) {
    const saved = this.store.getServiceItem(
      "RecentlyUsedService",
    ) as RecentlyUsedDataMap<VimCommand>[];
    if (!Array.isArray(saved)) return
    saved.forEach((c) => {
      c.item.id = createCommandId(c.item);
    });
    this.commands = saved;
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
