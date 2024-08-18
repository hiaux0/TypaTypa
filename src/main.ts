import Aurelia from "aurelia";
import { MyApp } from "./my-app";
import { AutosizeCustomAttribute } from "./ui/attributes/autosize";
import { LabeledWordList } from "./ui/molecules/labeled-word-list/labeled-word-list";
import { Popover } from "./ui/molecules/popover/popover";
import { Dictionary } from "./ui/organisms/dictionary/dictionary";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topics } from "./ui/organisms/topics/topics";
import { Scratch } from "./ui/scratch/scratch";
import { RouterConfiguration } from "@aurelia/router-lite";

const attributes = [AutosizeCustomAttribute];
const molecules = [LabeledWordList, Popover];
const organisms = [Dictionary, TabDrawer, Topics];

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .register([...attributes, ...molecules, ...organisms, Scratch])
  .app(MyApp)
  .start();
