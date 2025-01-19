import { UiSonner } from "./ui-sonner";

export class UiSonnerDemo {
  public message = "ui-sonner-demo";

  // Example 1: Default Sonner
  public defaultSonner = `
    <ui-sonner></ui-sonner>
  `;

  // Example 2: Small Sonner
  public smallSonner = `
    <ui-sonner size="sm"></ui-sonner>
  `;

  // Example 3: Large Sonner
  public largeSonner = `
    <ui-sonner size="lg"></ui-sonner>
  `;

  // Example 4: Sonner with Top Position
  public topSonner = `
    <ui-sonner position="top"></ui-sonner>
  `;

  // Example 5: Sonner with Left Position
  public leftSonner = `
    <ui-sonner position="left"></ui-sonner>
  `;

  // Example 6: Sonner with Right Position
  public rightSonner = `
    <ui-sonner position="right"></ui-sonner>
  `;
}
