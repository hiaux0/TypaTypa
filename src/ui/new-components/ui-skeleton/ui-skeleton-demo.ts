import { UiSkeleton } from "./ui-skeleton";

export class UiSkeletonDemo {
  public message = "ui-skeleton-demo";

  // Example 1: Default Skeleton
  public defaultSkeleton = `
    <ui-skeleton></ui-skeleton>
  `;

  // Example 2: Small Skeleton
  public smallSkeleton = `
    <ui-skeleton size="sm"></ui-skeleton>
  `;

  // Example 3: Large Skeleton
  public largeSkeleton = `
    <ui-skeleton size="lg"></ui-skeleton>
  `;

  // Example 4: Square Skeleton
  public squareSkeleton = `
    <ui-skeleton shape="square"></ui-skeleton>
  `;

  // Example 5: Circle Skeleton
  public circleSkeleton = `
    <ui-skeleton shape="circle"></ui-skeleton>
  `;
}
