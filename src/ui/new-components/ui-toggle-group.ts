import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const toggleGroupVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const template = `
  <div class.bind="toggleGroupClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-toggle-group",
  template,
})
export class UiToggleGroup {
  @bindable() variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  @bindable() size: "default" | "sm" | "lg" | "icon";

  public get toggleGroupClass() {
    const styles = toggleGroupVariants({ variant: this.variant });
    return styles;
  }
}
