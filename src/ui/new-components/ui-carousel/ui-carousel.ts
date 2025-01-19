import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const carouselVariants = cva(
  "relative w-full overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-32",
        md: "h-48",
        lg: "h-64",
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
  <div class.bind="carouselClass">
    <div class="carousel-inner">
      <au-slot></au-slot>
    </div>
  </div>
`;

@customElement({
  name: "ui-carousel",
  template,
})
export class UiCarousel {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get carouselClass() {
    return carouselVariants({ size: this.size, color: this.color });
  }
}
