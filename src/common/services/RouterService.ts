import { IRouter, IRouteableComponent } from "@aurelia/router";
import { DI } from "aurelia";

export type IRouterService = RouterService;
export const IRouterService = DI.createInterface<IRouterService>();

export class RouterService implements IRouteableComponent {
  constructor(@IRouter private router: IRouter) {}

  init(): void | Promise<void> {
    document.addEventListener("keydown", async (event) => {
      return;
      switch (event.key) {
        case "q": {
          await this.quick();
          break;
        }
        case "s": {
          await this.nav("/second-brain-poc");
          break;
        }
      }
    });
  }

  async quick() {
    this.nav("/quick-component");
  }

  async nav(path: string) {
    await this.router.load(path);
  }
}
