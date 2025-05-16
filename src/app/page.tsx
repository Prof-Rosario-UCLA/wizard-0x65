import Link from "next/link";
import { Button } from "./components/button";

export default function Home() {
  return (
    <main>
      <h1>Wizard 0x65</h1>

      <Link href="/shop">
        <Button>Hello</Button>
      </Link>
    </main>
  );
}
