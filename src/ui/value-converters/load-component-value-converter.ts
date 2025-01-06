import { pascalCase } from "aurelia";

export class LoadComponentValueConverter {
  async toView(componentPath: string) {
    /* @vite-ignore */
    const object = await import(componentPath);
    const keys = Object.keys(object);
    const name = pascalCase(keys[0]);
    const component = object[name];
    return component;
  }
}
