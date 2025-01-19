import { UiDrawer } from "./ui-drawer";

export class UiDrawerDemo {
  public message = "ui-drawer-demo";

  // Example 1: Default Drawer
  public defaultDrawer = `
    <ui-drawer>
      <div>Default Drawer Content</div>
    </ui-drawer>
  `;

  // Example 2: Small Drawer
  public smallDrawer = `
    <ui-drawer size="sm">
      <div>Small Drawer Content</div>
    </ui-drawer>
  `;

  // Example 3: Large Drawer
  public largeDrawer = `
    <ui-drawer size="lg">
      <div>Large Drawer Content</div>
    </ui-drawer>
  `;

  // Example 4: Drawer without Backdrop
  public noBackdropDrawer = `
    <ui-drawer backdrop="none">
      <div>Drawer without Backdrop Content</div>
    </ui-drawer>
  `;
}
