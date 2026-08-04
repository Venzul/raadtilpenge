export type AnalyticsTab = {
  section: "penge" | "investering";
  tabKey: string;
  label: string;
  path: string;
  hasInputs: boolean;
};

export const ANALYTICS_TABS: AnalyticsTab[] = [
  {
    section: "penge",
    tabKey: "oversigt",
    label: "Penge · Oversigt",
    path: "/penge",
    hasInputs: false,
  },
  {
    section: "penge",
    tabKey: "rentes-rente-beregner",
    label: "Penge · Rentes rente",
    path: "/penge/rentes-rente-beregner",
    hasInputs: true,
  },
  {
    section: "penge",
    tabKey: "fire-beregner",
    label: "Penge · FIRE",
    path: "/penge/fire-beregner",
    hasInputs: true,
  },
  {
    section: "penge",
    tabKey: "boligkoeb-beregner",
    label: "Penge · Boligkøb",
    path: "/penge/boligkoeb-beregner",
    hasInputs: true,
  },
  {
    section: "penge",
    tabKey: "bil-beregner",
    label: "Penge · Bil",
    path: "/penge/bil-beregner",
    hasInputs: true,
  },
  {
    section: "investering",
    tabKey: "oversigt",
    label: "Investering · Oversigt",
    path: "/investering",
    hasInputs: false,
  },
  {
    section: "investering",
    tabKey: "aktie-kontotyper",
    label: "Investering · Aktie kontotyper",
    path: "/investering/aktie-kontotyper",
    hasInputs: false,
  },
  {
    section: "investering",
    tabKey: "index-overview",
    label: "Investering · Indeks",
    path: "/investering/index-overview",
    hasInputs: false,
  },
  {
    section: "investering",
    tabKey: "skats-positivliste",
    label: "Investering · Skats positivliste",
    path: "/investering/skats-positivliste",
    hasInputs: true,
  },
];

export function resolveTabFromPath(pathname: string): {
  section: string | null;
  tabKey: string | null;
} {
  const exact = ANALYTICS_TABS.find((tab) => tab.path === pathname);
  if (exact) {
    return { section: exact.section, tabKey: exact.tabKey };
  }

  if (pathname.startsWith("/penge/")) {
    return {
      section: "penge",
      tabKey: pathname.slice("/penge/".length).split("/")[0] || "oversigt",
    };
  }
  if (pathname.startsWith("/investering/")) {
    return {
      section: "investering",
      tabKey:
        pathname.slice("/investering/".length).split("/")[0] || "oversigt",
    };
  }
  if (pathname === "/penge") return { section: "penge", tabKey: "oversigt" };
  if (pathname === "/investering") {
    return { section: "investering", tabKey: "oversigt" };
  }
  return { section: null, tabKey: null };
}

export function findAnalyticsTab(
  section: string,
  tabKey: string,
): AnalyticsTab | undefined {
  return ANALYTICS_TABS.find(
    (tab) => tab.section === section && tab.tabKey === tabKey,
  );
}
