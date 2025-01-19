import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Badge</h2>
    <ui-badge>
      <div>Default Badge Content</div>
    </ui-badge>

    <h2>Primary Badge</h2>
    <ui-badge color="primary">
      <div>Primary Badge Content</div>
    </ui-badge>

    <h2>Secondary Badge</h2>
    <ui-badge color="secondary">
      <div>Secondary Badge Content</div>
    </ui-badge>

    <h2>Destructive Badge</h2>
    <ui-badge color="destructive">
      <div>Destructive Badge Content</div>
    </ui-badge>
  </div>
`;

@customElement({ name: "ui-badge-demo", template })
export class UiBadgeDemo {}
