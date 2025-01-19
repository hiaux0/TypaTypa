import { UiContextMenu } from "./ui-context-menu";

export class UiContextMenuDemo {
  public message = "ui-context-menu-demo";

  // Example 1: Default Context Menu
  public defaultContextMenu = `
    <ui-context-menu>
      <div>Context Menu Item 1</div>
      <div>Context Menu Item 2</div>
    </ui-context-menu>
  `;

  // Example 2: Small Context Menu
  public smallContextMenu = `
    <ui-context-menu size="sm">
      <div>Small Context Menu Item 1</div>
      <div>Small Context Menu Item 2</div>
    </ui-context-menu>
  `;

  // Example 3: Large Context Menu
  public largeContextMenu = `
    <ui-context-menu size="lg">
      <div>Large Context Menu Item 1</div>
      <div>Large Context Menu Item 2</div>
    </ui-context-menu>
  `;

  // Example 4: Context Menu with Top Position
  public topContextMenu = `
    <ui-context-menu position="top">
      <div>Top Context Menu Item 1</div>
      <div>Top Context Menu Item 2</div>
    </ui-context-menu>
  `;

  // Example 5: Context Menu with Left Position
  public leftContextMenu = `
    <ui-context-menu position="left">
      <div>Left Context Menu Item 1</div>
      <div>Left Context Menu Item 2</div>
    </ui-context-menu>
  `;

  // Example 6: Context Menu with Right Position
  public rightContextMenu = `
    <ui-context-menu position="right">
      <div>Right Context Menu Item 1</div>
      <div>Right Context Menu Item 2</div>
    </ui-context-menu>
  `;
}
