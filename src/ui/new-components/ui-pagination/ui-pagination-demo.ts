import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Pagination</h2>
    <ui-pagination pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Destructive Pagination</h2>
    <ui-pagination variant="destructive" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Outline Pagination</h2>
    <ui-pagination variant="outline" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Secondary Pagination</h2>
    <ui-pagination variant="secondary" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Ghost Pagination</h2>
    <ui-pagination variant="ghost" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Link Pagination</h2>
    <ui-pagination variant="link" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Small Pagination</h2>
    <ui-pagination size="sm" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>

    <h2>Large Pagination</h2>
    <ui-pagination size="lg" pages.bind="pages" currentPage.bind="currentPage" onPageChange.bind="handlePageChange"></ui-pagination>
  </div>
`;

@customElement({ name: "ui-pagination-demo", template })
export class UiPaginationDemo {
  public pages = [1, 2, 3, 4, 5];
  public currentPage = 1;

  public handlePageChange(page: number) {
    this.currentPage = page;
  }
}
