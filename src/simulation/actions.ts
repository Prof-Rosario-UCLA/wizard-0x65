import { CardBase as GameCard, Game, CardTeam } from "./simulation";

export class Action {
    game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    exec(): void {}
}

export class AttackAction extends Action {
    constructor(game: Game) {
        super(game);
    }

    exec(): void {
        const playerCard = this.game.playerDeck[0];
        const enemyCard = this.game.enemyDeck[0];

        // attack cards
        playerCard.attack(enemyCard);
        enemyCard.attack(playerCard);
    }
}

export class ChangeHealthAction extends Action {
    card: GameCard;
    amount: number;

    constructor(game: Game, card: GameCard, amount: number) {
        super(game);
        this.card = card;
        this.amount = amount;
    }

    exec(): void {
        this.card.changeHealth(this.amount);
    }
}

export class ChangeDamageAction extends Action {
    card: GameCard;
    amount: number;

    constructor(game: Game, card: GameCard, amount: number) {
        super(game);
        this.card = card;
        this.amount = amount;
    }

    exec(): void {
        this.card.changeDamage(this.amount);
    }
}

export class SpawnCardAction extends Action {
    card: GameCard;
    idx: number;
    team: CardTeam;

    constructor(game: Game, card: GameCard, team: CardTeam, idx: number) {
        super(game);
        this.card = card;
        this.team = team;
        this.idx = idx;
    }

    exec(): void {
        this.game.spawn(this.card, this.team, this.idx);
    }
}

export class SwapHealthAction extends Action {
    card: GameCard;

    constructor(game: Game, card: GameCard) {
        super(game);
        this.card = card;
    }

    exec(): void {
        [this.card.health, this.card.damage] = [
            this.card.damage,
            this.card.health,
        ];
    }
}
