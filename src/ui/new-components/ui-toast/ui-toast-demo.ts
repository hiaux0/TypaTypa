import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Toast</h2>
    <ui-toast>Default Toast</ui-toast>

    <h2>Success Toast</h2>
    <ui-toast variant="success">Success Toast</ui-toast>

    <h2>Error Toast</h2>
    <ui-toast variant="error">Error Toast</ui-toast>

    <h2>Warning Toast</h2>
    <ui-toast variant="warning">Warning Toast</ui-toast>
  </div>
`;

@customElement({ name: "ui-toast-demo", template })
export class UiToastDemo {}
