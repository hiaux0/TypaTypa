import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const resizableVariants = cva(
  "relative",
  {
    variants: {
      size: {
        sm: "w-32 h-32",
        md: "w-48 h-48",
        lg: "w-64 h-64",
      },
      color: {
        default: "bg-gray-200",
        primary: "bg-primary-500",
        secondary: "bg-secondary-500",
        destructive: "bg-destructive-500",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <div class.bind="resizableClass" resize.bind="resizeOptions">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-resizable",
  template,
})
export class UiResizable {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";
  @bindable() resizeOptions: any;

  public get resizableClass() {
    return resizableVariants({ size: this.size, color: this.color });
  }
}
