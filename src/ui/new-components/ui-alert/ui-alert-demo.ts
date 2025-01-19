import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Alert</h2>
    <ui-alert>
      <div>Default Alert Content</div>
    </ui-alert>

    <h2>Success Alert</h2>
    <ui-alert variant="success">
      <div>Success Alert Content</div>
    </ui-alert>

    <h2>Warning Alert</h2>
    <ui-alert variant="warning">
      <div>Warning Alert Content</div>
    </ui-alert>

    <h2>Error Alert</h2>
    <ui-alert variant="error">
      <div>Error Alert Content</div>
    </ui-alert>
  </div>
`;

@customElement({ name: "ui-alert-demo", template })
export class UiAlertDemo {}
