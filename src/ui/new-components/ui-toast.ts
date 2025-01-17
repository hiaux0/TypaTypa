import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const toastVariants = cva(
  "fixed bottom-0 right-0 mb-4 mr-4 p-4 rounded-md shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-gray-800 text-white",
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const template = `
  <div class.bind="toastClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-toast",
  template,
})
export class UiToast {
  @bindable() variant: "default" | "success" | "error" | "warning" = "default";

  public get toastClass() {
    return toastVariants({ variant: this.variant });
  }
}
