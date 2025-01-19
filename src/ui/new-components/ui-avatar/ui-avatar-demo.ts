import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Avatar</h2>
    <ui-avatar src="path/to/default-avatar.jpg" alt="Default Avatar"></ui-avatar>

    <h2>Small Avatar</h2>
    <ui-avatar src="path/to/small-avatar.jpg" alt="Small Avatar" size="sm"></ui-avatar>

    <h2>Large Avatar</h2>
    <ui-avatar src="path/to/large-avatar.jpg" alt="Large Avatar" size="lg"></ui-avatar>

    <h2>Primary Color Avatar</h2>
    <ui-avatar src="path/to/primary-avatar.jpg" alt="Primary Avatar" color="primary"></ui-avatar>

    <h2>Destructive Color Avatar</h2>
    <ui-avatar src="path/to/destructive-avatar.jpg" alt="Destructive Avatar" color="destructive"></ui-avatar>
  </div>
`;

@customElement({ name: "ui-avatar-demo", template })
export class UiAvatarDemo {}
