import Link from "next/link";
import { Button } from "../components/button";

export default function Shop() {
  return (
    <main>
      <h1>Wizard 0x65</h1>

      <Link href="/">
        <Button>Back</Button>
      </Link>
    </main>
  );
}
