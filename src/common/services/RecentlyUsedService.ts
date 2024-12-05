import { resolve } from "aurelia";
import { VimCommand } from "../../features/vim/vim-commands-repository";
import { Store } from "../modules/store";

export interface RecentlyUsedDataMap<T> {
  lastUsed: string;
  item: T;
}

export class RecentlyUsedService {
  private commands: RecentlyUsedDataMap<VimCommand>[] = [];

  constructor(private store: Store = resolve(Store)) {
    this.commands = this.store.getServiceItem("RecentlyUsedService");
  }

  public getCommands(): RecentlyUsedDataMap<VimCommand>[] {
    return this.commands;
  }

  public addCommand(command: VimCommand): void {
    const converted: RecentlyUsedDataMap<VimCommand> = {
      lastUsed: new Date().toISOString(),
      item: command,
    };
    this.commands.unshift(converted);
    this.save();
  }

  private save(): void {
    this.store.setServiceItem("RecentlyUsedService", this.commands);
  }
}
