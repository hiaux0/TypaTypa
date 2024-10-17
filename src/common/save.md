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

