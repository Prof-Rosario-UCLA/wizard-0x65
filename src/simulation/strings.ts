export default {
    health: "runtime",
    damage: "clockspeed",
    healthUnit: "s",
    damageUnit: "GhZ",

    hit: {
        pres1st: "execute",
        pres3rd: "executes",
        past: "hit",
    },

    die: {
        pres1st: "die",
        pres3rd: "dies",
        past: "died",
    },

    spawn: {
        pres1st: "spawn",
        pres3rd: "spawns",
        past: "spawned",
    },
} as const;
