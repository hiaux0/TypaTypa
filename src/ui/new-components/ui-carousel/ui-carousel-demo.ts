import { UiCarousel } from "./ui-carousel";

export class UiCarouselDemo {
  public message = "ui-carousel-demo";

  // Example 1: Default Carousel
  public defaultCarousel = `
    <ui-carousel>
      <div>Default Carousel Content 1</div>
      <div>Default Carousel Content 2</div>
    </ui-carousel>
  `;

  // Example 2: Small Carousel
  public smallCarousel = `
    <ui-carousel size="sm">
      <div>Small Carousel Content 1</div>
      <div>Small Carousel Content 2</div>
    </ui-carousel>
  `;

  // Example 3: Large Carousel
  public largeCarousel = `
    <ui-carousel size="lg">
      <div>Large Carousel Content 1</div>
      <div>Large Carousel Content 2</div>
    </ui-carousel>
  `;

  // Example 4: Primary Color Carousel
  public primaryColorCarousel = `
    <ui-carousel color="primary">
      <div>Primary Color Carousel Content 1</div>
      <div>Primary Color Carousel Content 2</div>
    </ui-carousel>
  `;

  // Example 5: Destructive Color Carousel
  public destructiveColorCarousel = `
    <ui-carousel color="destructive">
      <div>Destructive Color Carousel Content 1</div>
      <div>Destructive Color Carousel Content 2</div>
    </ui-carousel>
  `;
}
