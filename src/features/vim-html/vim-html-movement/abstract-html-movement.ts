import { VimCommandNames } from "../../vim/vim-commands-repository";
import {
  ACTIVE_CLASS,
  ACTIVE_CLASS_SELECTOR,
  CLASS_PARENT_ACTIVE_CLASS,
} from "./constants";
import {
  CommandHandledReturn,
  HorizontalOptions,
  defaulthorizontalOptions,
} from "./vim-html-connection-types";

export abstract class AbstractHtmlMovement {
  private $currentActive: Element | HTMLElement | null;

  public getCurrentActive(): Element | null {
    return this.$currentActive;
  }

  public setCurrentActive(current: Element | null | undefined): void {
    if (!current) return;

    this.$currentActive = current;
  }

  private getCurrentActiveFromClass(): Element | null {
    const $currentActive = document.querySelector(ACTIVE_CLASS_SELECTOR);
    return $currentActive;
  }

  public handleCommand(
    targetCommand: VimCommandNames,
  ): CommandHandledReturn | undefined {
    throw new Error(`Should handle ${targetCommand} in derived class.`);
  }

  public getPreviousSibling() {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    if (!$currentActive.parentElement) return;
    let $previousActive = $currentActive.previousElementSibling;
    if ($previousActive === null) {
      console.log("No element found, circle back?");
      $previousActive = $currentActive.parentElement.lastElementChild;
    }

    return $previousActive as HTMLElement;
  }

  public getNextSibling() {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    if (!$currentActive.parentElement) return;
    let $nextActive = $currentActive.nextElementSibling;
    if ($nextActive === null) {
      console.log("No element found, circle back?");
      $nextActive = $currentActive.parentElement.firstElementChild;
    }

    return $nextActive as HTMLElement;
  }

  /**
   * Future:
   *  0
   *  1| 2  3  <-- Should go to 0
   *  4  5  6
   */
  public getUpSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions,
  ): HTMLElement | undefined {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    const $child = $currentActive.parentElement;
    if (!$child) return;
    const curRect = $currentActive.getBoundingClientRect();
    const { widthDelta } = horizontalOptions;
    if (!widthDelta) return;

    const $upActive = Array.from($child.children)
      .reverse()
      .find((sibling) => {
        if (sibling === $currentActive) return false;

        const siblingRect = sibling.getBoundingClientRect();
        const isAbove = curRect.top >= siblingRect.bottom;
        const isInWidthInterval_Left =
          curRect.left - widthDelta <= siblingRect.left;
        const isInWidthInterval_Right =
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          curRect.right + widthDelta >= siblingRect.right;
        const isInWidthInterval =
          isInWidthInterval_Left && isInWidthInterval_Right;

        if (isAbove && isInWidthInterval) {
          return true;
        }

        return false;
      });

    if ($upActive === undefined) return;

    return $upActive as HTMLElement;
  }

  /**
   * Future:
   *  0  1  2
   *  3  4 |5   <-- should go to 6
   *  6
   */
  public getDownSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions,
  ) {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    const $parent = $currentActive.parentElement;
    if (!$parent) return;
    const curRect = $currentActive.getBoundingClientRect();

    const { widthDelta } = horizontalOptions;
    if (!widthDelta) return;
    const $downActive = Array.from($parent.children).find((sibling) => {
      if (sibling === $currentActive) return false;

      const siblingRect = sibling.getBoundingClientRect();
      const isBelow = curRect.top <= siblingRect.top; // <=: Allow slightly below. Future: option for fullBelow?
      const isInWidthInterval_Left =
        curRect.left - widthDelta <= siblingRect.left;
      const isInWidthInterval_Right =
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        curRect.right + widthDelta >= siblingRect.right;
      const isInWidthInterval =
        isInWidthInterval_Left && isInWidthInterval_Right;

      if (isBelow && isInWidthInterval) {
        return true;
      }

      return false;
    });

    return $downActive as HTMLElement;
  }

  public getFirstSibling() {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    const $parent = $currentActive.parentElement;
    if (!$parent) return;
    const $firstActive = $parent.firstElementChild;

    if ($firstActive === $currentActive) return;

    return $firstActive as HTMLElement;
  }

  public getLastSibling() {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    const $parent = $currentActive.parentElement;
    if (!$parent) return;
    const $lastActive = $parent.lastElementChild;

    if ($lastActive === $currentActive) return;

    return $lastActive as HTMLElement;
  }

  public goToParent(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions,
  ) {
    const { highestParent } = horizontalOptions;
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    if ($currentActive === highestParent) return;
    const $parent = $currentActive.parentElement;
    if ($parent == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $currentActive.classList.remove(CLASS_PARENT_ACTIVE_CLASS);
    $parent.classList.add(ACTIVE_CLASS);
    $parent.classList.remove(CLASS_PARENT_ACTIVE_CLASS);
    const $grandparent = $currentActive.parentElement?.parentElement;
    if ($grandparent) {
      $grandparent.classList.add(CLASS_PARENT_ACTIVE_CLASS);
    }

    return $parent;
  }

  public getFirstChild() {
    const $currentActive = this.getCurrentActiveFromClass();
    if (!$currentActive) return;
    const $child = $currentActive.firstElementChild;
    if ($child == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $currentActive.classList.add(CLASS_PARENT_ACTIVE_CLASS);
    $child.classList.add(ACTIVE_CLASS);
    const $parent = $currentActive.parentElement;
    if ($parent) {
      $parent.classList.remove(CLASS_PARENT_ACTIVE_CLASS);
    }

    return $child as HTMLElement;
  }
}
