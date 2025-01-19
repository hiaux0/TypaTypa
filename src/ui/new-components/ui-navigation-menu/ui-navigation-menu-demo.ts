import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Navigation Menu</h2>
    <ui-navigation-menu items.bind="items"></ui-navigation-menu>

    <h2>Primary Navigation Menu</h2>
    <ui-navigation-menu items.bind="items" color="primary"></ui-navigation-menu>

    <h2>Secondary Navigation Menu</h2>
    <ui-navigation-menu items.bind="items" color="secondary"></ui-navigation-menu>

    <h2>Destructive Navigation Menu</h2>
    <ui-navigation-menu items.bind="items" color="destructive"></ui-navigation-menu>
  </div>
`;

@customElement({ name: "ui-navigation-menu-demo", template })
export class UiNavigationMenuDemo {
  public items = [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];
}
