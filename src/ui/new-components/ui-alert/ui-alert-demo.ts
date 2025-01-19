import { UiAlert } from "./ui-alert";

export class UiAlertDemo {
  public message = "ui-alert-demo";

  // Example 1: Default Alert
  public defaultAlert = `
    <ui-alert>
      <div>Default Alert Content</div>
    </ui-alert>
  `;

  // Example 2: Success Alert
  public successAlert = `
    <ui-alert variant="success">
      <div>Success Alert Content</div>
    </ui-alert>
  `;

  // Example 3: Warning Alert
  public warningAlert = `
    <ui-alert variant="warning">
      <div>Warning Alert Content</div>
    </ui-alert>
  `;

  // Example 4: Error Alert
  public errorAlert = `
    <ui-alert variant="error">
      <div>Error Alert Content</div>
    </ui-alert>
  `;
}
