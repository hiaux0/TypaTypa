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
import { Store } from "./common/modules/store";
import { CustomTable } from "./ui/organisms/custom-table/custom-table";
import { DraggableCustomAttribute } from "./ui/attributes/draggable";
import { OrTabs } from "./ui/molecules/or-tabs/or-tabs";
import { UploadButton } from "./ui/atoms/upload-button/upload-button";
import { ResizeCustomAttribute } from "./ui/attributes/resize";
import { LoadTemplateValueConverter } from "./ui/value-converters/load-template-value-converter";
import { VimEditor } from "./ui/organisms/vim-editor/vim-editor";
import { OrMenu } from "./ui/organisms/or-menu/or-menu";
import { VimInputHandlerV2 } from "./features/vim/VimInputHandlerV2";
import { KeyMappingService } from "./features/vim/vimCore/commands/KeyMappingService";
import { VimCustomAttribute } from "./ui/attributes/vim";
import { LoadComponentValueConverter } from "./ui/value-converters/load-component-value-converter";
import { PopoverTwo } from "./ui/molecules/popover-two/popover-two";
import { CommandPalette } from "./ui/organisms/command-palette/command-palette";
import { NoteLine } from "./ui/organisms/vim-editor/note-line/note-line";
import { VimEditorVtwo } from "./ui/organisms/vim-editor-vtwo/vim-editor-vtwo";
import { debugFlags } from "./common/modules/debug/debugFlags";
import { UiButton } from "./ui/atoms/ui-button/ui-button";
import { UiAudio } from "./ui/molecules/ui-audio/ui-audio";
import { UiIcon } from "./ui/atoms/ui-icon/ui-icon";
import { UiPopover } from "./ui/molecules/ui-popover/ui-popover";
import { CompletionsProvider } from "./ui/organisms/completions-provider/completions-provider";
import { UiAccordion } from "./ui/new-components/ui-accordion/ui-accordion";
import { UiAlertDialog } from "./ui/new-components/ui-alert-dialog/ui-alert-dialog";
import { UiAlert } from "./ui/new-components/ui-alert/ui-alert";
import { UiAspectRatio } from "./ui/new-components/ui-aspect-ratio/ui-aspect-ratio";
import { UiAvatar } from "./ui/new-components/ui-avatar/ui-avatar";
import { UiCheckbox } from "./ui/new-components/ui-checkbox";
import { UiCombobox } from "./ui/new-components/ui-combobox";
import { UiCommand } from "./ui/new-components/ui-command";
import { UiContextMenu } from "./ui/new-components/ui-context-menu";
import { UiDataTable } from "./ui/new-components/ui-data-table";
import { UiDatePicker } from "./ui/new-components/ui-date-picker";
import { UiDialog } from "./ui/new-components/ui-dialog";
import { UiDrawer } from "./ui/new-components/ui-drawer";
import { UiDropdown } from "./ui/new-components/ui-dropdown";
import { UiForm } from "./ui/new-components/ui-form";
import { UiHoverCard } from "./ui/new-components/ui-hover-card";
import { UiIcon } from "./ui/new-components/ui-icon";
import { UiInputOtp } from "./ui/new-components/ui-input-otp";
import { UiInput } from "./ui/new-components/ui-input";
import { UiLabel } from "./ui/new-components/ui-label";
import { UiMenubar } from "./ui/new-components/ui-menubar";
import { UiModal } from "./ui/new-components/ui-modal";
import { UiNavigationMenu } from "./ui/new-components/ui-navigation-menu";
import { UiPagination } from "./ui/new-components/ui-pagination";
import { UiPopover } from "./ui/new-components/ui-popover";
import { UiProgress } from "./ui/new-components/ui-progress";
import { UiRadioGroup } from "./ui/new-components/ui-radio-group";
import { UiRadio } from "./ui/new-components/ui-radio";
import { UiResizable } from "./ui/new-components/ui-resizable";
import { UiScrollArea } from "./ui/new-components/ui-scroll-area";
import { UiSelect } from "./ui/new-components/ui-select";
import { UiSeparator } from "./ui/new-components/ui-separator";
import { UiSheet } from "./ui/new-components/ui-sheet";
import { UiSidebar } from "./ui/new-components/ui-sidebar";
import { UiSkeleton } from "./ui/new-components/ui-skeleton";
import { UiSlider } from "./ui/new-components/ui-slider";
import { UiSonner } from "./ui/new-components/ui-sonner";
import { UiSwitch } from "./ui/new-components/ui-switch";
import { UiTable } from "./ui/new-components/ui-table";
import { UiTabs } from "./ui/new-components/ui-tabs";
import { UiTextarea } from "./ui/new-components/ui-textarea";
import { UiToast } from "./ui/new-components/ui-toast";
import { UiToggleGroup } from "./ui/new-components/ui-toggle-group";
import { UiToggle } from "./ui/new-components/ui-toggle";
import { UiTooltip } from "./ui/new-components/ui-tooltip";

if (debugFlags.clearConsole) console.clear();
window.activeVimInstancesIdMap = [];
// /*prettier-ignore*/ console.log("[main.ts,24] window.activeVimInstancesIdMap: ", window.activeVimInstancesIdMap);
//

const all = [
  CompletionsProvider,
  UiAudio,
  UiButton,
  UiIcon,
  UiPopover,
  UiAccordion,
  UiAlertDialog,
  UiAlert,
  UiAspectRatio,
  UiAvatar,
  UiCheckbox,
  UiCombobox,
  UiCommand,
  UiContextMenu,
  UiDataTable,
  UiDatePicker,
  UiDialog,
  UiDrawer,
  UiDropdown,
  UiForm,
  UiHoverCard,
  UiIcon,
  UiInputOtp,
  UiInput,
  UiLabel,
  UiMenubar,
  UiModal,
  UiNavigationMenu,
  UiPagination,
  UiPopover,
  UiProgress,
  UiRadioGroup,
  UiRadio,
  UiResizable,
  UiScrollArea,
  UiSelect,
  UiSeparator,
  UiSheet,
  UiSidebar,
  UiSkeleton,
  UiSlider,
  UiSonner,
  UiSwitch,
  UiTable,
  UiTabs,
  UiTextarea,
  UiToast,
  UiToggleGroup,
  UiToggle,
  UiTooltip,
];

const attributes = [
  AutosizeCustomAttribute,
  DraggableCustomAttribute,
  ResizeCustomAttribute,
  VimCustomAttribute,
];
const atoms = [UploadButton];
const molecules = [
  AutocompleteInput,
  LabeledWordList,
  OrTabs,
  Popover,
  PopoverTwo,
];
const organisms = [
  CommandPalette,
  CustomTable,
  Dictionary,
  NoteLine,
  OrMenu,
  TabDrawer,
  Topics,
  VimEditor,
  VimEditorVtwo,
];
const valueConverters = [
  LoadComponentValueConverter,
  LoadTemplateValueConverter,
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
    useUrlFragmentHash: true,
    basePath: "/",
    activeClass: "noop",
    useHref: false,
  }),
)
  .register([
    ...all,
    ...atoms,
    ...attributes,
    ...molecules,
    ...organisms,
    ...valueConverters,
    Scratch,
  ])
  .register(Registration.singleton(Store, Store))
  // .register(VimInit)
  .register(KeyMappingService)
  .register(VimInputHandlerV2)
  // .register(Registration.singleton(VimInputHandlerV2, VimInputHandlerV2))
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
