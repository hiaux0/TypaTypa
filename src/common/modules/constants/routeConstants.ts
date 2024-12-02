import { GridTestPage } from "../../../ui/pages/grid-test-page/grid-test-page";
import { KhongAPage } from "../../../ui/pages/khong-a-page/khong-a-page";
import { Playground } from "../../../ui/pages/playground/playground";
import { PropagandaPage } from "../../../ui/pages/propaganda-page/propaganda-page";
import { TypingPage } from "../../../ui/pages/typing-page/typing-page";
import { UiLibPage } from "../../../ui/pages/ui-lib-page/ui-lib-page";
import { UiLibWelcome } from "../../../ui/pages/ui-lib-page/ui-lib-welcome/ui-lib-welcome";
import { VimV3Page } from "../../../ui/pages/vim-v3-page/vim-v3-page";

export const mainAppRoutes = [
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
