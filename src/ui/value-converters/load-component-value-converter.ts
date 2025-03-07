import { pascalCase } from "aurelia";

export class LoadComponentValueConverter {
  async toView(componentPath: string) {
    const object = await import(/* @vite-ignore */ componentPath);
    const keys = Object.keys(object);
    const name = pascalCase(keys[0]);
    const component = object[name];
    return component;
  }
}
