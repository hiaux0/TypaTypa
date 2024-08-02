import Aurelia from "aurelia";
import { MyApp } from "./my-app";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";

Aurelia.register(TabDrawer)
  .app(MyApp)
  .start();
