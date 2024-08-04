import Aurelia from "aurelia";
import { MyApp } from "./my-app";
import { Dictionary } from "./ui/organisms/dictionary/dictionary";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";
import { LabeledWordList } from "./ui/molecules/labeled-word-list/labeled-word-list";
import { Topics } from "./ui/organisms/topics/topics";
import { Scratch } from "./ui/scratch/scratch";

const organisms = [LabeledWordList];

Aurelia.register([...organisms, Dictionary, Scratch, TabDrawer, Topics])
  .app(MyApp)
  .start();
