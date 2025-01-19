import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const formVariants = cva(
  "space-y-4",
  {
    variants: {
      variant: {
        default: "bg-white",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const template = `
  <form class.bind="formClass" submit.trigger="handleSubmit()">
    <au-slot></au-slot>
  </form>
`;

@customElement({
  name: "ui-form",
  template,
})
export class UiForm {
  @bindable() variant: "default" | "primary" | "secondary" | "destructive" =
    "default";
  @bindable() submit: () => void;

  public get formClass() {
    return formVariants({ variant: this.variant });
  }

  public handleSubmit() {
    if (this.submit) {
      this.submit();
    }
  }
}
