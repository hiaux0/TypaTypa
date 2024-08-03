import Aurelia from "aurelia";
import { MyApp } from "./my-app";
import { Dictionary } from "./ui/organisms/dictionary/dictionary";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topics } from "./ui/organisms/topics/topics";
import { Scratch } from "./ui/scratch/scratch";

Aurelia
  .register([Dictionary, Scratch, TabDrawer, Topics])
  .app(MyApp)
  .start();
