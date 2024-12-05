import { inject, resolve } from "aurelia";
import { APP_NAME, VIM_ID_MAP } from "./common/modules/constants";
import { initDebugShortcuts } from "./common/modules/debugging";
import { route, Router } from "@aurelia/router-lite";
import { Store } from "./common/modules/store";
import { IVimInputHandlerV2 } from "./features/vim/VimInputHandlerV2";
import { VimMode, VimOptions } from "./features/vim/vim-types";
import { mainAppRoutes } from "./common/modules/constants/routeConstants";
import { GridTestPage } from "./ui/pages/grid-test-page/grid-test-page";
import {
  CommandsService,
  ICommandsService,
} from "./common/services/CommandsService";
import { RecentlyUsedService } from "./common/services/RecentlyUsedService";

@route({
  title: APP_NAME,
  routes: mainAppRoutes,
})
@inject(Router)
export class MyApp {
  public appName = APP_NAME;
  public routes = mainAppRoutes;
  private contextId = VIM_ID_MAP.global;

  constructor(
    private router: Router,
    private store: Store = resolve(Store),
    private vimInputHandlerV2: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private commandsService: CommandsService = resolve(ICommandsService),
    private recentlyUsedService: RecentlyUsedService = resolve(
      RecentlyUsedService,
    ),
  ) {}

  attached() {
    // this.router.load(TypingPage);
    // this.router.load(PropagandaPage);
    // this.router.load(GridTestPage);
    // this.router.load(KhongAPage);

    this.initKeyBindings();
    initDebugShortcuts();

    window.setTimeout(() => {
      /*prettier-ignore*/ console.log("[my-app.ts,40] this.commandsService.commandsRepository: ", this.commandsService.commandsRepository);
    }, 0);
  }

  private initKeyBindings() {
    const bindings = {
      [VimMode.ALL]: [
        {
          key: "<Control>p",
          desc: "Toggle Command Palette",
          context: [this.contextId],
          execute: () => {
            this.store.toggleCommandPaletteOpen();
            this.vimInputHandlerV2.setActiveId(VIM_ID_MAP.commandPalette);
            return true;
          },
          preventUndoRedo: true,
        },
        {
          key: "<Escape>",
          desc: "Cancel all",
          context: [this.contextId],
          execute: () => {
            this.store.closeCommandPalette();
            return true;
          },
          preventUndoRedo: true,
        },
        {
          desc: "Clear recently used items",
          context: [this.contextId],
          execute: () => {
            this.recentlyUsedService.clearCommands();
          },
          preventUndoRedo: true,
        },
      ],
    };
    this.vimInputHandlerV2.registerAndInit({ vimId: this.contextId }, bindings);
    this.commandsService.registerCommands(this.contextId, bindings);
  }
}
