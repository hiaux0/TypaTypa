import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const scrollAreaVariants = cva(
  "overflow-auto",
  {
    variants: {
      size: {
        sm: "max-h-32",
        md: "max-h-64",
        lg: "max-h-96",
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
  <div class.bind="scrollAreaClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-scroll-area",
  template,
})
export class UiScrollArea {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get scrollAreaClass() {
    return scrollAreaVariants({ size: this.size, color: this.color });
  }
}
