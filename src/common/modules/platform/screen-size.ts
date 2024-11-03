export type DeviceType =
  | "Smartphone"
  | "BetwPhoneAndTablet"
  | "Tablet"
  | "Laptop"
  | "Monitor";
export type DeviceSize = "s" | "m" | "l";

export const screenSizes: Record<DeviceType, Record<DeviceSize, number>> = {
  Smartphone: {
    s: 375,
    m: 400,
    l: 428,
  },
  BetwPhoneAndTablet: {
    s: 428,
    m: 667,
    l: 720,
  },
  Tablet: {
    s: 720,
    m: 1080,
    l: 1280,
  },
  Laptop: {
    s: 1280,
    m: 1920,
    l: 2560,
  },
  Monitor: {
    s: 3760,
    m: 3760,
    l: 3760,
  },
};

export function getScreenSize(): DeviceType {
  const width = window.innerWidth;
  if (width < screenSizes.Smartphone.l) {
    return "Smartphone";
  } else if (
    width >= screenSizes.BetwPhoneAndTablet.s &&
    width < screenSizes.BetwPhoneAndTablet.l
  ) {
    return "BetwPhoneAndTablet";
  } else if (width >= screenSizes.Tablet.s && width < screenSizes.Tablet.l) {
    return "Tablet";
  } else if (width >= screenSizes.Laptop.s && width <= screenSizes.Laptop.l) {
    return "Laptop";
  } else if (width > screenSizes.Monitor.s) {
    return "Monitor";
  } else {
    console.log("Screen Size: Unknown");
  }
}
