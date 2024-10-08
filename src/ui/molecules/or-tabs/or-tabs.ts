import { bindable } from "aurelia";
import "./or-tabs.scss";
import { CRUDService } from "../../../common/services/CRUDService";
import { KeyMappingService } from "../../../features/vim/vimCore/commands/KeyMappingService";
import generateId from "../../../common/modules/random/random";

export interface ITab {
  id: string;
  name: string;
}

export interface ITabHooks {
  addTab?: (callback: () => any) => void;
  activeIdChanged?: (newId: string) => void;
  newTabAdded?: (newTab: ITab) => void;
  tabRenamed?: (tab: ITab) => void;
  tabDeleted?: (tab: ITab) => void;
}

type Id = string;

export class OrTabs {
  @bindable tabHooks: ITabHooks = {};
  @bindable activeTabId: Id;
  @bindable tabs: ITab[] = [];

  private debug = false;
  private tab: ITab;
  private tabsCRUD = new CRUDService<ITab>();
  private tabHistoryStackCRUD = new CRUDService<ITab>();

  private componentState = {
    isRename: false,
    oldRenameValue: "",
    renameValue: "",
  };

  get finalTabs() {
    return this.tabsCRUD.readAll();
  }

  get tabHistoryStack() {
    return this.tabHistoryStackCRUD.readAll();
  }

  get activeTab(): ITab | undefined {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (!activeTab) return;
    return activeTab;
  }

  activeTabIdChanged(newId: string) {
    if (this.tabHooks?.activeIdChanged) {
      this.tabHooks.activeIdChanged(newId);
    }
  }

  attached() {
    this.tabsCRUD.replace(this.tabs);

    if (this.activeTabId) {
      if (this.tabHooks.activeIdChanged)
        this.tabHooks.activeIdChanged(this.activeTabId);
    }

    if (!this.activeTabId && this.tabs?.length) {
      this.activeTabId = this.tabs[0].id;
      this.addHistory(this.tabs[0]);
      this.tabsCRUD.setActiveItem(this.tabs[0].id);
    }

    this.initKeys();

    this.tabHooks = {
      addTab: (callback) => {
        const newTab = callback();
        // this.tabsCRUD.create(newTab);
        this.createTab(newTab);
      },
      ...this.tabHooks,
    };
  }

  private initKeys() {
    new KeyMappingService().init({
      "<Control>Home": () => {
        const previous = this.tabsCRUD.getPreviousItem(this.activeTabId);
        this.setActiveTab(previous);
      },
      "<Control>End": () => {
        const next = this.tabsCRUD.getNextItem(this.activeTabId);
        this.setActiveTab(next);
      },
      F2: () => {
        this.componentState.isRename = true;
        if (!this.activeTab) return;

        this.componentState.renameValue = this.activeTab.name ?? "";
        this.componentState.oldRenameValue = this.activeTab.name;
      },
      Escape: () => {
        this.componentState.isRename = false;
        this.componentState.renameValue = "";

        if (this.componentState.oldRenameValue) {
          if (!this.activeTab) return;
          this.activeTab.name = this.componentState.oldRenameValue;
        }
      },
    });
  }

  private setActiveTab(
    tab: ITab | undefined,
    { removed }: { removed?: boolean } = {},
  ) {
    if (!tab) return;

    if (removed) {
      this.removeFromHistory(tab);
      const last = this.tabHistoryStackCRUD.readLast();
      if (!last) {
        const first = this.tabsCRUD.readFirst();
        if (!first) return;
        this.activeTabId = first.id;
        return;
      }

      this.activeTabId = last.id;
      return;
    }

    if (tab.id === this.activeTabId) return;

    this.activeTabId = tab.id;
    this.addHistory(tab);
  }

  private createTab(newTab?: ITab) {
    if (!newTab) {
      const newTabIndex =
        this.tabs.filter((tab) => tab.name.includes("Untitled-")).length + 1;
      newTab = { id: generateId(), name: `Untitled-${newTabIndex}` };
    }
    this.tabsCRUD.create(newTab);
    if (this.tabHooks.newTabAdded) this.tabHooks.newTabAdded(newTab);
    this.setActiveTab(newTab);
  }

  private deleteTab(tab: ITab) {
    this.tabsCRUD.deleteByKey("id", tab.id);

    this.setActiveTab(tab, { removed: true });
    if (this.tabHooks.tabDeleted) this.tabHooks.tabDeleted(tab);
  }

  private addHistory(tab: ITab) {
    this.tabHistoryStackCRUD.create(tab, { allowDuplicate: true });
  }

  private removeFromHistory(tab: ITab) {
    this.tabHistoryStackCRUD.deleteByKey("id", tab.id);
  }

  private rename(event: KeyboardEvent) {
    const isEnter = KeyMappingService.isEnter(event);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: or-tabs.ts:167 ~ isEnter:', isEnter);
    if (!isEnter) return;

    if (!this.activeTab) return;
    this.activeTab.name = this.componentState.renameValue;
    this.componentState.isRename = false;

    if (this.tabHooks.tabRenamed) this.tabHooks.tabRenamed(this.activeTab);
    this.componentState.oldRenameValue = "";
  }
}

/**
 * TODO
 * - [ ] restore
 * - [ ] rename should focus text
 *
 * - [x] rename
 * - [x] add tab (+ button at the end)
 * - [x] add tab : switch to newly added
 * - [x] shortcut for moving between tabs
 *   - current issue, browser hijacks pageDown and pageUp for their tabs
 */
