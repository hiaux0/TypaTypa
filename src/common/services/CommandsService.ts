import { DI } from "aurelia";
import { Logger } from "../logging/logging";
import { VimCommand } from "../../features/vim/vim-commands-repository";

const l = new Logger("CommandsService");

export type ICommandsService = CommandsService;
export const ICommandsService = DI.createInterface<ICommandsService>(
  "CommandsService",
  (x) => x.singleton(CommandsService),
);

export class CommandsService {
  public commandsRepository = {};

  public registerCommands(context: string, commands: any): void {
    this.commandsRepository[context] = commands;
  }

  public executeCommand(data: VimCommand) {
    /*prettier-ignore*/ console.log("[CommandsService.ts,22] data: ", data);
  }
}
