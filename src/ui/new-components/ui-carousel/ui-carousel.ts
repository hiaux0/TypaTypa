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
  <div class.bind="carouselClass" tabindex="0" role="region" aria-label="Carousel">
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

  attached() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  detached() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      this.prevSlide();
    } else if (event.key === "ArrowRight") {
      this.nextSlide();
    }
  };

  private prevSlide() {
    // Implement previous slide functionality
  }

  private nextSlide() {
    // Implement next slide functionality
  }
}
