import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Sidebar</h2>
    <ui-sidebar>
      <div>Default Sidebar Content</div>
    </ui-sidebar>

    <h2>Small Sidebar</h2>
    <ui-sidebar size="sm">
      <div>Small Sidebar Content</div>
    </ui-sidebar>

    <h2>Large Sidebar</h2>
    <ui-sidebar size="lg">
      <div>Large Sidebar Content</div>
    </ui-sidebar>

    <h2>Sidebar without Backdrop</h2>
    <ui-sidebar backdrop="none">
      <div>Sidebar without Backdrop Content</div>
    </ui-sidebar>
  </div>
`;

@customElement({ name: "ui-sidebar-demo", template })
export class UiSidebarDemo {}
