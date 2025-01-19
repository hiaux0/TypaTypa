import { UiToggleGroup } from "./ui-toggle-group";

export class UiToggleGroupDemo {
  public message = "ui-toggle-group-demo";

  // Example 1: Default Toggle Group
  public defaultToggleGroup = `
    <ui-toggle-group>
      <div>Default Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 2: Destructive Toggle Group
  public destructiveToggleGroup = `
    <ui-toggle-group variant="destructive">
      <div>Destructive Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 3: Outline Toggle Group
  public outlineToggleGroup = `
    <ui-toggle-group variant="outline">
      <div>Outline Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 4: Secondary Toggle Group
  public secondaryToggleGroup = `
    <ui-toggle-group variant="secondary">
      <div>Secondary Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 5: Ghost Toggle Group
  public ghostToggleGroup = `
    <ui-toggle-group variant="ghost">
      <div>Ghost Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 6: Link Toggle Group
  public linkToggleGroup = `
    <ui-toggle-group variant="link">
      <div>Link Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 7: Small Toggle Group
  public smallToggleGroup = `
    <ui-toggle-group size="sm">
      <div>Small Toggle Group Content</div>
    </ui-toggle-group>
  `;

  // Example 8: Large Toggle Group
  public largeToggleGroup = `
    <ui-toggle-group size="lg">
      <div>Large Toggle Group Content</div>
    </ui-toggle-group>
  `;
}
