import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const accordionVariants = cva(
  "border border-gray-200 rounded-md",
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
  <div class.bind="accordionClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-accordion",
  template,
})
export class UiAccordion {
  @bindable() variant: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get accordionClass() {
    return accordionVariants({ variant: this.variant });
  }
}
