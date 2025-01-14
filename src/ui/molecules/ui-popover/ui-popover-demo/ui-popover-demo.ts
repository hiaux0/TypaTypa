import { customElement } from "aurelia";

const template = `
<div class="flex justify-center w-full h-full">
  <ui-popover>
    <template au-slot="trigger">br</template>
    <template au-slot="content">content</template>
  </ui-popover>
</div>
`
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

@customElement({
  name: "ui-popover-demo",
  template
})
export class UiPopoverDemo {
  public message = "ui-popover-demo.html";
}
