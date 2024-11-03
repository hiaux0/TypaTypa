import { inject } from "aurelia";
import { APP_NAME } from "./common/modules/constants";
import { initDebugShortcuts } from "./common/modules/debugging";
import { route, Router } from "@aurelia/router-lite";
import { TypingPage } from "./ui/pages/typing-page/typing-page";
import { PropagandaPage } from "./ui/pages/propaganda-page/propaganda-page";
import { VimV3Page } from "./ui/pages/vim-v3-page/vim-v3-page";
import { GridTestPage } from "./ui/pages/grid-test-page/grid-test-page";
import { KhongAPage } from "./ui/pages/khong-a-page/khong-a-page";

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

  constructor(private router: Router) {}

  attached() {
    // this.router.load(TypingPage);
    // this.router.load(PropagandaPage);
    // this.router.load(GridTestPage);
    // this.router.load(KhongAPage);

    initDebugShortcuts();
  }
}
