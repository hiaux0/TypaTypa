import { inject } from "aurelia";
import { APP_NAME, TABS } from "./modules/constants";
import { initDebugShortcuts } from "./modules/debugging";
import { route } from "@aurelia/router-lite";
import { TypingPage } from "./ui/pages/typing-page/typing-page";
import { PropagandaPage } from "./ui/pages/propaganda-page/propaganda-page";
import { Store } from "./modules/store";

@route({
  title: APP_NAME,
  routes: [
    {
      path: ["typing"],
      component: TypingPage,
      title: "Typing",
    },
    {
      path: "asht",
      component: PropagandaPage,
      title: "ASHT",
    },
  ],
})
@inject(Store)
export class MyApp {
  public appName = APP_NAME;
  public topics = TABS;

  //public wordToLookUp = "";
  //public isDrawerOpen = false;
  //public activeTabName = "";

  constructor(private store: Store) {
    /*prettier-ignore*/ console.log("[my-app.ts,78] this.store: ", this.store);
  }

  attached() {
    initDebugShortcuts();
  }
}
