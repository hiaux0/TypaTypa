import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Carousel</h2>
    <ui-carousel>
      <div>Default Carousel Content 1</div>
      <div>Default Carousel Content 2</div>
    </ui-carousel>

    <h2>Small Carousel</h2>
    <ui-carousel size="sm">
      <div>Small Carousel Content 1</div>
      <div>Small Carousel Content 2</div>
    </ui-carousel>

    <h2>Large Carousel</h2>
    <ui-carousel size="lg">
      <div>Large Carousel Content 1</div>
      <div>Large Carousel Content 2</div>
    </ui-carousel>

    <h2>Primary Color Carousel</h2>
    <ui-carousel color="primary">
      <div>Primary Color Carousel Content 1</div>
      <div>Primary Color Carousel Content 2</div>
    </ui-carousel>

    <h2>Destructive Color Carousel</h2>
    <ui-carousel color="destructive">
      <div>Destructive Color Carousel Content 1</div>
      <div>Destructive Color Carousel Content 2</div>
    </ui-carousel>
  </div>
`;

@customElement({ name: "ui-carousel-demo", template })
export class UiCarouselDemo {}
