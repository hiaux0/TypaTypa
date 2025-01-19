import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Dialog</h2>
    <ui-dialog>
      <div>Default Dialog Content</div>
    </ui-dialog>

    <h2>Small Dialog</h2>
    <ui-dialog size="sm">
      <div>Small Dialog Content</div>
    </ui-dialog>

    <h2>Large Dialog</h2>
    <ui-dialog size="lg">
      <div>Large Dialog Content</div>
    </ui-dialog>

    <h2>Dialog without Backdrop</h2>
    <ui-dialog backdrop="none">
      <div>Dialog without Backdrop Content</div>
    </ui-dialog>
  </div>
`;

@customElement({ name: "ui-dialog-demo", template })
export class UiDialogDemo {}
