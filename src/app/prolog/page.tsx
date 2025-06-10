"use client";

import { useEffect, useState } from "react";
import { Atom, Prolog, load } from "trealla";
import { Button } from "../components/button";
import { Deck } from "../types";
import { SimulationPlayer } from "../components/simulation";
import { cards } from "~/simulation/cards";

const defaultQuery = `
build(Deck) :-
    total_damage(Deck, D),
    D >= 5.

total_damage([], 0).
total_damage([X|T], Total) :-
    damage(X, D),
    total_damage(T, Rest),
    Total is D + Rest.
`;

export default function PrologPage() {
    const [input, setInput] = useState(defaultQuery);
    const [deck, setDeck] = useState<Deck>([]);

    useEffect(() => {
        (async () => {
            await load();
        })();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Prolog Deck</h1>
            <textarea
                className="w-full max-w-md p-4 border rounded-lg"
                rows={10}
                placeholder="Write your Prolog code here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck="false"
                autoFocus
                style={{ fontFamily: "monospace", resize: "none" }}
            ></textarea>
            <Button
                onClick={async () => {
                    const pl = new Prolog();
                    pl.fs.open("/deck.pl", { write: true, create: true } as any)
                        .writeString(`
                        :- module(deck, [card/1, resolve/1]).
                        ${Object.entries(cards)
                            .map(([id, { metadata }]) => {
                                return `
                            card(${id}).
                            cost(${id}, ${metadata.price}).
                            damage(${id}, ${metadata.baseDamage}).
                            health(${id}, ${metadata.baseHealth}).
                            `;
                            })
                            .join("\n")}
                        is_deck_cards([], Bytes) :- Bytes >= 0.
                        is_deck_cards([X|T], Bytes) :- cost(X, Cost), NewBytes is Bytes - Cost, is_deck_cards(T, NewBytes).
                        is_deck(Deck) :- length(Deck, 4), is_deck_cards(Deck, 8).
                        ${input}
                        resolve(Deck) :- is_deck(Deck), build(Deck).
                    `);

                    await pl.consult("/deck.pl");

                    const result = await pl.queryOnce(
                        "use_module(deck), resolve(X)",
                    );
                    console.log(result);
                    if (result.status === "error") {
                        alert("Failed to create result.");
                        return;
                    }
                    if (result.status === "failure") {
                        alert("No valid deck found.");
                        return;
                    }

                    const { answer } = result as { answer: any };
                    if (!answer) {
                        alert("No valid deck found.");
                        return;
                    }

                    console.log(answer);

                    const deck = answer.X.map((card: Atom): Deck[number] => ({
                        id: card.functor,
                    }));
                    setDeck(deck);
                }}
            >
                Get Deck
            </Button>
            <SimulationPlayer
                isPlayer={true}
                deck={deck
                    .filter((c) => c !== null)
                    .map((card) => ({ metadata: cards[card.id].metadata }))}
            ></SimulationPlayer>
        </div>
    );
}
