import { AnyObject } from "../../types";

export class TypeService {
  /**
   * ```ts
   * const result = TypeService.mapKeys<IHi, IOkay>(hi, [["hi", "okay"]]);
   * ````
   */
  public static mapKeys<FromType extends AnyObject, ToType extends AnyObject>(
    data: FromType,
    mapping: [from: keyof FromType, to: keyof ToType][],
  ): ToType {
    const mappedData: any = {};
    for (const [from, to] of mapping) {
      if (data[from] !== undefined) {
        mappedData[to] = data[from];
      }
    }
    return mappedData;
  }

  public static mapKeysArray<
    FromType extends AnyObject,
    ToType extends AnyObject,
  >(
    data: FromType[],
    mapping: [from: keyof FromType, to: keyof ToType][],
  ): ToType[] {
    return data.map((item) => this.mapKeys(item, mapping));
  }
}
