import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Button</h2>
    <ui-button label="Default Button"></ui-button>

    <h2>Destructive Button</h2>
    <ui-button label="Destructive Button" variant="destructive"></ui-button>

    <h2>Outline Button</h2>
    <ui-button label="Outline Button" variant="outline"></ui-button>

    <h2>Secondary Button</h2>
    <ui-button label="Secondary Button" variant="secondary"></ui-button>

    <h2>Ghost Button</h2>
    <ui-button label="Ghost Button" variant="ghost"></ui-button>
  </div>
`;

@customElement({ name: "ui-button-demo", template })
export class UiButtonDemo {}
