import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const alertVariants = cva(
  "p-4 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const template = `
  <div class.bind="alertClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-alert",
  template,
})
export class UiAlert {
  @bindable() variant: "default" | "success" | "warning" | "error" = "default";

  public get alertClass() {
    return alertVariants({ variant: this.variant });
  }
}
