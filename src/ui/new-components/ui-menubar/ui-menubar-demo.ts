import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Menubar</h2>
    <ui-menubar items.bind="defaultItems"></ui-menubar>

    <h2>Primary Menubar</h2>
    <ui-menubar items.bind="primaryItems" color="primary"></ui-menubar>

    <h2>Secondary Menubar</h2>
    <ui-menubar items.bind="secondaryItems" color="secondary"></ui-menubar>

    <h2>Destructive Menubar</h2>
    <ui-menubar items.bind="destructiveItems" color="destructive"></ui-menubar>
  </div>
`;

@customElement({ name: "ui-menubar-demo", template })
export class UiMenubarDemo {
  public defaultItems = [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  public primaryItems = [
    { label: "Dashboard", href: "#" },
    { label: "Settings", href: "#" },
    { label: "Profile", href: "#" },
  ];

  public secondaryItems = [
    { label: "Services", href: "#" },
    { label: "Portfolio", href: "#" },
    { label: "Blog", href: "#" },
  ];

  public destructiveItems = [
    { label: "Delete", href: "#" },
    { label: "Remove", href: "#" },
    { label: "Archive", href: "#" },
  ];
}
