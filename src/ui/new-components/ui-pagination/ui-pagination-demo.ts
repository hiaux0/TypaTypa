import { UiPagination } from "./ui-pagination";

export class UiPaginationDemo {
  public message = "ui-pagination-demo";

  // Example 1: Default Pagination
  public defaultPagination = `
    <ui-pagination pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 2: Destructive Pagination
  public destructivePagination = `
    <ui-pagination variant="destructive" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 3: Outline Pagination
  public outlinePagination = `
    <ui-pagination variant="outline" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 4: Secondary Pagination
  public secondaryPagination = `
    <ui-pagination variant="secondary" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 5: Ghost Pagination
  public ghostPagination = `
    <ui-pagination variant="ghost" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 6: Link Pagination
  public linkPagination = `
    <ui-pagination variant="link" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 7: Small Pagination
  public smallPagination = `
    <ui-pagination size="sm" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  // Example 8: Large Pagination
  public largePagination = `
    <ui-pagination size="lg" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  `;

  public pages = [1, 2, 3, 4, 5];
  public currentPage = 1;

  public handlePageChange(page: number) {
    this.currentPage = page;
  }
}
