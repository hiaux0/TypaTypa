import { bindable } from "aurelia";
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
    Smartphone: 2,
    BetwPhoneAndTablet: 3,
    Tablet: 3,
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

  attached() {
    const screenSize = getScreenSize();
    const amountOfItemsToShow = this.config[screenSize];

    this.finalItems = this.items.slice(0, amountOfItemsToShow);
    this.remainingItems = this.items.slice(amountOfItemsToShow);
  }
}
