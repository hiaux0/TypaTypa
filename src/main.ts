import Aurelia, {
  DI,
  IContainer,
  IPlatform,
  PLATFORM,
  Registration,
} from "aurelia";
import { RouterConfiguration } from "@aurelia/router-lite";
import { AureliaSlickGridConfiguration } from "aurelia-slickgrid";
import { StandardConfiguration } from "@aurelia/runtime-html";
import * as SlickerModule from "@slickgrid-universal/vanilla-bundle";

import { MyApp } from "./my-app";
import { AutosizeCustomAttribute } from "./ui/attributes/autosize";
import { AutocompleteInput } from "./ui/molecules/autocomplete-input/autocomplete-input";
import { LabeledWordList } from "./ui/molecules/labeled-word-list/labeled-word-list";
import { Popover } from "./ui/molecules/popover/popover";
import { Dictionary } from "./ui/organisms/dictionary/dictionary";
import { TabDrawer } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topics } from "./ui/organisms/topics/topics";
import { Scratch } from "./ui/scratch/scratch";
import { Store } from "./common/modules/store";
import { CustomTable } from "./ui/organisms/custom-table/custom-table";
import { DraggableCustomAttribute } from "./ui/attributes/draggable";
import { OrTabs } from "./ui/molecules/or-tabs/or-tabs";
import { UploadButton } from "./ui/atoms/upload-button/upload-button";
import { ResizeCustomAttribute } from "./ui/attributes/resize";
import { VimEditor } from "./ui/organisms/vim-editor/vim-editor";
import { OrMenu } from "./ui/organisms/or-menu/or-menu";
import {
  IVimInputHandlerV2,
  VimInputHandlerV2,
} from "./features/vim/VimInputHandlerV2";
import {
  ILoggerService,
  LoggerService,
  PaymentProcessor,
  VimInputHandler,
} from "./features/vim/VimInputHandler";
import type { IPaymentProcessor } from "./features/vim/VimInputHandler";
import { VimInit } from "./features/vim/VimInit";

window.activeVimInstancesIdMap = [];
// /*prettier-ignore*/ console.log("[main.ts,24] window.activeVimInstancesIdMap: ", window.activeVimInstancesIdMap);

const attributes = [
  AutosizeCustomAttribute,
  DraggableCustomAttribute,
  ResizeCustomAttribute,
];
const atoms = [UploadButton];
const molecules = [AutocompleteInput, LabeledWordList, OrTabs, Popover];
const organisms = [
  CustomTable,
  Dictionary,
  OrMenu,
  TabDrawer,
  Topics,
  VimEditor,
];

// DI.createContainer()
//  Registration.instance(IPlatform, PLATFORM),
//  StandardConfiguration.customize((y) => {
//    y.coercingOptions = {
//      coerceNullish: false,
//      enableCoercion: true,
//    };
//  }),
//  // Registration.instance(IReadOnlyProvider, new CeloProvider({ url: CHAIN_URL, skipFetchSetup: true })),
//)
// .register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
const appContainer = Aurelia.register(
  RouterConfiguration.customize({
    useUrlFragmentHash: false,
    basePath: "/",
    activeClass: "noop",
    useHref: false,
  }),
)
  .register([...atoms, ...attributes, ...molecules, ...organisms, Scratch])
  .register(Registration.singleton(Store, Store))
  // .register(VimInit)
  .register(VimInputHandler)
  .register(VimInputHandlerV2)
  // .register(vimContainer)
  // .register()
  .register(
    AureliaSlickGridConfiguration.customize((config) => {
      // change any of the default global options
      config.options.gridMenu!.iconCssClass = "mdi mdi-menu";
      // we strongly suggest you add DOMPurify as a sanitizer
      //config.options.sanitizer = (dirtyHtml) =>
      //  DOMPurify.sanitize(dirtyHtml, {
      //    ADD_ATTR: ["level"],
      //    RETURN_TRUSTED_TYPE: true,
      //  });
    }),
  );
appContainer.app(MyApp).start();

//export const instance = new Aurelia(appContainer);
//void instance.app(MyApp).start();

(<any>window).Slicker = SlickerModule?.Slicker ?? SlickerModule;
