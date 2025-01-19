import { UiBadge } from "./ui-badge";

export class UiBadgeDemo {
  public message = "ui-badge-demo";

  // Example 1: Default Badge
  public defaultBadge = `
    <ui-badge>
      <div>Default Badge Content</div>
    </ui-badge>
  `;

  // Example 2: Primary Badge
  public primaryBadge = `
    <ui-badge color="primary">
      <div>Primary Badge Content</div>
    </ui-badge>
  `;

  // Example 3: Secondary Badge
  public secondaryBadge = `
    <ui-badge color="secondary">
      <div>Secondary Badge Content</div>
    </ui-badge>
  `;

  // Example 4: Destructive Badge
  public destructiveBadge = `
    <ui-badge color="destructive">
      <div>Destructive Badge Content</div>
    </ui-badge>
  `;
}
