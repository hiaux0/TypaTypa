import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const breadcrumbVariants = cva(
  "flex items-center space-x-2 text-sm font-medium",
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
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <template repeat.for="item of items">
        <li>
          <a href.bind="item.href" class.bind="breadcrumbClass">
            \${item.label}
          </a>
        </li>
      </template>
    </ol>
  </nav>
`;

@customElement({
  name: "ui-breadcrumb",
  template,
})
export class UiBreadcrumb {
  @bindable() items: { label: string; href: string }[] = [];
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get breadcrumbClass() {
    return breadcrumbVariants({ color: this.color });
  }
}
