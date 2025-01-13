import { bindable, containerless, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const iconVariants = cva(
  "w-full h-full inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      },
      color: {
        default: "text-gray-400  fill-gray-400",
        primary: "text-primary  fill-primary",
        secondary: "text-secondary  fill-secondary",
        destructive: "text-destructive  fill-destructive",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

@containerless()
export class UiIcon {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "primary";
  @bindable() icon: "repeat" = "repeat";

  get iconClass() {
    return iconVariants({ size: this.size, color: this.color });
  }

  get iconUrl() {
    /**
     * NEED to add id="svg" to your svg file
     */
    return `/icons/${this.icon}.svg#svg`;
  }
}
