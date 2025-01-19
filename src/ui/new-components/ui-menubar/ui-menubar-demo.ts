import { UiMenubar } from "./ui-menubar";

export class UiMenubarDemo {
  public message = "ui-menubar-demo";

  // Example 1: Default Menubar
  public defaultMenubar = `
    <ui-menubar items.bind="defaultItems"></ui-menubar>
  `;

  // Example 2: Primary Menubar
  public primaryMenubar = `
    <ui-menubar items.bind="primaryItems" color="primary"></ui-menubar>
  `;

  // Example 3: Secondary Menubar
  public secondaryMenubar = `
    <ui-menubar items.bind="secondaryItems" color="secondary"></ui-menubar>
  `;

  // Example 4: Destructive Menubar
  public destructiveMenubar = `
    <ui-menubar items.bind="destructiveItems" color="destructive"></ui-menubar>
  `;

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
