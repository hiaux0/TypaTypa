import { NavigationInstruction, Params, RouteNode } from "@aurelia/router-lite";
import "./ui-lib-welcome.scss";

export class UiLibWelcome {
  public viewModelName: string;
  public componentPath: string;
  templatePath: string;

  canLoad(params: Params, next: RouteNode): boolean | NavigationInstruction {
    if (params.viewModelName) {
      const { viewModelName, category } = params;
      this.viewModelName = viewModelName;
      if (category?.endsWith("-new")) {
        const actualCategory = category.slice(0, -4);
        this.templatePath = `../${actualCategory}/${viewModelName}/${viewModelName}-demo/${viewModelName}-demo.html`;
        this.componentPath = `../${actualCategory}/${viewModelName}/${viewModelName}-demo/${viewModelName}-demo.ts`;
        return true;
      }

      this.templatePath = `../pages/ui-lib-page/uilib-${category}/${viewModelName}/${viewModelName}.html`;
      this.componentPath = `../pages/ui-lib-page/uilib-${category}/${viewModelName}/${viewModelName}.ts`;
    }
    return true;
  }
}
