import { inject, resolve } from "aurelia";
import { APP_NAME } from "./common/modules/constants";
import { initDebugShortcuts } from "./common/modules/debugging";
import { route, Router } from "@aurelia/router-lite";
import { TypingPage } from "./ui/pages/typing-page/typing-page";
import { PropagandaPage } from "./ui/pages/propaganda-page/propaganda-page";
import { VimV3Page } from "./ui/pages/vim-v3-page/vim-v3-page";
import { GridTestPage } from "./ui/pages/grid-test-page/grid-test-page";
import { KhongAPage } from "./ui/pages/khong-a-page/khong-a-page";
import { Playground } from "./ui/pages/playground/playground";
import { Store } from "./common/modules/store";
import { UiLibPage } from "./ui/pages/ui-lib-page/ui-lib-page";
import { UiLibWelcome } from "./ui/pages/ui-lib-page/ui-lib-welcome/ui-lib-welcome";
import { IVimInputHandlerV2 } from "./features/vim/VimInputHandlerV2";
import { VimMode, VimOptions } from "./features/vim/vim-types";

const routes = [
  {
    path: "grid-test",
    component: GridTestPage,
    title: "Grid Test",
  },
  {
    path: "khong-a",
    component: KhongAPage,
    title: "Khong a",
  },
  {
    path: "typins",
    component: TypingPage,
    title: "Typing",
  },
  {
    path: "uilib",
    component: UiLibPage,
    title: "uilib",
  },
  {
    path: "uilib/:category/*viewModelName",
    component: UiLibWelcome,
  },
  {
    path: "playground",
    component: Playground,
    title: "Playground",
  },
  {
    path: "propaganda",
    component: PropagandaPage,
    title: "Propaganda",
  },
  {
    path: "vim-V3",
    component: VimV3Page,
    title: "Vim V3",
  },
];

@route({
  title: APP_NAME,
  routes,
})
@inject(Router)
export class MyApp {
  public appName = APP_NAME;
  public routes = routes;

  //public wordToLookUp = "";
  //public isDrawerOpen = false;
  //public activeTabName = "";

  constructor(
    private router: Router,
    private store: Store = resolve(Store),
    private vimInputHandlerV2: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
  ) {}

  attached() {
    // this.router.load(TypingPage);
    // this.router.load(PropagandaPage);
    // this.router.load(GridTestPage);
    // this.router.load(KhongAPage);
    this.vimInputHandlerV2.registerAndInit(
      { vimId: "App" },
      {
        [VimMode.ALL]: [
          {
            key: "<Ctrl>p",
            execute: () => {
              console.log("Ctrl+p");
              return true;
            },
            preventUndoRedo: true,
          },
        ],
      },
    );

    initDebugShortcuts();
  }

  private openCommandPalette(): void {}
}
