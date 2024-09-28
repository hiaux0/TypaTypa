import { StringUtil } from "../../../../common/modules/string/string";
import { IndentationLevel, IndentationNode } from "../../vim-types";

type FoldMap = Record<number, boolean>;

interface FoldResult {
  foldMap: FoldMap;
  /**
   * TODO: used for where the cursor should move
   */
  parentIndex: number;
}

export function toggleFold(
  indentIndex: IndentationLevel,
  nodes: IndentationNode[],
  foldMap: FoldMap = {},
): FoldResult | undefined {
  indentIndex; /*?*/
  nodes; /*?*/
  foldMap; /*?*/
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: folding.ts:67 ~ foldMap:', foldMap);
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: folding.ts:67 ~ nodes:', nodes);
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: folding.ts:67 ~ indentIndex:', indentIndex);
  // initIndentation
  nodes = initIndentation(nodes);
  // debugger;

  const indeces = findIndecesToFold(nodes, indentIndex);
  indeces; /*?*/
  if (!indeces) return { foldMap, parentIndex: indentIndex };
  const [backwardsIndex, forwardsIndex] = indeces;
  if (backwardsIndex == null) return;
  if (forwardsIndex == null) return;
  forwardsIndex; /*?*/
  backwardsIndex; /*?*/

  let parentIndex = NaN;
  // single child
  if (backwardsIndex === forwardsIndex) {
    if (backwardsIndex === undefined) {
      parentIndex = indentIndex;
    } else {
      // special edge case
      if (indentIndex === backwardsIndex && indentIndex === 0) {
        return { foldMap, parentIndex: 0 };
      } else {
        const isFolded = foldMap[backwardsIndex];
        isFolded; /*?*/
        foldMap[backwardsIndex] = !isFolded;
        foldMap; /*?*/
        parentIndex = Math.max(backwardsIndex - 1, 0);
      }
    }
  } else {
    // + 1 start with node after current
    for (let i = backwardsIndex; i <= forwardsIndex; i++) {
      const folded = foldMap[i];
      foldMap[i] = !folded;
    }
    parentIndex = Math.max(backwardsIndex - 1, 0);
  }

  foldMap; /*?*/
  parentIndex; /*?*/
  return {
    foldMap,
    parentIndex,
  };
}

function findIndecesToFold(
  nodes: IndentationNode[],
  foldIndex: IndentationLevel,
) {
  // Find if has children
  const currentIndentation = nodes[foldIndex]?.indentation;
  if (currentIndentation == null) return;
  const nextIndex = getNext(foldIndex, nodes);
  const nextIndentation = nodes[nextIndex]?.indentation;
  if (nextIndentation == null) return;

  const hasChild =
    currentIndentation < nextIndentation &&
    nodes[foldIndex]?.text?.trim() !== "";

  // if hasChild, then fold all children

  /** * Go back until last possible fold */
  let backwardsIndex: number | undefined = foldIndex;
  /** * Go forward until last possible fold */
  let forwardsIndex: number | undefined = foldIndex;
  if (hasChild) {
    for (let i = nextIndex; i < nodes.length; i++) {
      const thisOne = nodes[i].indentation;
      if (thisOne == null) break;
      const nextOne = nodes[getNext(i, nodes)]?.indentation;
      if (nextOne == null) break;
      const nextNode = nodes[getNext(i, nodes)];

      if (thisOne > currentIndentation) {
        forwardsIndex = i;
        continue;
      } else if (nextNode?.text?.trim() === "") {
        continue;
      } else if (thisOne > nextOne) {
        forwardsIndex = i;
      } else if (thisOne <= currentIndentation) {
        break;
      }
    }

    return [getNext(backwardsIndex, nodes), forwardsIndex]; // + 1: don't fold current one
  }

  // Go back until parent
  for (let i = foldIndex; i >= 0; i--) {
    if (i === 0) break;

    if (nodes[getPrevious(i)] === undefined) {
      backwardsIndex = undefined;
      forwardsIndex = undefined;
      break;
    }
    const thisOneIndent = nodes[i].indentation;
    if (thisOneIndent == null) break;
    const previousOneIndent = nodes[getPrevious(i)].indentation;
    if (previousOneIndent == null) break;
    const thisNodeIsEmpty = nodes[i]?.text?.trim() === "";
    const previousNodeIsEmpty = nodes[getPrevious(i)]?.text?.trim() === "";

    if (thisNodeIsEmpty || previousNodeIsEmpty) {
      continue;
    } else if (thisOneIndent < previousOneIndent) {
      backwardsIndex = undefined;
      break;
    } else if (thisOneIndent > previousOneIndent) {
      backwardsIndex = i;
      break;
    }
  }

  // go forward until parent
  if (backwardsIndex == null) return;
  const backwardsIndent = nodes[getPrevious(backwardsIndex)]?.indentation;
  if (backwardsIndent == null) return;

  for (let i = foldIndex; i < nodes.length; i++) {
    if (nodes[getNext(i, nodes)] === undefined) {
      forwardsIndex = undefined;
      break;
    }

    const thisOneIndent = nodes[i].indentation;
    if (thisOneIndent == null) return;
    const nextIndent = nodes[getNext(i, nodes)]?.indentation;
    if (nextIndent == null) return;
    const thisNodeIsEmpty = nodes[i]?.text?.trim() === "";
    const nextNodeIsEmpty = nodes[getNext(i, nodes)]?.text?.trim() === "";
    if (nextNodeIsEmpty || thisNodeIsEmpty) {
      continue;
    } else if (thisOneIndent <= backwardsIndent) {
      forwardsIndex = getPrevious(i);
      break;
    } else if (nextIndent <= backwardsIndent) {
      forwardsIndex = i;
      break;
    }
  }

  return [backwardsIndex, forwardsIndex];
}

function initIndentation(nodes: IndentationNode[]): IndentationNode[] {
  nodes.forEach((node) => {
    if (node.indentation) return;
    if (!node.text) {
      node.indentation = 0;
      return;
    }

    const result = StringUtil.getLeadingWhitespaceNum(node.text);
    node.indentation = result;

    // init
  });

  return nodes;
}

function getPrevious(index: number): number {
  return Math.max(index - 1, 0);
}

function getNext(index: number, nodes: any[]): number {
  return Math.min(index + 1, nodes.length - 1);
}
