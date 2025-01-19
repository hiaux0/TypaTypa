import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Sonner</h2>
    <ui-sonner></ui-sonner>

    <h2>Small Sonner</h2>
    <ui-sonner size="sm"></ui-sonner>

    <h2>Large Sonner</h2>
    <ui-sonner size="lg"></ui-sonner>

    <h2>Sonner with Top Position</h2>
    <ui-sonner position="top"></ui-sonner>

    <h2>Sonner with Left Position</h2>
    <ui-sonner position="left"></ui-sonner>

    <h2>Sonner with Right Position</h2>
    <ui-sonner position="right"></ui-sonner>
  </div>
`;

@customElement({ name: "ui-sonner-demo", template })
export class UiSonnerDemo {}
