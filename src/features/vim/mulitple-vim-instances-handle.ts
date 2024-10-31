export function popVimInstanceId(): void {
  //if (window.activeVimInstancesIdMap.length > 1) {
  //  window.activeVimInstancesIdMap.pop();
  //}
  // keep 1
  // window.setTimeout(() => {
  if (window.activeVimInstancesIdMap.length > 1) {
    // /*prettier-ignore*/ console.log("[mulitple-vim-instances-handle.ts,9] window.activeVimInstancesIdMap: ", window.activeVimInstancesIdMap);
    window.activeVimInstancesIdMap.pop();
    // /*prettier-ignore*/ console.log("[mulitple-vim-instances-handle.ts,9] window.activeVimInstancesIdMap: ", window.activeVimInstancesIdMap);
  }
  // }, 66);
}
