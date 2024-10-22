-----------------------------------------------------------------------------------------------
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

