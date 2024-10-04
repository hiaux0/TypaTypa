import generateId from "../modules/random/random";

type Id = string;

/**
 * const abcCRUD = new CRUDService(items)
 */
export class CRUDService<T extends { id: string }> {
  private items: T[] = [];
  private activeItemId: Id;

  constructor(public defaultItems?: T[]) {
    if (defaultItems) {
      this.items = defaultItems;
    }
  }

  /** CREATE */
  public create(
    item: Partial<T>,
    options: { allowDuplicate?: boolean; uniqueByKey?: keyof T } = {},
  ): void {
    // @ts-ignore instantiated
    const finalItem: T = {
      id: generateId(),
      ...this.defaultItems,
      ...item,
    };
    const { allowDuplicate, uniqueByKey } = options;

    /** */
    if (allowDuplicate) {
      this.items.push(finalItem);
      return;
    }

    /** */
    let existByKey = -1;
    if (uniqueByKey) {
      existByKey = this.items.findIndex(
        (i) => i[uniqueByKey] === finalItem[uniqueByKey],
      );
    }
    const preventAddDueToExistByKey = existByKey !== -1;
    if (preventAddDueToExistByKey) return;

    /** */
    const existingItemIndex = this.items.findIndex(
      (i) => i.id === finalItem.id,
    );
    const allowUpdate = existingItemIndex !== -1;
    if (allowUpdate) {
      this.items[existingItemIndex] = finalItem;
      return;
    }

    this.items.push(finalItem);
  }

  public insertAt(index: number, items: T[]): T[] {
    const tempLines = structuredClone(this.items);
    tempLines.splice(index, 0, ...items);
    return tempLines;
  }

  public batchCreate(items: T[]): void {
    this.items.push(...items);
  }

  /** READ */

  public readAll(): T[] {
    return this.items;
  }

  public readBetween(start: number, end: number): T[] {
    const collected = [];
    for (let index = start; index <= end; index++) {
      const item = this.items[index];
      collected.push(item);
    }
    return collected;
  }

  public readById(id: Id): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  public readByKey(key: keyof T, value: unknown): T | undefined {
    return this.items.find((item) => item[key] === value);
  }

  public readFirst(): T | undefined {
    if (this.items.length === 0) return;
    const first = this.items[0];
    return first;
  }

  public readLast(): T | undefined {
    if (this.items.length === 0) return;
    const last = this.items[this.items.length - 1];
    return last;
  }

  /** UPDATE */

  public update(updatedItem: T): void {
    const existingItemIndex = this.items.findIndex(
      (i) => i.id === updatedItem.id,
    );
    if (existingItemIndex !== -1) {
      this.items[existingItemIndex] = updatedItem;
    }
  }

  public batchUpdate(updatedItems: T[]): void {
    updatedItems.forEach((updatedItem) => {
      const index = this.items.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        this.items[index] = updatedItem;
      }
    });
  }

  /** DELETE */

  public delete(id: Id): void {
    /*prettier-ignore*/ console.log("[CRUDService.ts,123] this.items: ", this.items);
    const indexToDelete = this.items.findIndex((item) => item.id === id);
    /*prettier-ignore*/ console.log("[CRUDService.ts,123] indexToDelete: ", indexToDelete);
    if (indexToDelete !== -1) {
      this.items.splice(indexToDelete, 1);
    }
  }

  public deleteByKey(key: keyof T, value: T[keyof T]): void {
    this.items = this.items.filter((item) => item[key] !== value);
  }

  /**
   * Inclusive [start,end]
   */
  public deleteBetween(start: number, end: number): T[] {
    const startHalf = this.items.slice(0, start);
    const endHalf = this.items.slice(end + 1, this.items.length);
    const result = [...startHalf, ...endHalf];
    return result;
  }

  public batchDelete(ids: Id[]): void {
    this.items = this.items.filter((item) => !ids.includes(item.id));
  }

  /** Active item */

  public setActiveItem(itemId: Id): void {
    this.activeItemId = itemId;
  }

  public getPreviousItem(itemId: Id): T {
    const currentIndex = this.getCurrentItemIndex(itemId);
    const potentialPrevious = currentIndex - 1;
    const previousIndex = Math.max(potentialPrevious, 0);
    const previous = this.items[previousIndex];
    return previous;
  }

  public getNextItem(itemId: Id): T {
    const currentIndex = this.getCurrentItemIndex(itemId);
    const potentialNext = currentIndex + 1;
    const maxAllowedNext = this.count() - 1;
    const nextIndex = Math.min(potentialNext, maxAllowedNext);
    const next = this.items[nextIndex];
    return next;
  }

  public getCurrentItemIndex(itemId: Id): number {
    // @ts-ignore
    const current = this.findIndexByKey("id", itemId);
    return current;
  }

  /** MISC */

  public count(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }

  public filterByKey(key: keyof T, value: T[keyof T]): T[] {
    return this.items.filter((item) => item[key] === value);
  }

  public findByKey(key: keyof T, value: T[keyof T]): T | undefined {
    return this.items.find((item) => item[key] === value);
  }

  public findIndexByKey(key: keyof T, value: T[keyof T]): number {
    return this.items.findIndex((item) => item[key] === value);
  }

  public replace(items: T[] | undefined): void {
    if (!items) return;
    this.items = items;
  }

  public replaceOne(index: number, replace: T): T[] {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: CRUDService.ts:203 ~ replace:', replace);
    const tempLines = structuredClone(this.items);
    tempLines[index] = replace;
    return tempLines;
  }

  public sort(key: keyof T, ascending = true): void {
    this.items.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === bValue) return 0;
      return ascending ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
    });
  }
}

// Example usage
// interface Item {
//   id: Id;
//   name: string;
// }

// const myService = new CRUDService<Item>();

// myService.create({ id: 1, name: "Item 1" });
// myService.create({ id: 2, name: "Item 2" });
// myService.create({ id: 3, name: "Item 3" });

// console.log(myService.readAll()); // [Item 1, Item 2, Item 3]

// myService.create({ id: 2, name: "Updated Item 2" });
// console.log(myService.readAll()); // [Item 1, Updated Item 2, Item 3]

// console.log(myService.filterByKey("name", "Item 1")); // [Item 1]
