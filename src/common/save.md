-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------
// 2. use css variables from 1. to define light and dark theme
@function darkMode2($color) {
  @return scale-color($color, $lightness: -100%);
}

@function get-rgb($variable) {
  @return unquote(
    "rgb(#{red($variable)}, #{green($variable)}, #{blue($variable)})"
  );
}

---
@function darkMode($hsl, $amount: 50%) {
  // Split the HSL value into its components
  $hue: nth($hsl, 1);
  // $saturation: nth($hsl, 2);
  // $lightness: nth($hsl, 3);
  //
  // // Add 50% to the lightness, ensuring it doesn't exceed 100%
  // $new-lightness: min($lightness + $amount, 100%);
  //
  // // Return the new HSL value with updated lightness
  @return hsl($hue, 0%, 10%);
}

@mixin smoke($color, $l) {
  background: scale-color($color, $lightness: $l);
}

@function smokeFn($color, $l) {
  @return scale-color($color, $lightness: $l);
}

$red: var(--red);
$darkred: smokeFn(hsl(0, 100%, 50%), +50%);

-----------------------------------------------------------------------------------------------

    "------------------------------"; /*?*/
    withBinding; /*?*/
    if (!withBinding) return;

    finalBaseBindings.forEach((baseBinding, index) => {
      index; /*?*/
      baseBinding; /*?*/
      if (!baseBinding) return;
      const okayKey = baseBinding.key === withBinding.key;
      okayKey; /*?*/
      let okayCommand = false;
      if (baseBinding.command || withBinding.command) {
        okayCommand = baseBinding.command === withBinding.command;
      }
      okayCommand; /*?*/
      const both = okayKey && okayCommand;
      both; /*?*/
      const one = okayKey || okayCommand;
      one; /*?*/
      const okay = one || both;
      okay; /*?*/
      if (okay) {
        finalBaseBindings[index] = {
          ...finalBaseBindings[index],
          ...withBinding,
        };
      }
    });

-----------------------------------------------------------------------------------------------
    this.inputRef.addEventListener("paste", (e) => {
      e.preventDefault();

      // Get the raw pasted HTML
      var html = (e.originalEvent || e).clipboardData.getData("text/html");

      // Log it to the console
      console.log(html);
      this.pastedHtml = html;
    });

-----------------------------------------------------------------------------------------------
<!--<vim-editor-->
<!--  vim-state.bind="vimState"-->
<!--  show-line-numbers.bind="false"-->
<!--></vim-editor>-->

-----------------------------------------------------------------------------------------------
        console.log("scroll left");
        let transposedLeft = this.getScrollLeftOfCurrentSelection();
        let targetCol = 0;
        // Find col, that is on the left of the current scroll position
        this.iterateOverRowUntil((col) => {
          const { colWidth } = this.activeSheet.colHeaderMap[col];
          transposedLeft -= colWidth;
          if (transposedLeft < 0) {
            targetCol = col;
            return true;
          }
        });
        this.scrollToCol(targetCol);
-----------------------------------------------------------------------------------------------
        console.log("scroll right");
        let transposedRight = this.getScrollRightOfCurrentSelection();
        /*prettier-ignore*/ console.log("[grid-test-page.ts,658] transposedRight: ", transposedRight);
        let widthUntilCurrentCol = 0;
        this.iterateOverRowUntil((col) => {
          const { colWidth } = this.activeSheet.colHeaderMap[col];
          widthUntilCurrentCol += colWidth;
          if (widthUntilCurrentCol > transposedRight) return true;
        });
        /*prettier-ignore*/ console.log("[grid-test-page.ts,663] widthUntilCurrentCol: ", widthUntilCurrentCol);
        let remainingWidthFromCurrentToRight =
          transposedRight - widthUntilCurrentCol;
        let targetCol = 0;
        // Find col, that is on the right of the current scroll position
        this.iterateOverRowFromCurrent(
          (col, row) => {
            console.log(col, row);
            const { colWidth } = this.activeSheet.colHeaderMap[col];
            remainingWidthFromCurrentToRight -= colWidth;
            if (remainingWidthFromCurrentToRight < 0) {
              targetCol = col;
              return true;
            }
          },
          { startCol: this.dragStartColumnIndex + 1 },
        );
        /*prettier-ignore*/ console.log("[grid-test-page.ts,675] targetCol: ", targetCol);
        this.scrollToCol(targetCol + 1);
-----------------------------------------------------------------------------------------------
        //const rowHeaderElement = document.querySelector<HTMLElement>(
        //  ".column-header-corner",
        //);
        //const rowHeaderWidth = getComputedValueFromPixelString(
        //  rowHeaderElement,
        //  "width",
        //);
        //const cellHeight = getCssVar("--cell-height");
        //const inner = document.querySelector(".selection") as HTMLElement;
        //const parent = this.spreadsheetContainerRef;
        //const result = getRelativePosition(parent, inner);
        //const transposedLeft = result.left - rowHeaderWidth;
        //const transposedTop = result.top - cellHeight;
-----------------------------------------------------------------------------------------------
      //const inputScrollWidth = this.getInput()?.scrollWidth ?? 0;
      //const maxScrollWidth = Math.max(
      //  this.cellContentRef?.scrollWidth ?? 0,
      //  inputScrollWidth,
      //  this.columnSettings?.colWidth ?? 0,
      //);
      //// const finalScrollWidth = maxScrollWidth - PADDING_LEFT - BORDER_WIDTH;
      //const finalScrollWidth = maxScrollWidth;
      // this.cell.scrollWidth = finalScrollWidth;
      //if (this.column === 0 && this.row === 1) {
      //  /*prettier-ignore*/ console.log("BBBB. ----------------------------");
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,152] this.cell.text: ", this.cell.text);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,154] this.cellContentRef.innerText: ", this.cellContentRef.innerText);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,151] maxScrollWidth: ", maxScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,152] finalScrollWidth: ", finalScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,153] inputScrollWidth: ", inputScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,154] this.cellContentRef.scrollWidth: ", this.cellContentRef.scrollWidth);
      //  /*prettier-ignore*/ console.log(">>>>>>>>>> [grid-cell.ts,155] finalScrollWidth: ", finalScrollWidth);
      //}

-----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------

[VIM_COMMAND.visualMoveToOtherEndOfMarkedArea]: () => {
  const tempA = this.dragStartColumnIndex;
  const tempB = this.dragStartRowIndex;
  this.dragEndColumnIndex = this.dragEndColumnIndex;
  this.dragEndRowIndex = this.dragEndRowIndex;
  this.dragEndColumnIndex = tempA;
  this.dragEndRowIndex = tempB;
},

