import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      color: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-secondary-100 text-secondary-800",
        destructive: "bg-destructive-100 text-destructive-800",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <span class.bind="badgeClass">
    <au-slot></au-slot>
  </span>
`;

@customElement({
  name: "ui-badge",
  template,
})
export class UiBadge {
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get badgeClass() {
    return badgeVariants({ color: this.color });
  }
}
