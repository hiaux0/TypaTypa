import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Toggle Group</h2>
    <ui-toggle-group>
      <div>Default Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Destructive Toggle Group</h2>
    <ui-toggle-group variant="destructive">
      <div>Destructive Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Outline Toggle Group</h2>
    <ui-toggle-group variant="outline">
      <div>Outline Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Secondary Toggle Group</h2>
    <ui-toggle-group variant="secondary">
      <div>Secondary Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Ghost Toggle Group</h2>
    <ui-toggle-group variant="ghost">
      <div>Ghost Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Link Toggle Group</h2>
    <ui-toggle-group variant="link">
      <div>Link Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Small Toggle Group</h2>
    <ui-toggle-group size="sm">
      <div>Small Toggle Group Content</div>
    </ui-toggle-group>

    <h2>Large Toggle Group</h2>
    <ui-toggle-group size="lg">
      <div>Large Toggle Group Content</div>
    </ui-toggle-group>
  </div>
`;

@customElement({ name: "ui-toggle-group-demo", template })
export class UiToggleGroupDemo {}
