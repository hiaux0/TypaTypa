import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Command</h2>
    <ui-command>Default Command</ui-command>

    <h2>Destructive Command</h2>
    <ui-command variant="destructive">Destructive Command</ui-command>

    <h2>Outline Command</h2>
    <ui-command variant="outline">Outline Command</ui-command>

    <h2>Secondary Command</h2>
    <ui-command variant="secondary">Secondary Command</ui-command>

    <h2>Ghost Command</h2>
    <ui-command variant="ghost">Ghost Command</ui-command>

    <h2>Link Command</h2>
    <ui-command variant="link">Link Command</ui-command>

    <h2>Small Command</h2>
    <ui-command size="sm">Small Command</ui-command>

    <h2>Large Command</h2>
    <ui-command size="lg">Large Command</ui-command>

    <h2>Icon Command</h2>
    <ui-command size="icon">Icon Command</ui-command>
  </div>
`;

@customElement({ name: "ui-command-demo", template })
export class UiCommandDemo {}
