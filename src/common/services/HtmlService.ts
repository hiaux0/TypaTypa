import { NodeType } from "../../domain/types/types";

export class HtmlService {
  public static isTextNode(node: Element | ChildNode | undefined): boolean {
    if (!node) return false;

    const is = node.nodeType === NodeType.Text;
    return is;
  }
  public static isBr(node: Element | ChildNode | undefined): boolean {
    if (!node) return false;

    const is = node.nodeName === "BR";
    return is;
  }
  public static isTag(
    node: Element | ChildNode | undefined,
    tagType: keyof HTMLElementTagNameMap,
  ): boolean {
    if (!node) return false;

    const is = node.nodeName === tagType.toUpperCase();
    return is;
  }
}
