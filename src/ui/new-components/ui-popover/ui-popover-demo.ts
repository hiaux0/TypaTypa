import { TypeService } from "../../../../common/services/TypeService";
import { AutocompleteSource } from "../../../../types";

export class UiPopoverDemo {
  public message = "ui-popover-demo.html";
  public source = ["one", "two", "three"].map<AutocompleteSource>((v) => ({
    text: v,
  }));
}

//<ui-popover position="top-left">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
//
//<ui-popover position="top-right">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
//
//<ui-popover position="top">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
//
//<ui-popover position="bottom-left">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
//
//<ui-popover position="bottom-right">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
//
//<ui-popover position="bottom">
//  <template au-slot="trigger">open</template>
//  <template au-slot="content">content</template>
//</ui-popover>
// `;
