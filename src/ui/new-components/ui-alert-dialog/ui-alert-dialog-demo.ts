import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Alert Dialog</h2>
    <ui-alert-dialog>
      <div>Default Alert Dialog Content</div>
    </ui-alert-dialog>

    <h2>Small Alert Dialog</h2>
    <ui-alert-dialog size="sm">
      <div>Small Alert Dialog Content</div>
    </ui-alert-dialog>

    <h2>Large Alert Dialog</h2>
    <ui-alert-dialog size="lg">
      <div>Large Alert Dialog Content</div>
    </ui-alert-dialog>

    <h2>Alert Dialog without Backdrop</h2>
    <ui-alert-dialog backdrop="none">
      <div>Alert Dialog without Backdrop Content</div>
    </ui-alert-dialog>
  </div>
`;

@customElement({ name: "ui-alert-dialog-demo", template })
export class UiAlertDialogDemo {}
