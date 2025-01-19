import { UiDialog } from "./ui-dialog";

export class UiDialogDemo {
  public message = "ui-dialog-demo";

  // Example 1: Default Dialog
  public defaultDialog = `
    <ui-dialog>
      <div>Default Dialog Content</div>
    </ui-dialog>
  `;

  // Example 2: Small Dialog
  public smallDialog = `
    <ui-dialog size="sm">
      <div>Small Dialog Content</div>
    </ui-dialog>
  `;

  // Example 3: Large Dialog
  public largeDialog = `
    <ui-dialog size="lg">
      <div>Large Dialog Content</div>
    </ui-dialog>
  `;

  // Example 4: Dialog without Backdrop
  public noBackdropDialog = `
    <ui-dialog backdrop="none">
      <div>Dialog without Backdrop Content</div>
    </ui-dialog>
  `;
}
