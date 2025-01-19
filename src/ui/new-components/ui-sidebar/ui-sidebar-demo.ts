import { UiSidebar } from "./ui-sidebar";

export class UiSidebarDemo {
  public message = "ui-sidebar-demo";

  // Example 1: Default Sidebar
  public defaultSidebar = `
    <ui-sidebar>
      <div>Default Sidebar Content</div>
    </ui-sidebar>
  `;

  // Example 2: Small Sidebar
  public smallSidebar = `
    <ui-sidebar size="sm">
      <div>Small Sidebar Content</div>
    </ui-sidebar>
  `;

  // Example 3: Large Sidebar
  public largeSidebar = `
    <ui-sidebar size="lg">
      <div>Large Sidebar Content</div>
    </ui-sidebar>
  `;

  // Example 4: Sidebar without Backdrop
  public noBackdropSidebar = `
    <ui-sidebar backdrop="none">
      <div>Sidebar without Backdrop Content</div>
    </ui-sidebar>
  `;
}
