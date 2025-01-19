import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Card</h2>
    <ui-card>
      <div>Default Card Content</div>
    </ui-card>

    <h2>Primary Card</h2>
    <ui-card variant="primary">
      <div>Primary Card Content</div>
    </ui-card>

    <h2>Secondary Card</h2>
    <ui-card variant="secondary">
      <div>Secondary Card Content</div>
    </ui-card>

    <h2>Destructive Card</h2>
    <ui-card variant="destructive">
      <div>Destructive Card Content</div>
    </ui-card>
  </div>
`;

@customElement({ name: "ui-card-demo", template })
export class UiCardDemo {}
