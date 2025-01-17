import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const navigationMenuVariants = cva(
  "flex items-center space-x-4",
  {
    variants: {
      color: {
        default: "text-gray-500",
        primary: "text-primary-500",
        secondary: "text-secondary-500",
        destructive: "text-destructive-500",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <nav class="navigation-menu" aria-label="Navigation Menu">
    <ul class="flex items-center space-x-4">
      <template repeat.for="item of items">
        <li>
          <a href.bind="item.href" class.bind="navigationMenuClass">
            \${item.label}
          </a>
        </li>
      </template>
    </ul>
  </nav>
`;

@customElement({
  name: "ui-navigation-menu",
  template,
})
export class UiNavigationMenu {
  @bindable() items: { label: string; href: string }[] = [];
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get navigationMenuClass() {
    return navigationMenuVariants({ color: this.color });
  }
}
