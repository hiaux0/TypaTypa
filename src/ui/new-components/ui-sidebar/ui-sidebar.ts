import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 flex flex-col bg-white shadow-lg",
  {
    variants: {
      size: {
        sm: "w-48",
        md: "w-64",
        lg: "w-80",
      },
      color: {
        default: "bg-white",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <div class.bind="sidebarClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-sidebar",
  template,
})
export class UiSidebar {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get sidebarClass() {
    return sidebarVariants({ size: this.size, color: this.color });
  }
}
