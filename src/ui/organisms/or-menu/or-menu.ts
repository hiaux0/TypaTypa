import { bindable, observable } from "aurelia";
import "./or-menu.scss";
import {
  DeviceType,
  getScreenSize,
} from "../../../common/modules/platform/screen-size";

export interface OrMenuItem {
  path: string;
  title: string;
}

export type OrMenuConfig = Record<DeviceType, number>;

const collapseRation = 0.66; // document.body.width / menuContainerRef.width

export class OrMenu {
  @bindable items: OrMenuItem[] = [];
  @bindable config: OrMenuConfig = {
    Smartphone: 1,
    BetwPhoneAndTablet: 2,
    Tablet: 5,
    Laptop: 5,
    Monitor: 5,
  };

  public finalItems: OrMenuItem[] = [];
  public remainingItems: OrMenuItem[] = [];
  public menuContainerRef: HTMLElement;
  public showMore = false;

  get menuContainerWidth() {
    const rect = this.menuContainerRef.getBoundingClientRect();
    return rect.width;
  }

  get calcRatio() {
    const ration =
      document.body.getBoundingClientRect().width / this.menuContainerWidth;
    return ration;
  }

  private screenSize: DeviceType;

  attached() {
    this.screenSize = getScreenSize();
    this.updateItemsToDisplay();

    window.addEventListener("resize", this.onResize);
  }

  detached() {
    window.removeEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.screenSize = getScreenSize();
    this.updateItemsToDisplay();
  };

  private updateItemsToDisplay() {
    const amountOfItemsToShow = this.config[this.screenSize];
    this.finalItems = this.items.slice(0, amountOfItemsToShow);
    this.remainingItems = this.items.slice(amountOfItemsToShow);
  }
}
