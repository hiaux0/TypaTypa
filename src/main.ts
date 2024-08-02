import Aurelia from "aurelia";
import { MyApp } from "./my-app";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topics } from "./ui/organisms/topics/topics";
import { Scratch } from "./ui/scratch/scratch";

Aurelia
  .register([Scratch, TabDrawer, Topics])
  .app(MyApp)
  .start();
