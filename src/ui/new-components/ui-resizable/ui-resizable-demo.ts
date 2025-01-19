import { UiResizable } from "./ui-resizable";

export class UiResizableDemo {
  public message = "ui-resizable-demo";

  // Example 1: Default Resizable
  public defaultResizable = `
    <ui-resizable>
      <div>Default Resizable Content</div>
    </ui-resizable>
  `;

  // Example 2: Small Resizable
  public smallResizable = `
    <ui-resizable size="sm">
      <div>Small Resizable Content</div>
    </ui-resizable>
  `;

  // Example 3: Large Resizable
  public largeResizable = `
    <ui-resizable size="lg">
      <div>Large Resizable Content</div>
    </ui-resizable>
  `;

  // Example 4: Resizable with Top Position
  public topResizable = `
    <ui-resizable position="top">
      <div>Top Resizable Content</div>
    </ui-resizable>
  `;

  // Example 5: Resizable with Left Position
  public leftResizable = `
    <ui-resizable position="left">
      <div>Left Resizable Content</div>
    </ui-resizable>
  `;

  // Example 6: Resizable with Right Position
  public rightResizable = `
    <ui-resizable position="right">
      <div>Right Resizable Content</div>
    </ui-resizable>
  `;
}
