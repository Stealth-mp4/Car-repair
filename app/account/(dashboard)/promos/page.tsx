import PromosView from "./PromosView";
import { getPromos } from "@/lib/promos";

/**
 * Server half of the member promos page: the view is a client component (it
 * reads the account store and claims offers), so the promo read happens here
 * and comes down as a prop. Same offers as the public /promos page, from the
 * same table.
 */
export default async function AccountPromosPage() {
  return <PromosView live={await getPromos()} />;
}
