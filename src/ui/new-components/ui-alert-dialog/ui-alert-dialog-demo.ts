export class UiAlertDialogDemo {
  public message = "ui-alert-dialog-demo";

  // Example 1: Default Alert Dialog
  public defaultAlertDialog = `
    <ui-alert-dialog>
      <div>Default Alert Dialog Content</div>
    </ui-alert-dialog>
  `;

  // Example 2: Small Alert Dialog
  public smallAlertDialog = `
    <ui-alert-dialog size="sm">
      <div>Small Alert Dialog Content</div>
    </ui-alert-dialog>
  `;

  // Example 3: Large Alert Dialog
  public largeAlertDialog = `
    <ui-alert-dialog size="lg">
      <div>Large Alert Dialog Content</div>
    </ui-alert-dialog>
  `;

  // Example 4: Alert Dialog without Backdrop
  public noBackdropAlertDialog = `
    <ui-alert-dialog backdrop="none">
      <div>Alert Dialog without Backdrop Content</div>
    </ui-alert-dialog>
  `;
}
