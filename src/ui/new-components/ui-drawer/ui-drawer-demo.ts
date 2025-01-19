import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Drawer</h2>
    <ui-drawer>
      <div>Default Drawer Content</div>
    </ui-drawer>

    <h2>Small Drawer</h2>
    <ui-drawer size="sm">
      <div>Small Drawer Content</div>
    </ui-drawer>

    <h2>Large Drawer</h2>
    <ui-drawer size="lg">
      <div>Large Drawer Content</div>
    </ui-drawer>

    <h2>Drawer without Backdrop</h2>
    <ui-drawer backdrop="none">
      <div>Drawer without Backdrop Content</div>
    </ui-drawer>
  </div>
`;

@customElement({ name: "ui-drawer-demo", template })
export class UiDrawerDemo {}
