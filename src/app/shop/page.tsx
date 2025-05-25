import { CCard, JavaCard } from "~/simulation/cards";
import { Shop } from "../components/shop";

export default function ShopPage() {
    return (
        <main className="m-10">
            <Shop
                cards={Array.from({ length: 8 }).map(() => JavaCard.metadata)}
                deck={Array.from({ length: 4 }).map(() => CCard.metadata)}
            />
        </main>
    );
}
