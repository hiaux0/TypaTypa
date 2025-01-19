import { UiCommand } from "./ui-command";

export class UiCommandDemo {
  public message = "ui-command-demo";

  // Example 1: Default Command
  public defaultCommand = `
    <ui-command>Default Command</ui-command>
  `;

  // Example 2: Destructive Command
  public destructiveCommand = `
    <ui-command variant="destructive">Destructive Command</ui-command>
  `;

  // Example 3: Outline Command
  public outlineCommand = `
    <ui-command variant="outline">Outline Command</ui-command>
  `;

  // Example 4: Secondary Command
  public secondaryCommand = `
    <ui-command variant="secondary">Secondary Command</ui-command>
  `;

  // Example 5: Ghost Command
  public ghostCommand = `
    <ui-command variant="ghost">Ghost Command</ui-command>
  `;

  // Example 6: Link Command
  public linkCommand = `
    <ui-command variant="link">Link Command</ui-command>
  `;

  // Example 7: Small Command
  public smallCommand = `
    <ui-command size="sm">Small Command</ui-command>
  `;

  // Example 8: Large Command
  public largeCommand = `
    <ui-command size="lg">Large Command</ui-command>
  `;

  // Example 9: Icon Command
  public iconCommand = `
    <ui-command size="icon">Icon Command</ui-command>
  `;
}
