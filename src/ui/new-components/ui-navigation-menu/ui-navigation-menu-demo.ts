import { UiNavigationMenu } from "./ui-navigation-menu";

export class UiNavigationMenuDemo {
  public message = "ui-navigation-menu-demo";

  // Example 1: Default Navigation Menu
  public defaultNavigationMenu = `
    <ui-navigation-menu items.bind="items"></ui-navigation-menu>
  `;

  // Example 2: Primary Navigation Menu
  public primaryNavigationMenu = `
    <ui-navigation-menu items.bind="items" color="primary"></ui-navigation-menu>
  `;

  // Example 3: Secondary Navigation Menu
  public secondaryNavigationMenu = `
    <ui-navigation-menu items.bind="items" color="secondary"></ui-navigation-menu>
  `;

  // Example 4: Destructive Navigation Menu
  public destructiveNavigationMenu = `
    <ui-navigation-menu items.bind="items" color="destructive"></ui-navigation-menu>
  `;

  public items = [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];
}
