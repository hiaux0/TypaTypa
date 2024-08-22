import Aurelia, { Registration } from "aurelia";
import { RouterConfiguration } from "@aurelia/router-lite";
import { AureliaSlickGridConfiguration } from "aurelia-slickgrid";
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
import { Store } from "./modules/store";
import { CustomTable } from "./ui/organisms/custom-table/custom-table";

const attributes = [AutosizeCustomAttribute];
const molecules = [AutocompleteInput, LabeledWordList, Popover];
const organisms = [CustomTable, Dictionary, TabDrawer, Topics];

Aurelia.register(RouterConfiguration.customize({ useUrlFragmentHash: true }))
  .register([...attributes, ...molecules, ...organisms, Scratch])
  .register(Registration.singleton(Store, Store))
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
  )
  .app(MyApp)
  .start();

(<any>window).Slicker = SlickerModule?.Slicker ?? SlickerModule;
