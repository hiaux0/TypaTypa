import { copyToClipboard } from "../../../../../common/modules/platform/clipboard";

type ColorData = {
  name: string;
  value: string;
  textColor: string;
};

const generateColors = (isDark = false): ColorData[] => {
  const primaryText = isDark ? "white" : "black";
  const secondaryText = isDark ? "black" : "white";

  /*prettier-ignore*/
  return [
    { name: "background"                 , value: "hsl(var(--background))"                 , textColor: primaryText      , },
    { name: "foreground"                 , value: "hsl(var(--foreground))"                 , textColor: secondaryText    , },
    { name: "card"                       , value: "hsl(var(--card))"                       , textColor: primaryText },
    { name: "card-foreground"            , value: "hsl(var(--card-foreground))"            , textColor: secondaryText    , },
    { name: "popover"                    , value: "hsl(var(--popover))"                    , textColor: primaryText },
    { name: "popover-foreground"         , value: "hsl(var(--popover-foreground))"         , textColor: secondaryText    , },
    { name: "primary"                    , value: "hsl(var(--primary))"                    , textColor: secondaryText },
    { name: "primary-foreground"         , value: "hsl(var(--primary-foreground))"         , textColor: primaryText      , },
    { name: "secondary"                  , value: "hsl(var(--secondary))"                  , textColor: primaryText      , },
    { name: "secondary-foreground"       , value: "hsl(var(--secondary-foreground))"       , textColor: secondaryText    , },
    { name: "muted"                      , value: "hsl(var(--muted))"                      , textColor: primaryText },
    { name: "muted-foreground"           , value: "hsl(var(--muted-foreground))"           , textColor: secondaryText    , },
    { name: "accent"                     , value: "hsl(var(--accent))"                     , textColor: primaryText },
    { name: "accent-foreground"          , value: "hsl(var(--accent-foreground))"          , textColor: secondaryText    , },
    { name: "destructive"                , value: "hsl(var(--destructive))"                , textColor: secondaryText    , },
    { name: "destructive-foreground"     , value: "hsl(var(--destructive-foreground))"     , textColor: primaryText      , },
    { name: "border"                     , value: "hsl(var(--border))"                     , textColor: primaryText },
    { name: "input"                      , value: "hsl(var(--input))"                      , textColor: primaryText },
    { name: "ring"                       , value: "hsl(var(--ring))"                       , textColor: secondaryText },
    { name: "chart-1"                    , value: "hsl(var(--chart-1))"                    , textColor: primaryText },
    { name: "chart-2"                    , value: "hsl(var(--chart-2))"                    , textColor: primaryText },
    { name: "chart-3"                    , value: "hsl(var(--chart-3))"                    , textColor: secondaryText },
    { name: "chart-4"                    , value: "hsl(var(--chart-4))"                    , textColor: primaryText },
    { name: "chart-5"                    , value: "hsl(var(--chart-5))"                    , textColor: primaryText },
    { name: "radius"                     , value: "0.5rem"                                 , textColor: secondaryText },
    { name: "sidebar-background"         , value: "hsl(var(--sidebar-background))"         , textColor: primaryText      , },
    { name: "sidebar-foreground"         , value: "hsl(var(--sidebar-foreground))"         , textColor: secondaryText    , },
    { name: "sidebar-primary"            , value: "hsl(var(--sidebar-primary))"            , textColor: secondaryText    , },
    { name: "sidebar-primary-foreground" , value: "hsl(var(--sidebar-primary-foreground))" , textColor: primaryText      , },
    { name: "sidebar-accent"             , value: "hsl(var(--sidebar-accent))"             , textColor: primaryText      , },
    { name: "sidebar-accent-foreground"  , value: "hsl(var(--sidebar-accent-foreground))"  , textColor: secondaryText    , },
    { name: "sidebar-border"             , value: "hsl(var(--sidebar-border))"             , textColor: primaryText      , },
    { name: "sidebar-ring"               , value: "hsl(var(--sidebar-ring))"               , textColor: primaryText      , },
  ];
};

const generateSortedColors = (isDark = false): ColorData[] => {
  const primaryText = isDark ? "white" : "black";
  const secondaryText = isDark ? "black" : "white";

  /*prettier-ignore*/
  return [
    { name: "card-foreground"            , value: "hsl(var(--card-foreground))"            , textColor: secondaryText    , },
    { name: "foreground"                 , value: "hsl(var(--foreground))"                 , textColor: secondaryText    , },
    { name: "popover-foreground"         , value: "hsl(var(--popover-foreground))"         , textColor: secondaryText    , },
    { name: "ring"                       , value: "hsl(var(--ring))"                       , textColor: secondaryText },
    { name: "accent-foreground"          , value: "hsl(var(--accent-foreground))"          , textColor: secondaryText    , },
    { name: "primary"                    , value: "hsl(var(--primary))"                    , textColor: secondaryText },
    { name: "secondary-foreground"       , value: "hsl(var(--secondary-foreground))"       , textColor: secondaryText    , },
    { name: "sidebar-accent-foreground"  , value: "hsl(var(--sidebar-accent-foreground))"  , textColor: secondaryText    , },
    { name: "sidebar-primary"            , value: "hsl(var(--sidebar-primary))"            , textColor: secondaryText    , },
    { name: "sidebar-foreground"         , value: "hsl(var(--sidebar-foreground))"         , textColor: secondaryText    , },
    { name: "muted-foreground"           , value: "hsl(var(--muted-foreground))"           , textColor: secondaryText    , },
    { name: "chart-3"                    , value: "hsl(var(--chart-3))"                    , textColor: secondaryText },
    { name: "chart-2"                    , value: "hsl(var(--chart-2))"                    , textColor: primaryText },
    { name: "sidebar-ring"               , value: "hsl(var(--sidebar-ring))"               , textColor: primaryText      , },
    { name: "chart-1"                    , value: "hsl(var(--chart-1))"                    , textColor: primaryText },
    { name: "destructive"                , value: "hsl(var(--destructive))"                , textColor: secondaryText    , },
    { name: "chart-4"                    , value: "hsl(var(--chart-4))"                    , textColor: primaryText },
    { name: "chart-5"                    , value: "hsl(var(--chart-5))"                    , textColor: primaryText },
    { name: "border"                     , value: "hsl(var(--border))"                     , textColor: primaryText },
    { name: "input"                      , value: "hsl(var(--input))"                      , textColor: primaryText },
    { name: "sidebar-border"             , value: "hsl(var(--sidebar-border))"             , textColor: primaryText      , },
    { name: "destructive-foreground"     , value: "hsl(var(--destructive-foreground))"     , textColor: primaryText      , },
    { name: "sidebar-primary-foreground" , value: "hsl(var(--sidebar-primary-foreground))" , textColor: primaryText      , },
    { name: "background"                 , value: "hsl(var(--background))"                 , textColor: primaryText      , },
    { name: "card"                       , value: "hsl(var(--card))"                       , textColor: primaryText },
    { name: "popover"                    , value: "hsl(var(--popover))"                    , textColor: primaryText },
    { name: "primary-foreground"         , value: "hsl(var(--primary-foreground))"         , textColor: primaryText      , },
    { name: "secondary"                  , value: "hsl(var(--secondary))"                  , textColor: primaryText      , },
    { name: "muted"                      , value: "hsl(var(--muted))"                      , textColor: primaryText },
    { name: "accent"                     , value: "hsl(var(--accent))"                     , textColor: primaryText },
    { name: "sidebar-accent"             , value: "hsl(var(--sidebar-accent))"             , textColor: primaryText      , },
    { name: "sidebar-background"         , value: "hsl(var(--sidebar-background))"         , textColor: primaryText      , },
  ];
};

export class UilibColors {
  public colors: ColorData[] = [];
  public sortedColors: ColorData[] = [];

  public copyToClipboard = copyToClipboard;

  attached() {
    const isDarkMode = document
      .querySelector("html")
      ?.classList.contains("dark");

    this.colors = generateColors(isDarkMode);
    this.sortedColors = generateSortedColors(isDarkMode);
    // this.generateSortedColorElements();
  }

  // generate a method, that sorts hsl colors
  // by lightness. SORTS THE COLORS BY LIGHTNESS
  // from darkest to lightest
  private hslToLightness(hsl: string) {
    const [, , lightness] = hsl
      .replace("hsl(", "")
      .replace(")", "")
      .split(",")
      .map((value) => parseFloat(value));

    return lightness;
  }

  public generateSortedColorElements() {
    const sortedColors = [...this.colors].sort((a, b) => {
      return this.hslToLightness(a.value) - this.hslToLightness(b.value);
    });

    this.sortedColors = sortedColors;
  }
}
