import {
    ChangeDamageAction,
    ChangeHealthAction,
    KillCardAction,
    SpawnCardAction,
    SwapHealthAction,
} from "./actions";
import {
    CardBase,
    CardDiedEvent,
    CardMetadata,
    GameEvent,
    HealthChangedEvent,
    RoundEndEvent,
    RoundStartEvent,
} from "./simulation";
import strings from "./strings";

/**
 * pl_c card
 * When this card dies, it spawns a new copy ot itself with 1 health and 1 damage.
 * This new card will not spawn a copy of itself.
 */
export class CCard extends CardBase {
    depthRemaining: number = 1;

    static get metadata(): CardMetadata {
        return {
            id: "pl_c",
            name: "C",
            description: `
                When this card ${strings.die.pres3rd}, it spawns
                a copy of itself at 1 ${strings.healthUnit} and
                1 ${strings.damageUnit}.
                `,
            baseHealth: 1,
            baseDamage: 1,
            price: 1,
        };
    }

    onEventLate(event: Readonly<GameEvent>): void {
        if (event instanceof CardDiedEvent) {
            if (event.card !== this) {
                return;
            }

            if (this.depthRemaining > 0) {
                const child = new CCard(null, 1, 1);
                child.depthRemaining = this.depthRemaining - 1;
                this.game.spawn(child, this.team, this.game.indexOfCard(this));
            }
        }
    }
}

/**
 * Unreal card
 * This card halves (and ceils) the incoming damage to itself.
 */
export class UnrealCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "ge_unreal",
            name: "Unreal",
            description: `
                Halves all incoming ${strings.damage} to itself.
                `,
            baseHealth: 5,
            baseDamage: 1,
            price: 7,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof HealthChangedEvent) {
            if (event.card !== this || event.delta > 0) {
                return;
            }

            event.delta = -Math.ceil(-event.delta / 2);
        }
    }
}

/**
 * Vim card
 * This card adds 1 health to all friendly cards on round start.
 * It is also the same as vim and neovim
 */
export class VimCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "ide_vim",
            name: "Vim",
            description: `
                Adds 1 ${strings.health} to all friendly cards on round start.
                `,
            baseHealth: 5,
            baseDamage: 1,
            price: 3,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartEvent) {
            for (const card of this.game.getDeck(this.team)) {
                this.game.enqueueAction(
                    new ChangeHealthAction(this.game, card, 1),
                );
            }
        }
    }
}

export class EmacsCard extends VimCard {
    static get metadata(): CardMetadata {
        return {
            ...super.metadata,
            id: "ide_emacs",
            name: "Emacs",
        };
    }
}

export class NeovimCard extends VimCard {
    static get metadata(): CardMetadata {
        return {
            ...super.metadata,
            id: "ide_neovim",
            name: "Neovim",
            price: 4,
        };
    }
}

export class TempleOSCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "os_temple",
            name: "TemplsOS",
            description: `
                Kills self on start.
                `,
            baseHealth: 1,
            baseDamage: 0,
            price: 0,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartEvent) {
            this.game.enqueueAction(
                new KillCardAction(this.game, this),
            );
        }
    }
}

export class ArchCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "os_arch",
            name: "Arch",
            description: `
                Swaps ${strings.health} with ${strings.damage} on round start.
                `,
            baseHealth: 2,
            baseDamage: 2,
            price: 2,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartEvent) {
            const cards = [...this.game.getCards()];
            for (const card of cards) {
                this.game.enqueueAction(new SwapHealthAction(this.game, card));
            }
        }
    }
}

export class LlamaCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "llm_llama",
            name: "Llama",
            description: `
                Rounds up all friendly health and damage to the nearest power of 2.
                `,
            baseHealth: 3,
            baseDamage: 3,
            price: 8,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof RoundEndEvent) {
            const cards = [...this.game.getDeck(this.team)];
            for (const card of cards) {
                const newHealth = Math.pow(
                    2,
                    Math.ceil(Math.log2(card.health)),
                );
                const newDamage = Math.pow(
                    2,
                    Math.ceil(Math.log2(card.damage)),
                );
                this.game.enqueueAction(
                    new ChangeHealthAction(
                        this.game,
                        card,
                        newHealth - card.health,
                    ),
                );
                this.game.enqueueAction(
                    new ChangeDamageAction(
                        this.game,
                        card,
                        newDamage - card.damage,
                    ),
                );
            }
        }
    }
}

export class DeepSeekCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "llm_deepseek",
            name: "Deep Seek",
            description: `
                Merges with the card in front of it on round end.
                `,
            baseHealth: 1,
            baseDamage: 1,
            price: 6,
        };
    }
}

export class BombCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "etc_bomb",
            name: "Bomb",
            description: `
                Deals 1 damage to adjacent cards on death.
                `,
            baseHealth: 1,
            baseDamage: 1,
            price: 0,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof CardDiedEvent) {
            if (event.card !== this) {
                return;
            }

            const idx = this.game.indexOfCard(this);
            const deck = this.game.getDeck(this.team);
            if (idx - 1 >= 0) {
                this.game.enqueueAction(
                    new ChangeHealthAction(this.game, deck[idx - 1], -1),
                );
            }
            if (idx + 1 < deck.length) {
                this.game.enqueueAction(
                    new ChangeHealthAction(this.game, deck[idx + 1], -1),
                );
            }
        }
    }
}

export class JavaCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "pl_java",
            name: "Java",
            description: `
                Fills both decks with bombs on round start.
                `,
            baseHealth: 2,
            baseDamage: 2,
            price: 4,
        };
    }

    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartEvent) {
            for (let i = 0; i < 2; ++i) {
                const team = i === 0 ? this.team : this.oppositeTeam;
                const bombCount = 4 - this.game.getDeck(team).length;

                for (let bombNumber = 0; bombNumber < bombCount; ++bombNumber) {
                    const bomb = new BombCard(null);
                    this.game.enqueueAction(
                        new SpawnCardAction(
                            this.game,
                            bomb,
                            team,
                            (bombNumber * 2) % 4,
                        ),
                    );
                }
            }
        }
    }
}

export const cards = {
    [CCard.metadata.id]: CCard,
    [JavaCard.metadata.id]: JavaCard,

    [UnrealCard.metadata.id]: UnrealCard,

    [VimCard.metadata.id]: VimCard,
    [EmacsCard.metadata.id]: EmacsCard,
    [NeovimCard.metadata.id]: NeovimCard,

    [ArchCard.metadata.id]: ArchCard,
    [TempleOSCard.metadata.id]: TempleOSCard,

    [LlamaCard.metadata.id]: LlamaCard,
    [DeepSeekCard.metadata.id]: DeepSeekCard,
};
