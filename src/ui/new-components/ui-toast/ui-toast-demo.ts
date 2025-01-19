import { UiToast } from "./ui-toast";

export class UiToastDemo {
  public message = "ui-toast-demo";

  // Example 1: Default Toast
  public defaultToast = `
    <ui-toast>Default Toast</ui-toast>
  `;

  // Example 2: Success Toast
  public successToast = `
    <ui-toast variant="success">Success Toast</ui-toast>
  `;

  // Example 3: Error Toast
  public errorToast = `
    <ui-toast variant="error">Error Toast</ui-toast>
  `;

  // Example 4: Warning Toast
  public warningToast = `
    <ui-toast variant="warning">Warning Toast</ui-toast>
  `;
}
