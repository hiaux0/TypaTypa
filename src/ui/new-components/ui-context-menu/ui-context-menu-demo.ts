import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Context Menu</h2>
    <ui-context-menu>
      <div>Context Menu Item 1</div>
      <div>Context Menu Item 2</div>
    </ui-context-menu>

    <h2>Small Context Menu</h2>
    <ui-context-menu size="sm">
      <div>Small Context Menu Item 1</div>
      <div>Small Context Menu Item 2</div>
    </ui-context-menu>

    <h2>Large Context Menu</h2>
    <ui-context-menu size="lg">
      <div>Large Context Menu Item 1</div>
      <div>Large Context Menu Item 2</div>
    </ui-context-menu>

    <h2>Context Menu with Top Position</h2>
    <ui-context-menu position="top">
      <div>Top Context Menu Item 1</div>
      <div>Top Context Menu Item 2</div>
    </ui-context-menu>

    <h2>Context Menu with Left Position</h2>
    <ui-context-menu position="left">
      <div>Left Context Menu Item 1</div>
      <div>Left Context Menu Item 2</div>
    </ui-context-menu>

    <h2>Context Menu with Right Position</h2>
    <ui-context-menu position="right">
      <div>Right Context Menu Item 1</div>
      <div>Right Context Menu Item 2</div>
    </ui-context-menu>
  </div>
`;

@customElement({ name: "ui-context-menu-demo", template })
export class UiContextMenuDemo {}
