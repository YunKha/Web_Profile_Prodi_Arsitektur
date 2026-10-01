import { buildMainNav } from "@/lib/site";
import { getFacilityNav } from "@/lib/queries/common";
import { NavBar } from "./nav-bar";

export async function SiteHeader() {
  const facilities = await getFacilityNav();
  return <NavBar items={buildMainNav(facilities)} />;
}
