import Link from "next/link";
import { Button } from "./components/button";
import { Card } from "./components/card";
import { Simulation } from "./components/simulation";

export default function Home() {
    return (
        <main className="h-screen w-full">
            <h1>Wizard 0x65</h1>
            <Simulation />
            {/* 
            <Link href="/shop">
                <Button>Hello</Button>
            </Link>
            <Card name="ocaml" scale={2} health={5} dmg={2} /> */}
        </main>
    );
}
