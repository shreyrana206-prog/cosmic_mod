elements.cosmic_dust = {
    color: "#bfb3ff",
    behavior: behaviors.POWDER,
    category: "Cosmic",
    state: "solid",
    density: 1500,
};
elements.cosmic_gas = {
    color: "#d6aaff",
    behavior: behaviors.GAS,
    category: "Cosmic",
    state: "gas",
    density: 0.1,
};
elements.cosmic_liquid = {
    color: "#c28cff",
    behavior: behaviors.LIQUID,
    category: "Cosmic",
    state: "liquid",
    density: 900,
    viscosity: 5,
};
elements.cosmic_fire = {
    color: ["#ff9cff", "#ff7aff", "#ff5cff"],
    behavior: behaviors.FIRE,
    category: "Cosmic",
    state: "gas",
    temperature: 3000,
    reactions: {
    "cosmic_gas": { "elem1": "cosmic_flare" },
    "cosmic_flare": { "elem1": "cosmic_explosion" }
},
};
elements.cosmic_flare = {
    color: "#ffb3ff",
    behavior: behaviors.GAS,
    category: "Cosmic",
    state: "gas",
    temperature: 5000,
    light: 10,

    reactions: {
        "cosmic_void": { "elem1": "cosmic_explosion" }
    },
};
elements.cosmic_crystal = {
    color: ["#d7c6ff", "#cbb3ff", "#bfa0ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 5000,
    tick: function(pixel) {
        // Grow when touching cosmic_liquid
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "cosmic_liquid" && Math.random() < 0.01) {
                createPixel("cosmic_crystal", pixel.x + (Math.floor(Math.random()*3)-1), pixel.y + (Math.floor(Math.random()*3)-1));
            }
        }
    }
};
elements.cosmic_star = {
    color: ["#ffd6ff", "#ffccff", "#ffbaff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    temperature: 8000,
    light: 15,
    tick: function(pixel) {
        // Heat nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            changePixelTemperature(t, 5);
        }

        // Occasionally emit cosmic_fire
        if (Math.random() < 0.02) {
            let dx = Math.floor(Math.random()*3)-1;
            let dy = Math.floor(Math.random()*3)-1;
            createPixel("cosmic_fire", pixel.x + dx, pixel.y + dy);
        }
    }
};
elements.cosmic_void = {
    color: ["#000000", "#1a001a", "#330033"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 10000,
    tick: function(pixel) {
        // Pull nearby pixels inward
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            // Move touching pixels toward the void
            let dx = pixel.x - t.x;
            let dy = pixel.y - t.y;

            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                t.x += Math.sign(dx);
                t.y += Math.sign(dy);
            }

            // Chance to delete pixels that get too close
            if (Math.random() < 0.02) {
                deletePixel(t.x, t.y);
            }
        }

        // Occasionally expand the void
        if (Math.random() < 0.005) {
            let dx = Math.floor(Math.random()*3)-1;
            let dy = Math.floor(Math.random()*3)-1;
            createPixel("cosmic_void", pixel.x + dx, pixel.y + dy);
        }
    }
};
elements.cosmic_explosion = {
    color: ["#ff66ff", "#ff33ff", "#ff00ff"],
    behavior: behaviors.EXPLOSION,
    category: "Cosmic",
    state: "gas",
    temperature: 9000,
    light: 20,
    tick: function(pixel) {
        // Fade out after a short time
        if (Math.random() < 0.1) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
function burstExplosion(x, y, power = 5) {
    for (let i = 0; i < power * 4; i++) {
        let bx = x + Math.floor(Math.random() * power * 2 - power);
        let by = y + Math.floor(Math.random() * power * 2 - power);
        deletePixel(bx, by);
    }
}

elements.radio_being = {
    color: ["#00ff00", "#55ff55", "#99ff99"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 500,
    tick: function(pixel) {
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "radio_being") {
                deletePixel(t.x, t.y);
                pixel.life = (pixel.life || 0) + 1;
            }
        }

        if (pixel.life > 20) {
            for (let i = 0; i < 3; i++) {
                createPixel("burst_star", pixel.x + (i - 1), pixel.y);
            }
            pixel.life = 0;
        }

        if (Math.random() < 0.005) {
            createPixel("radio_being", pixel.x + 1, pixel.y);
        }
    }
};

elements.burst_star = {
    color: ["#ffffaa", "#ffee88"],
    behavior: [
        "XX|XX|XX",
        "XX|XX|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "energy",
    tick: function(pixel) {
        burstExplosion(pixel.x, pixel.y, 4);

        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 10) {
            for (let i = 0; i < 4; i++) {
                let dx = Math.floor(Math.random() * 3 - 1);
                let dy = Math.floor(Math.random() * 3 - 1);
                createPixel("radio_being", pixel.x + dx, pixel.y + dy);
            }
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_tree_trunk = {
    color: ["#663366", "#552255", "#441144"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 3000,
    tick: function(pixel) {
        // Grow upward
        if (Math.random() < 0.01) {
            if (isEmpty(pixel.x, pixel.y - 1)) {
                createPixel("cosmic_tree_trunk", pixel.x, pixel.y - 1);
            }
        }

        // Grow leaves at the top
        if (isEmpty(pixel.x, pixel.y - 2) && Math.random() < 0.005) {
            createPixel("cosmic_leaves", pixel.x, pixel.y - 2);
        }
    }
};

elements.cosmic_leaves = {
    color: ["#99ffdd", "#88ffcc", "#77eebb"],
    behavior: [
        "XX|XX|XX",
        "XX|XX|XX",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 200,
    tick: function(pixel) {
        // Grow fruit
        if (Math.random() < 0.002) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                createPixel("cosmic_fruit", pixel.x, pixel.y + 1);
            }
        }
    }
};

elements.cosmic_vines = {
    color: ["#99ffdd", "#88ffcc", "#77eebb"],
    behavior: [
        "XX|XX|XX",
        "XX|CH|XX",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 50,
    tick: function(pixel) {
        // Grow downward like vines
        if (Math.random() < 0.01) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                createPixel("cosmic_vines", pixel.x, pixel.y + 1);
            }
        }

        // Grow fruit occasionally
        if (Math.random() < 0.002) {
            createPixel("cosmic_fruit", pixel.x, pixel.y + 1);
        }
    }
};

elements.cosmic_fruit = {
    color: ["#ffccff", "#ff99ff", "#ff66ff"],
    behavior: behaviors.FOOD,
    category: "Cosmic",
    state: "solid",
    density: 500,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Decompose after 50,000 ticks
        if (pixel.life > 50000) {
            createPixel("cosmic_dust", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // If eaten by radio_being → drop seed
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "radio_being") {
                deletePixel(pixel.x, pixel.y);
                createPixel("cosmic_tree_trunk", pixel.x, pixel.y);
            }
        }
    }
};
elements.cosmic_goo = {
    color: ["#55ffcc", "#44ddbb", "#33bb99"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "liquid",
    density: 700,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Infect nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_goo" && t.element !== "mutated_goo") {
                deletePixel(t.x, t.y);
                createPixel("cosmic_goo", t.x, t.y);
            }
        }

        // Mutate after eating a lot
        if (pixel.life > 25) {
            createPixel("mutated_goo", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Temperature death → cosmic flames
        if (pixel.temp > 200 || pixel.temp < -15) {
            for (let i = 0; i < 12; i++) {
                let fx = pixel.x + Math.floor(Math.random() * 6 - 3);
                let fy = pixel.y + Math.floor(Math.random() * 6 - 3);
                createPixel("cosmic_fire", fx, fy);
            }
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.mutated_goo = {
    color: ["#88ffee", "#66ddcc", "#55bb99"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "liquid",
    density: 900,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Infect faster
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "mutated_goo") {
                deletePixel(t.x, t.y);
                createPixel("mutated_goo", t.x, t.y);
            }
        }

        // Spread goo seeds
        if (pixel.life % 18 === 0) {
            createPixel("goo_seed", pixel.x + 1, pixel.y);
        }

        // Temperature death → cosmic flames
        if (pixel.temp > 240 || pixel.temp < -20) {
            for (let i = 0; i < 12; i++) {
                let fx = pixel.x + Math.floor(Math.random() * 6 - 3);
                let fy = pixel.y + Math.floor(Math.random() * 6 - 3);
                createPixel("cosmic_fire", fx, fy);
            }
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.goo_seed = {
    color: ["#bbffee", "#ccffdd"],
    behavior: [
        "XX|XX|XX",
        "XX|XX|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 500,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Hatch into cosmic goo
        if (pixel.life > 10) {
            createPixel("cosmic_goo", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_dirt = {
    color: ["#5a3d5a", "#4a2f4a", "#3a223a"],
    behavior: behaviors.POWDER,
    category: "Cosmic",
    state: "solid",
    density: 1800,
    tick: function(pixel) {
        // Very slight settling behavior
        if (Math.random() < 0.01) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                movePixel(pixel, pixel.x, pixel.y + 1);
            }
        }
    }
};
elements.cosmic_stone = {
    color: ["#4b3a4b", "#3d2e3d", "#2f232f"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 4000,
    tick: function(pixel) {
        // Very stable — barely moves
        if (Math.random() < 0.001) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                movePixel(pixel, pixel.x, pixel.y + 1);
            }
        }
    }
};
elements.cosmic_sand = {
    color: ["#d9c2ff", "#c7aaff", "#b899ff"],
    behavior: behaviors.POWDER,
    category: "Cosmic",
    state: "solid",
    density: 1600,
    tick: function(pixel) {
        // Falls faster than dirt
        if (isEmpty(pixel.x, pixel.y + 1)) {
            movePixel(pixel, pixel.x, pixel.y + 1);
        } else if (Math.random() < 0.3) {
            // Slide diagonally
            let dir = Math.random() < 0.5 ? -1 : 1;
            if (isEmpty(pixel.x + dir, pixel.y + 1)) {
                movePixel(pixel, pixel.x + dir, pixel.y + 1);
            }
        }
    }
};
elements.cosmic_clay = {
    color: ["#c49bff", "#b589ff", "#a678ff"],
    behavior: behaviors.POWDER,
    category: "Cosmic",
    state: "solid",
    density: 2000,
    tick: function(pixel) {
        // Slight stickiness: sometimes refuses to fall
        if (Math.random() < 0.7) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                movePixel(pixel, pixel.x, pixel.y + 1);
            }
        }

        // Rare chance to compress into cosmic_stone
        if (Math.random() < 0.0005) {
            createPixel("cosmic_stone", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_rain = {
    color: ["#cfd7ff", "#bfc8ff", "#afbbff"],
    behavior: behaviors.LIQUID,
    category: "Cosmic",
    state: "liquid",
    density: 1000,
    tick: function(pixel) {
        // Fall straight down
        if (isEmpty(pixel.x, pixel.y + 1)) {
            movePixel(pixel, pixel.x, pixel.y + 1);
        }

        // Turn dirt into mud (future element if you want)
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "cosmic_dirt") {
                // Softens dirt slightly
                t.temp -= 1;
            }
        }

        // Evaporate slowly
        if (Math.random() < 0.002) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_snow = {
    color: ["#eef0ff", "#dde0ff", "#ccd1ff"],
    behavior: behaviors.POWDER,
    category: "Cosmic",
    state: "solid",
    density: 900,
    tick: function(pixel) {
        // Fall gently like snow
        if (isEmpty(pixel.x, pixel.y + 1)) {
            movePixel(pixel, pixel.x, pixel.y + 1);
        } else if (Math.random() < 0.2) {
            // Soft diagonal slide
            let dir = Math.random() < 0.5 ? -1 : 1;
            if (isEmpty(pixel.x + dir, pixel.y + 1)) {
                movePixel(pixel, pixel.x + dir, pixel.y + 1);
            }
        }

        // Slowly melt into cosmic_rain
        if (pixel.temp > 5 && Math.random() < 0.002) {
            createPixel("cosmic_rain", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Freeze dirt slightly
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "cosmic_dirt") {
                t.temp -= 0.5;
            }
        }
    }
};
elements.cosmic_wind = {
    color: ["#e3e8ff", "#d5dcff", "#c7d0ff"],
    behavior: behaviors.GAS,
    category: "Cosmic",
    state: "gas",
    density: 0.05,
    tick: function(pixel) {
        // Drift sideways randomly
        let dir = Math.random() < 0.5 ? -1 : 1;
        if (isEmpty(pixel.x + dir, pixel.y)) {
            movePixel(pixel, pixel.x + dir, pixel.y);
        }

        // Push nearby pixels gently
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            // Only push movable pixels
            if (t.element !== "cosmic_wind" && Math.random() < 0.3) {
                let pushDir = Math.random() < 0.5 ? -1 : 1;
                if (isEmpty(t.x + pushDir, t.y)) {
                    movePixel(t, t.x + pushDir, t.y);
                }
            }
        }

        // Slowly fade out
        if (Math.random() < 0.003) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_lightning = {
    color: ["#ffffff", "#e6c2ff", "#d9a6ff"],
    behavior: [
        "XX|XX|XX",
        "XX|XX|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 40,
    tick: function(pixel) {
        // Fall extremely fast
        for (let i = 0; i < 3; i++) {
            if (isEmpty(pixel.x, pixel.y + 1)) {
                movePixel(pixel, pixel.x, pixel.y + 1);
            }
        }

        // MASSIVE impact explosion
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_lightning") {

                // Vaporize a big area
                for (let i = 0; i < 40; i++) {
                    let bx = pixel.x + Math.floor(Math.random() * 10 - 5);
                    let by = pixel.y + Math.floor(Math.random() * 10 - 5);
                    deletePixel(bx, by);
                }

                // Spawn cosmic explosions
                for (let i = 0; i < 6; i++) {
                    let ex = pixel.x + Math.floor(Math.random() * 6 - 3);
                    let ey = pixel.y + Math.floor(Math.random() * 6 - 3);
                    createPixel("cosmic_explosion", ex, ey);
                }

                // Spawn cosmic fire
                for (let i = 0; i < 10; i++) {
                    let fx = pixel.x + Math.floor(Math.random() * 6 - 3);
                    let fy = pixel.y + Math.floor(Math.random() * 6 - 3);
                    createPixel("cosmic_fire", fx, fy);
                }

                deletePixel(pixel.x, pixel.y);
                return;
            }
        }

        // Chain lightning sideways
        if (Math.random() < 0.05) {
            createPixel("cosmic_lightning", pixel.x + 1, pixel.y);
            createPixel("cosmic_lightning", pixel.x - 1, pixel.y);
        }

        // Rare cosmic burst upward
        if (Math.random() < 0.01) {
            createPixel("cosmic_lightning", pixel.x, pixel.y - 1);
        }

        // Fade out quickly
        if (Math.random() < 0.03) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_lightning.reactions = {
    "cosmic_liquid": { "elem2": "cosmic_sapian" }
};
elements.cosmic_plasma = {
    color: ["#ff66ff", "#ff33ff", "#ff00ff"],
    behavior: behaviors.LIQUID,
    category: "Cosmic",
    state: "liquid",
    density: 500,
    temperature: 6000,
    light: 20,
    tick: function(pixel) {
        // Flow like a fast liquid
        if (isEmpty(pixel.x, pixel.y + 1)) {
            movePixel(pixel, pixel.x, pixel.y + 1);
        } else {
            let dir = Math.random() < 0.5 ? -1 : 1;
            if (isEmpty(pixel.x + dir, pixel.y)) {
                movePixel(pixel, pixel.x + dir, pixel.y);
            }
        }

        // Burn nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_plasma") {
                deletePixel(t.x, t.y);
                createPixel("cosmic_fire", t.x, t.y);
            }
        }

        // Rare plasma burst
        if (Math.random() < 0.01) {
            createPixel("cosmic_explosion", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_core = {
    color: ["#ff99ff", "#ff66ff", "#ff33ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 8000,
    temperature: 10000,
    light: 30,
    tick: function(pixel) {
        // Heat nearby pixels massively
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            changePixelTemperature(t, 50);

            // Vaporize weak materials
            if (t.element !== "cosmic_core" && Math.random() < 0.2) {
                deletePixel(t.x, t.y);
                createPixel("cosmic_fire", t.x, t.y);
            }
        }

        // Rare chance to emit cosmic_plasma
        if (Math.random() < 0.01) {
            let dx = Math.floor(Math.random() * 3 - 1);
            let dy = Math.floor(Math.random() * 3 - 1);
            createPixel("cosmic_plasma", pixel.x + dx, pixel.y + dy);
        }

        // Very rare mini‑supernova burst
        if (Math.random() < 0.0005) {
            for (let i = 0; i < 20; i++) {
                let bx = pixel.x + Math.floor(Math.random() * 10 - 5);
                let by = pixel.y + Math.floor(Math.random() * 10 - 5);
                createPixel("cosmic_explosion", bx, by);
            }
        }
    }
};
elements.cosmic_charge = {
    color: ["#ffddff", "#ffbbff", "#ff99ff"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 15,
    tick: function(pixel) {
        // Move quickly in random directions
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;

        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Electrify nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_charge") {
                // Turn them into cosmic_lightning sometimes
                if (Math.random() < 0.05) {
                    createPixel("cosmic_lightning", t.x, t.y);
                    deletePixel(t.x, t.y);
                }

                // Or cosmic_fire
                if (Math.random() < 0.1) {
                    createPixel("cosmic_fire", t.x, t.y);
                }
            }
        }

        // Rare chain reaction: duplicate charge
        if (Math.random() < 0.02) {
            createPixel("cosmic_charge", pixel.x + 1, pixel.y);
        }

        // Fade out quickly
        if (Math.random() < 0.03) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_wave = {
    color: ["#ffccff", "#ffb3ff", "#ff99ff"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 25,
    tick: function(pixel) {
        // Move in a smooth wave-like pattern
        let dir = Math.random() < 0.5 ? -1 : 1;
        let upDown = Math.random() < 0.5 ? -1 : 1;

        if (isEmpty(pixel.x + dir, pixel.y + upDown)) {
            movePixel(pixel, pixel.x + dir, pixel.y + upDown);
        }

        // Push nearby pixels outward
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_wave") {
                let pushX = t.x + (Math.random() < 0.5 ? -1 : 1);
                let pushY = t.y + (Math.random() < 0.5 ? -1 : 1);

                if (isEmpty(pushX, pushY)) {
                    movePixel(t, pushX, pushY);
                }
            }
        }

        // Energize nearby pixels
        for (let t of touching) {
            if (Math.random() < 0.05) {
                createPixel("cosmic_charge", t.x, t.y);
            }
        }

        // Rare cosmic pulse explosion
        if (Math.random() < 0.01) {
            for (let i = 0; i < 15; i++) {
                let bx = pixel.x + Math.floor(Math.random() * 6 - 3);
                let by = pixel.y + Math.floor(Math.random() * 6 - 3);
                createPixel("cosmic_explosion", bx, by);
            }
        }

        // Fade out slowly
        if (Math.random() < 0.02) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_slime = {
    color: ["#aa66ff", "#9955ee", "#8844dd"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "liquid",
    density: 600,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Move slowly like a living blob
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Absorb nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_slime" && t.element !== "mutated_slime") {
                deletePixel(t.x, t.y);
                pixel.life += 2;
            }
        }

        // Mutate into stronger slime
        if (pixel.life > 40) {
            createPixel("mutated_slime", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Temperature reaction → cosmic_plasma
        if (pixel.temp > 150) {
            createPixel("cosmic_plasma", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.mutated_slime = {
    color: ["#cc88ff", "#bb77ee", "#aa66dd"],
    behavior: [
        "XX|XX|XX",
        "XX|M1|XX",
        "XX|XX|XX"
    ],
    category: "Cosmic",
    state: "liquid",
    density: 700,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Move faster
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Infect everything
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "mutated_slime") {
                deletePixel(t.x, t.y);
                createPixel("mutated_slime", t.x, t.y);
            }
        }

        // Rare cosmic explosion burst
        if (Math.random() < 0.005) {
            createPixel("cosmic_explosion", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_bug = {
    color: ["#dd99ff", "#cc88ff", "#bb77ff"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 200,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Crawl randomly in any direction
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Eat nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (
                t.element !== "cosmic_bug" &&
                t.element !== "mutated_bug"
            ) {
                deletePixel(t.x, t.y);
                pixel.life += 3;
            }
        }

        // Reproduce occasionally
        if (Math.random() < 0.01) {
            createPixel("cosmic_bug", pixel.x + 1, pixel.y);
        }

        // Mutate into mutated_bug
        if (pixel.life > 50) {
            createPixel("mutated_bug", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Temperature reaction → cosmic_charge
        if (pixel.temp > 120) {
            createPixel("cosmic_charge", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.mutated_bug = {
    color: ["#eeaaff", "#dd99ff", "#cc88ff"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 250,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Move faster
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Infect everything
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "mutated_bug") {
                deletePixel(t.x, t.y);
                createPixel("mutated_bug", t.x, t.y);
            }
        }

        // Rare cosmic explosion burst
        if (Math.random() < 0.005) {
            createPixel("cosmic_explosion", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_spirit = {
    color: ["#ffffff", "#f2ccff", "#e6b3ff"],
    behavior: [
        "CH|CH|CH",
        "CH|M1|CH",
        "CH|CH|CH"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 20,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Float smoothly in random directions
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        tryMove(pixel, pixel.x + dirX, pixel.y + dirY);

        // Drain energy from nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_spirit" && t.element !== "cosmic_wave") {
                t.temp -= 2;

                // Rarely convert drained pixels into cosmic_charge
                if (Math.random() < 0.03) {
                    createPixel("cosmic_charge", t.x, t.y);
                }
            }
        }

        // Rare teleport jump
        if (Math.random() < 0.01) {
            let jumpX = pixel.x + Math.floor(Math.random() * 7 - 3);
            let jumpY = pixel.y + Math.floor(Math.random() * 7 - 3);
            if (isEmpty(jumpX, jumpY)) {
                movePixel(pixel, jumpX, jumpY);
            }
        }
        // Fade slowly
        if (Math.random() < 0.01) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_animal = {
    color: ["#aa55ff", "#9944ee", "#8833dd"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 1500,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.energy = (pixel.energy || 0);

        // Move like a large creature (slow but strong)
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Eat nearby pixels to gain energy
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (
                t.element !== "cosmic_animal" &&
                t.element !== "cosmic_beast"
            ) {
                deletePixel(t.x, t.y);
                pixel.energy += 3;
            }
        }

        // If energy gets high → transform into cosmic_beast
        if (pixel.energy > 40) {
            createPixel("cosmic_beast", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // If overheated → cosmic_plasma burst
        if (pixel.temp > 180) {
            createPixel("cosmic_plasma", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Rare reproduction
        if (Math.random() < 0.005) {
            createPixel("cosmic_animal", pixel.x + 1, pixel.y);
        }
    }
};
elements.cosmic_beast = {
    color: ["#cc66ff", "#bb55ee", "#aa44dd"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 2000,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Move aggressively
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Destroy anything nearby
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_beast") {
                deletePixel(t.x, t.y);

                // Leave cosmic_fire behind
                if (Math.random() < 0.3) {
                    createPixel("cosmic_fire", t.x, t.y);
                }
            }
        }

        // Rare cosmic explosion roar
        if (Math.random() < 0.01) {
            createPixel("cosmic_explosion", pixel.x, pixel.y);
        }

        // If cooled down → revert to cosmic_animal
        if (pixel.temp < 10 && Math.random() < 0.02) {
            createPixel("cosmic_animal", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_phantom = {
    color: ["#ffffff", "#e6aaff", "#d98cff"],
    behavior: [
        "CH|CH|CH",
        "CH|M1|CH",
        "CH|CH|CH"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 30,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.anger = (pixel.anger || 0);

        // Float quickly through matter
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        tryMove(pixel, pixel.x + dirX, pixel.y + dirY);

        // Drain energy from everything nearby
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_phantom") {
                t.temp -= 4;          // drain heat
                pixel.anger += 1;     // gets angrier

                // Destroy weak materials
                if (Math.random() < 0.1) {
                    deletePixel(t.x, t.y);
                }

                // Convert strong materials into cosmic_spirit
                if (Math.random() < 0.03) {
                    createPixel("cosmic_spirit", t.x, t.y);
                }
            }
        }

        // Teleport aggressively when angry
        if (pixel.anger > 25 && Math.random() < 0.05) {
            let jumpX = pixel.x + Math.floor(Math.random() * 9 - 4);
            let jumpY = pixel.y + Math.floor(Math.random() * 9 - 4);
            if (isEmpty(jumpX, jumpY)) {
                movePixel(pixel, jumpX, jumpY);
            }
        }

        // Rage burst → cosmic_wave
        if (pixel.anger > 40) {
            createPixel("cosmic_wave", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Fade out slowly
        if (Math.random() < 0.01) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_titan = {
    color: ["#ff44ff", "#ee33ee", "#dd22dd"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 5000,
    light: 40,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.rage = (pixel.rage || 0);
        pixel.energy = (pixel.energy || 0);

        // Slow but unstoppable movement
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Titan aura: destroy nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_titan") {
                deletePixel(t.x, t.y);

                // Leave cosmic_fire behind
                if (Math.random() < 0.4) {
                    createPixel("cosmic_fire", t.x, t.y);
                }

                // Gain energy from destruction
                pixel.energy += 2;
            }
        }

        // Footstep shockwaves
        if (Math.random() < 0.05) {
            for (let i = 0; i < 20; i++) {
                let sx = pixel.x + Math.floor(Math.random() * 8 - 4);
                let sy = pixel.y + Math.floor(Math.random() * 8 - 4);
                createPixel("cosmic_wave", sx, sy);
            }
        }

        // Rage mode: titan becomes extremely dangerous
        if (pixel.energy > 50) {
            pixel.rage += 1;

            // Rage aura: explosions everywhere
            if (Math.random() < 0.1) {
                let ex = pixel.x + Math.floor(Math.random() * 6 - 3);
                let ey = pixel.y + Math.floor(Math.random() * 6 - 3);
                createPixel("cosmic_explosion", ex, ey);
            }

            // Rage transformation: cosmic_beast swarm
            if (pixel.rage > 30 && Math.random() < 0.05) {
                for (let i = 0; i < 5; i++) {
                    let bx = pixel.x + Math.floor(Math.random() * 5 - 2);
                    let by = pixel.y + Math.floor(Math.random() * 5 - 2);
                    createPixel("cosmic_beast", bx, by);
                }
            }
        }

        // Overheat → titan becomes cosmic_core
        if (pixel.temp > 300) {
            createPixel("cosmic_core", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Rare cosmic titan roar: deletes huge area
        if (Math.random() < 0.002) {
            for (let i = 0; i < 80; i++) {
                let rx = pixel.x + Math.floor(Math.random() * 20 - 10);
                let ry = pixel.y + Math.floor(Math.random() * 20 - 10);
                deletePixel(rx, ry);
            }
        }
    }
};
elements.cosmic_dragon = {
    color: ["#ff77ff", "#ee66ee", "#dd55dd"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 3000,
    light: 35,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.rage = (pixel.rage || 0);
        pixel.energy = (pixel.energy || 0);

        // Flying movement: prefers upward + sideways
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.random() < 0.7 ? -1 : 1; // mostly flies upward
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Wing gust: cosmic_wind burst
        if (Math.random() < 0.05) {
            for (let i = 0; i < 10; i++) {
                let wx = pixel.x + Math.floor(Math.random() * 6 - 3);
                let wy = pixel.y + Math.floor(Math.random() * 6 - 3);
                createPixel("cosmic_wind", wx, wy);
            }
        }

        // Breath attack: cosmic_fire spray
        if (Math.random() < 0.04) {
            for (let i = 0; i < 15; i++) {
                let fx = pixel.x + Math.floor(Math.random() * 8 - 4);
                let fy = pixel.y + Math.floor(Math.random() * 4 + 1); // breath downward
                createPixel("cosmic_fire", fx, fy);
            }
        }

        // Damage aura: burns nearby pixels
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_dragon") {
                deletePixel(t.x, t.y);
                pixel.energy += 2;

                // Leave fire behind
                if (Math.random() < 0.3) {
                    createPixel("cosmic_fire", t.x, t.y);
                }
            }
        }

        // Rage mode: cosmic_lightning storm
        if (pixel.energy > 40) {
            pixel.rage += 1;

            if (Math.random() < 0.1) {
                let lx = pixel.x + Math.floor(Math.random() * 10 - 5);
                let ly = pixel.y + Math.floor(Math.random() * 10 - 5);
                createPixel("cosmic_lightning", lx, ly);
            }

            // Rage transformation: cosmic_beast followers
            if (pixel.rage > 25 && Math.random() < 0.05) {
                for (let i = 0; i < 3; i++) {
                    let bx = pixel.x + Math.floor(Math.random() * 5 - 2);
                    let by = pixel.y + Math.floor(Math.random() * 5 - 2);
                    createPixel("cosmic_beast", bx, by);
                }
            }
        }

        // Overheat → cosmic_plasma burst
        if (pixel.temp > 250) {
            for (let i = 0; i < 20; i++) {
                let px = pixel.x + Math.floor(Math.random() * 8 - 4);
                let py = pixel.y + Math.floor(Math.random() * 8 - 4);
                createPixel("cosmic_plasma", px, py);
            }
            deletePixel(pixel.x, pixel.y);
        }

        // Rare dragon roar: deletes a medium area
        if (Math.random() < 0.003) {
            for (let i = 0; i < 40; i++) {
                let rx = pixel.x + Math.floor(Math.random() * 12 - 6);
                let ry = pixel.y + Math.floor(Math.random() * 12 - 6);
                deletePixel(rx, ry);
            }
        }
    }
};
elements.cosmic_colossus = {
    color: ["#ff22ff", "#ee11ee", "#dd00dd"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 9000,
    light: 50,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.rage = (pixel.rage || 0);
        pixel.energy = (pixel.energy || 0);

        // Massive movement: slow but unstoppable
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Colossus aura: crush everything nearby
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_colossus") {
                deletePixel(t.x, t.y);

                // Leave cosmic_stone behind (like crushed cosmic earth)
                if (Math.random() < 0.4) {
                    createPixel("cosmic_stone", t.x, t.y);
                }

                pixel.energy += 3;
            }
        }

        // Earthquake stomp: shakes a huge area
        if (Math.random() < 0.05) {
            for (let i = 0; i < 60; i++) {
                let qx = pixel.x + Math.floor(Math.random() * 20 - 10);
                let qy = pixel.y + Math.floor(Math.random() * 20 - 10);
                createPixel("cosmic_wave", qx, qy);
            }
        }

        // Cosmic storm: lightning + wind + fire
        if (Math.random() < 0.03) {
            for (let i = 0; i < 30; i++) {
                let sx = pixel.x + Math.floor(Math.random() * 15 - 7);
                let sy = pixel.y + Math.floor(Math.random() * 15 - 7);

                let roll = Math.random();
                if (roll < 0.33) createPixel("cosmic_lightning", sx, sy);
                else if (roll < 0.66) createPixel("cosmic_wind", sx, sy);
                else createPixel("cosmic_fire", sx, sy);
            }
        }

        // Rage mode: catastrophic destruction
        if (pixel.energy > 60) {
            pixel.rage += 1;

            // Rage explosions
            if (Math.random() < 0.15) {
                let ex = pixel.x + Math.floor(Math.random() * 10 - 5);
                let ey = pixel.y + Math.floor(Math.random() * 10 - 5);
                createPixel("cosmic_explosion", ex, ey);
            }

            // Summon cosmic_titans as minions
            if (pixel.rage > 40 && Math.random() < 0.05) {
                for (let i = 0; i < 2; i++) {
                    let tx = pixel.x + Math.floor(Math.random() * 6 - 3);
                    let ty = pixel.y + Math.floor(Math.random() * 6 - 3);
                    createPixel("cosmic_titan", tx, ty);
                }
            }
        }

        // Overheat → becomes cosmic_star
        if (pixel.temp > 350) {
            createPixel("cosmic_star", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // Colossus roar: deletes a massive 30×30 region
        if (Math.random() < 0.002) {
            for (let i = 0; i < 200; i++) {
                let rx = pixel.x + Math.floor(Math.random() * 30 - 15);
                let ry = pixel.y + Math.floor(Math.random() * 30 - 15);
                deletePixel(rx, ry);
            }
        }
    }
};
elements.cosmic_god = {
    color: ["#ffffff", "#ffddff", "#ffbbff"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 60,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;
        pixel.power = (pixel.power || 0);
        pixel.rage = (pixel.rage || 0);

        // Godlike movement: teleports instead of walking
        if (Math.random() < 0.3) {
            let jumpX = pixel.x + Math.floor(Math.random() * 15 - 7);
            let jumpY = pixel.y + Math.floor(Math.random() * 15 - 7);
            if (isEmpty(jumpX, jumpY)) {
                movePixel(pixel, jumpX, jumpY);
            }
        }

        // Reality aura: deletes EVERYTHING nearby
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element !== "cosmic_god") {
                deletePixel(t.x, t.y);

                // Replace reality with cosmic_void
                if (Math.random() < 0.4) {
                    createPixel("cosmic_void", t.x, t.y);
                }

                pixel.power += 3;
            }
        }

        // Cosmic rewrite: turn random pixels into cosmic elements
        if (Math.random() < 0.05) {
            let rx = pixel.x + Math.floor(Math.random() * 10 - 5);
            let ry = pixel.y + Math.floor(Math.random() * 10 - 5);

            let roll = Math.random();
            if (roll < 0.25) createPixel("cosmic_fire", rx, ry);
            else if (roll < 0.5) createPixel("cosmic_lightning", rx, ry);
            else if (roll < 0.75) createPixel("cosmic_wave", rx, ry);
            else createPixel("cosmic_plasma", rx, ry);
        }

        // Godstorm: massive cosmic storm
        if (Math.random() < 0.03) {
            for (let i = 0; i < 80; i++) {
                let sx = pixel.x + Math.floor(Math.random() * 25 - 12);
                let sy = pixel.y + Math.floor(Math.random() * 25 - 12);

                let roll = Math.random();
                if (roll < 0.33) createPixel("cosmic_lightning", sx, sy);
                else if (roll < 0.66) createPixel("cosmic_fire", sx, sy);
                else createPixel("cosmic_wind", sx, sy);
            }
        }

        // Rage mode: cosmic reality collapse
        if (pixel.power > 80) {
            pixel.rage += 1;

            // Collapse: delete huge areas
            if (Math.random() < 0.15) {
                for (let i = 0; i < 150; i++) {
                    let cx = pixel.x + Math.floor(Math.random() * 30 - 15);
                    let cy = pixel.y + Math.floor(Math.random() * 30 - 15);
                    deletePixel(cx, cy);
                }
            }

            // Summon colossus + titan army
            if (pixel.rage > 40 && Math.random() < 0.05) {
                for (let i = 0; i < 3; i++) {
                    let ax = pixel.x + Math.floor(Math.random() * 10 - 5);
                    let ay = pixel.y + Math.floor(Math.random() * 10 - 5);
                    createPixel("cosmic_colossus", ax, ay);
                    createPixel("cosmic_titan", ax + 1, ay + 1);
                }
            }
        }

        // Overheat → becomes a cosmic_star_super (new element if you want)
        if (pixel.temp > 400) {
            createPixel("cosmic_star", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        // God roar: deletes a 50×50 region
        if (Math.random() < 0.0015) {
            for (let i = 0; i < 400; i++) {
                let rx = pixel.x + Math.floor(Math.random() * 50 - 25);
                let ry = pixel.y + Math.floor(Math.random() * 50 - 25);
                deletePixel(rx, ry);
            }
        }
    }
};
elements.cosmic_wisp = {
    color: ["#ffeeff", "#ffddff", "#ffccff"],
    behavior: [
        "CH|CH|CH",
        "CH|M1|CH",
        "CH|CH|CH"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 10,
    tick: function(pixel) {
        // Float gently
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        tryMove(pixel, pixel.x + dirX, pixel.y + dirY);

        // Harmless sparkle effect
        if (Math.random() < 0.02) {
            let sx = pixel.x + Math.floor(Math.random() * 3 - 1);
            let sy = pixel.y + Math.floor(Math.random() * 3 - 1);
            createPixel("cosmic_lightning", sx, sy);
        }

        // Fade out slowly
        if (Math.random() < 0.005) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_creator = {
    color: ["#ccffdd", "#bbffcc", "#aaffbb"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 1000,
    light: 20,
    tick: function(pixel) {
        pixel.life = (pixel.life || 0) + 1;

        // Move slowly and calmly
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Build cosmic terrain
        if (Math.random() < 0.05) {
            let bx = pixel.x + Math.floor(Math.random() * 5 - 2);
            let by = pixel.y + Math.floor(Math.random() * 5 - 2);

            let roll = Math.random();
            if (roll < 0.33) createPixel("cosmic_dirt", bx, by);
            else if (roll < 0.66) createPixel("cosmic_stone", bx, by);
            else createPixel("cosmic_sand", bx, by);
        }

        // Grow cosmic plants
        if (Math.random() < 0.02) {
            let px = pixel.x + Math.floor(Math.random() * 3 - 1);
            let py = pixel.y - 1;
            if (isEmpty(px, py)) {
                createPixel("cosmic_tree_trunk", px, py);
            }
        }

        // Create cosmic_light sources
        if (Math.random() < 0.01) {
            let lx = pixel.x + Math.floor(Math.random() * 3 - 1);
            let ly = pixel.y + Math.floor(Math.random() * 3 - 1);
            createPixel("cosmic_star", lx, ly);
        }
    }
};
elements.cosmic_reaper = {
    color: ["#000000", "#330033", "#550055"],
    behavior: [
        "CH|CH|CH",
        "CH|M1|CH",
        "CH|CH|CH"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 5,
    tick: function(pixel) {
        pixel.hunger = (pixel.hunger || 0) + 1;

        // Float like a ghost
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        tryMove(pixel, pixel.x + dirX, pixel.y + dirY);

        // Hunt ONLY cosmic_god and cosmic_creator
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "cosmic_god" || t.element === "cosmic_creator") {

                // Instead of insta-kill → drain their life/energy
                t.life = (t.life || 0) - 2;
                t.temp -= 3; // weaken them

                // Visual effect: small void spark
                if (Math.random() < 0.2) {
                    createPixel("cosmic_void", t.x, t.y);
                }

                // Reaper feeds
                pixel.hunger = 0;

                // If they reach zero life → THEN they die
                if (t.life <= 0) {
                    deletePixel(t.x, t.y);
                }
            }
        }

        // If starving → cosmic_phantom
        if (pixel.hunger > 80) {
            createPixel("cosmic_phantom", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_guardian = {
    color: ["#99ffdd", "#88ffcc", "#77eebb"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 2000,
    light: 25,
    tick: function(pixel) {
        // Move slowly around
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Protect cosmic_god and cosmic_creator
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "cosmic_god" || t.element === "cosmic_creator") {
                // Heal them slightly
                t.life = (t.life || 0) + 3;
                t.temp += 1;

                // Shield effect: remove void or harmful pixels nearby
                if (Math.random() < 0.3) {
                    deletePixel(pixel.x + (Math.floor(Math.random()*3)-1),
                                pixel.y + (Math.floor(Math.random()*3)-1));
                }
            }

            // Block cosmic_reaper attacks
            if (t.element === "cosmic_reaper") {
                // Push reaper away instead of killing it
                let pushX = t.x + (Math.random() < 0.5 ? -1 : 1);
                let pushY = t.y + (Math.random() < 0.5 ? -1 : 1);
                if (isEmpty(pushX, pushY)) {
                    movePixel(t, pushX, pushY);
                }
            }
        }
    }
};
elements.cosmic_healer = {
    color: ["#ddffee", "#ccffdd", "#bbffcc"],
    behavior: [
        "CH|CH|CH",
        "CH|M1|CH",
        "CH|CH|CH"
    ],
    category: "Cosmic",
    state: "energy",
    density: 0,
    light: 15,
    tick: function(pixel) {
        // Float gently
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        tryMove(pixel, pixel.x + dirX, pixel.y + dirY);

        // Heal cosmic beings
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (
                t.element.includes("cosmic_") &&
                t.element !== "cosmic_reaper" &&
                t.element !== "cosmic_void"
            ) {
                // Restore life
                t.life = (t.life || 0) + 2;

                // Normalize temperature
                if (t.temp < 50) t.temp += 1;
                if (t.temp > 200) t.temp -= 2;

                // Healing spark
                if (Math.random() < 0.2) {
                    createPixel("cosmic_lightning", t.x, t.y);
                }
            }
        }

        // Fade slowly
        if (Math.random() < 0.01) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_sapian = {
    color: ["#ffeeaa", "#ffdd99", "#ffcc88"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 1200,
    tick: function(pixel) {
        pixel.life = (pixel.life || 100);
        pixel.hunger = (pixel.hunger || 0);
        pixel.intel = (pixel.intel || 1);

        // Movement
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }

        let touching = getTouchingPixels(pixel.x, pixel.y);

        // Eat food
        for (let t of touching) {
            if (
                t.element.includes("plant") ||
                t.element.includes("fruit") ||
                t.element.includes("food")
            ) {
                deletePixel(t.x, t.y);
                pixel.hunger = 0;
                pixel.life += 5;
            }
        }

        // Cook meat
        for (let t of touching) {
            if (t.element === "cosmic_meat" && Math.random() < 0.05) {
                deletePixel(t.x, t.y);
                createPixel("cosmic_cookedmeat", t.x, t.y);
            }
        }

        // ⭐⭐ BUILDING CODE GOES HERE ⭐⭐
        if (Math.random() < 0.02) {
            let bx = pixel.x + Math.floor(Math.random()*5 - 2);
            let by = pixel.y + Math.floor(Math.random()*5 - 2);

            let roll = Math.random();
            if (roll < 0.1) createPixel("cosmic_plank", bx, by);
            else if (roll < 0.2) createPixel("cosmic_buildingrocks", bx, by);
            else if (roll < 0.3) createPixel("cosmic_steel", bx, by);
            else if (roll < 0.4) createPixel("cosmic_siment", bx, by);
            else if (roll < 0.5) createPixel("cosmic_glass", bx, by);
            else if (roll < 0.6) createPixel("cosmic_door", bx, by);
            else if (roll < 0.7) createPixel("cosmic_gun", bx, by);
            else if (roll < 0.8) createPixel("cosmic_lasercanon", bx, by);
            else if (roll < 0.9) createPixel("cosmic_plane", bx, by);
            else if (roll < 0.95) createPixel("cosmic_jet", bx, by);
            else if (roll < 0.975) createPixel("cosmic_millitarycamp", bx, by);
            else createPixel("cosmic_defense", bx, by);
        }

        // Farming
        if (Math.random() < 0.015) {
            let fx = pixel.x + Math.floor(Math.random()*3 - 1);
            let fy = pixel.y + 1;
            if (isEmpty(fx, fy)) {
                createPixel("plant", fx, fy);
            }
        }

        // Help humans
        for (let t of touching) {
            if (t.element === "human") {
                t.life = (t.life || 100) + 2;
            }
        }

        // Evolve
        if (pixel.intel > 50 && Math.random() < 0.01) {
            createPixel("cosmic_sapian_elder", pixel.x, pixel.y);
            deletePixel(pixel.x, pixel.y);
        }

        pixel.intel++;
        pixel.hunger++;
        if (pixel.hunger > 200) pixel.life--;
        if (pixel.life <= 0) deletePixel(pixel.x, pixel.y);
    }
};
elements.cosmic_sapian_elder = {
    color: ["#fff0bb", "#ffe0aa", "#ffd099"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 1300,
    tick: function(pixel) {
        pixel.life = (pixel.life || 200);
        pixel.hunger = (pixel.hunger || 0);

        // Move smarter (prefer open space)
        let dirX = Math.floor(Math.random() * 3) - 1;
        let dirY = Math.floor(Math.random() * 3) - 1;
        if (isEmpty(pixel.x + dirX, pixel.y + dirY)) {
            movePixel(pixel, pixel.x + dirX, pixel.y + dirY);
        }

        // Build advanced structures
        if (Math.random() < 0.03) {
            let bx = pixel.x + Math.floor(Math.random() * 5 - 2);
            let by = pixel.y + Math.floor(Math.random() * 5 - 2);

            let roll = Math.random();
            if (roll < 0.33) createPixel("cosmic_metal", bx, by);
            else if (roll < 0.66) createPixel("cosmic_crystal", bx, by);
            else createPixel("cosmic_brick", bx, by);
        }

        // Advanced farming
        if (Math.random() < 0.02) {
            let fx = pixel.x + Math.floor(Math.random() * 3 - 1);
            let fy = pixel.y + 1;
            if (isEmpty(fx, fy)) {
                createPixel("plant", fx, fy);
            }
        }

        // Help humans more
        let touching = getTouchingPixels(pixel.x, pixel.y);
        for (let t of touching) {
            if (t.element === "human") {
                t.life = (t.life || 100) + 5;
                t.temp += 2;
            }
        }

        // Eat food
        for (let t of touching) {
            if (
                t.element.includes("plant") ||
                t.element.includes("food") ||
                t.element.includes("fruit")
            ) {
                deletePixel(t.x, t.y);
                pixel.hunger = 0;
                pixel.life += 10;
            }
        }

        pixel.hunger++;
        if (pixel.hunger > 200) pixel.life--;

        if (pixel.life <= 0) deletePixel(pixel.x, pixel.y);
    }
};
elements.cosmic_dog = {
    color: ["#ffaaee", "#ff99dd", "#ff88cc"],
    behavior: [
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category: "Cosmic",
    state: "solid",
    density: 1200,
    tick: function(pixel) {
        pixel.hunger = (pixel.hunger || 0);

        // Move around
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }

        let touching = getTouchingPixels(pixel.x, pixel.y);

        // Friendly to humans
        for (let t of touching) {
            if (t.element === "human") {
                t.life = (t.life || 100) + 1;
            }
        }

        // Hunt cosmic animals
        for (let t of touching) {
            if (
                t.element === "cosmic_sheep" ||
                t.element === "cosmic_cow" ||
                t.element === "cosmic_pig" ||
                t.element === "cosmic_goat"
            ) {
                deletePixel(t.x, t.y);
                createPixel("cosmic_meat", t.x, t.y);
                pixel.hunger = 0;
            }
        }

        pixel.hunger++;
        if (pixel.hunger > 200) {
            pixel.life = (pixel.life || 100) - 1;
        }
        if ((pixel.life || 100) <= 0) deletePixel(pixel.x, pixel.y);
    }
};
elements.cosmic_sheep = {
    color: ["#ffeeff", "#ffddff", "#ffccff"],
    behavior: ["XX|M1|XX","M1|XX|M1","XX|M1|XX"],
    category: "Cosmic",
    state: "solid",
    density: 1000,
    tick: function(pixel) {
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }
    }
};
elements.cosmic_cow = {
    color: ["#ffccdd", "#ffbbcc", "#ffaabb"],
    behavior: ["XX|M1|XX","M1|XX|M1","XX|M1|XX"],
    category: "Cosmic",
    state: "solid",
    density: 1500,
    tick: function(pixel) {
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }
    }
};
elements.cosmic_pig = {
    color: ["#ff99bb", "#ff88aa", "#ff7799"],
    behavior: ["XX|M1|XX","M1|XX|M1","XX|M1|XX"],
    category: "Cosmic",
    state: "solid",
    density: 1300,
    tick: function(pixel) {
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }
    }
};
elements.cosmic_goat = {
    color: ["#ddffee", "#ccffdd", "#bbffcc"],
    behavior: ["XX|M1|XX","M1|XX|M1","XX|M1|XX"],
    category: "Cosmic",
    state: "solid",
    density: 1100,
    tick: function(pixel) {
        let dx = Math.floor(Math.random()*3)-1;
        let dy = Math.floor(Math.random()*3)-1;
        if (isEmpty(pixel.x+dx, pixel.y+dy)) {
            movePixel(pixel, pixel.x+dx, pixel.y+dy);
        }
    }
};
elements.cosmic_meat = {
    color: ["#ff5577", "#ff4466", "#ff3355"],
    behavior: behaviors.FOOD,
    category: "Cosmic",
    state: "solid",
    density: 900,
};
elements.cosmic_cookedmeat = {
    color: ["#ff9966", "#ff8855", "#ff7744"],
    behavior: behaviors.FOOD,
    category: "Cosmic",
    state: "solid",
    density: 950,
};
elements.cosmic_plank = {
    color: ["#cc99ff", "#bb88ee", "#aa77dd"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 2000,
};
elements.cosmic_buildingrocks = {
    color: ["#aa88cc", "#9977bb", "#8866aa"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 5000,
};
elements.cosmic_steel = {
    color: ["#ddddff", "#ccccff", "#bbbbff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 7000,
};
elements.cosmic_siment = {
    color: ["#bbb0cc", "#aaa0bb", "#9990aa"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 4500,
};
elements.cosmic_glass = {
    color: ["#ffffff", "#eeeeff", "#ddddff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 3000,
    transparent: true,
};
elements.cosmic_door = {
    color: ["#cc77ff", "#bb66ee", "#aa55dd"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 3500,
};
elements.cosmic_gun = {
    color: ["#ff5577", "#ff4466", "#ff3355"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 6000,
};
elements.cosmic_lasercanon = {
    color: ["#ff99ff", "#ff77ff", "#ff55ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 8000,
};
elements.cosmic_plane = {
    color: ["#ccccff", "#bbbbee", "#aaaadd"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 9000,
};
elements.cosmic_jet = {
    color: ["#ddbbff", "#cc99ff", "#bb77ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 9500,
};
elements.cosmic_millitarycamp = {
    color: ["#aa99cc", "#9988bb", "#8877aa"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 6000,
};
elements.cosmic_defense = {
    color: ["#ffccaa", "#ffbb99", "#ffaa88"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 7000,
};
elements.cosmic_mega_bomb = {
    color: ["#ff55ff", "#ff33ff", "#ff11ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 5000,
    tick: function(pixel) {

        // Detonate after a short time
        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 40) {
            // Massive explosion
            for (let i = 0; i < 80; i++) {
                let bx = pixel.x + Math.floor(Math.random()*20 - 10);
                let by = pixel.y + Math.floor(Math.random()*20 - 10);
                deletePixel(bx, by);
                createPixel("cosmic_explosion", bx, by);
            }

            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.chain_star_bomb = {
    color: ["#ffd6ff", "#ffccff", "#ffbaff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 6000,
    tick: function(pixel) {

        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 60) {

            // First explosion
            for (let i = 0; i < 40; i++) {
                let bx = pixel.x + Math.floor(Math.random()*14 - 7);
                let by = pixel.y + Math.floor(Math.random()*14 - 7);
                createPixel("cosmic_explosion", bx, by);
            }

            // Spawn mini stars that explode later
            for (let i = 0; i < 6; i++) {
                let sx = pixel.x + Math.floor(Math.random()*6 - 3);
                let sy = pixel.y + Math.floor(Math.random()*6 - 3);
                createPixel("burst_star", sx, sy);
            }

            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.void_implosion_bomb = {
    color: ["#000000", "#220022", "#330033"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 9000,
    tick: function(pixel) {

        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 50) {

            // Pull everything inward
            for (let i = 0; i < 60; i++) {
                let bx = pixel.x + Math.floor(Math.random()*16 - 8);
                let by = pixel.y + Math.floor(Math.random()*16 - 8);

                let p = pixelMap[bx]?.[by];
                if (p) {
                    p.x += Math.sign(pixel.x - bx);
                    p.y += Math.sign(pixel.y - by);
                }
            }

            // Create a void core
            createPixel("cosmic_void", pixel.x, pixel.y);

            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.supernova_bomb = {
    color: ["#ff99ff", "#ff66ff", "#ff33ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 7000,
    tick: function(pixel) {

        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 50) {

            // Huge explosion burst
            for (let i = 0; i < 120; i++) {
                let bx = pixel.x + Math.floor(Math.random()*26 - 13);
                let by = pixel.y + Math.floor(Math.random()*26 - 13);
                deletePixel(bx, by);
                createPixel("cosmic_explosion", bx, by);
            }

            // Plasma wave
            for (let i = 0; i < 40; i++) {
                let px = pixel.x + Math.floor(Math.random()*14 - 7);
                let py = pixel.y + Math.floor(Math.random()*14 - 7);
                createPixel("cosmic_plasma", px, py);
            }

            // Fire burst
            for (let i = 0; i < 60; i++) {
                let fx = pixel.x + Math.floor(Math.random()*20 - 10);
                let fy = pixel.y + Math.floor(Math.random()*20 - 10);
                createPixel("cosmic_fire", fx, fy);
            }

            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.black_hole_bomb = {
    color: ["#000000", "#1a001a", "#330033"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 9000,
    tick: function(pixel) {

        pixel.life = (pixel.life || 0) + 1;

        if (pixel.life > 60) {

            // Strong inward pull
            for (let i = 0; i < 100; i++) {
                let bx = pixel.x + Math.floor(Math.random()*30 - 15);
                let by = pixel.y + Math.floor(Math.random()*30 - 15);

                let p = pixelMap[bx]?.[by];
                if (p) {
                    p.x += Math.sign(pixel.x - bx);
                    p.y += Math.sign(pixel.y - by);
                }
            }

            // Delete near pixels
            for (let i = 0; i < 40; i++) {
                let dx = pixel.x + Math.floor(Math.random()*10 - 5);
                let dy = pixel.y + Math.floor(Math.random()*10 - 5);
                deletePixel(dx, dy);
            }

            // Create void core
            createPixel("cosmic_void", pixel.x, pixel.y);

            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.the_total_anaylater = {
    color: ["#ffffff", "#ff99ff", "#ff33ff"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 12000,
    tick: function(pixel) {

        pixel.life = (pixel.life || 0) + 1;

        // PHASE 1 — STAR RISES UP
        if (pixel.life === 20) {
            createPixel("cosmic_star", pixel.x, pixel.y - 1);
        }

        // PHASE 2 — STAR SHOOTS EXPLOSIONS DOWNWARD
        if (pixel.life > 20 && pixel.life < 60) {
            if (Math.random() < 0.3) {
                let ex = pixel.x + Math.floor(Math.random()*6 - 3);
                let ey = pixel.y + Math.floor(Math.random()*20 + 5);
                createPixel("cosmic_explosion", ex, ey);
            }
        }

        // PHASE 3 — GIANT EXPLOSION
        if (pixel.life === 60) {
            for (let i = 0; i < 300; i++) {
                let bx = pixel.x + Math.floor(Math.random()*60 - 30);
                let by = pixel.y + Math.floor(Math.random()*60 - 30);
                deletePixel(bx, by);
                createPixel("cosmic_plasma", bx, by);
                createPixel("cosmic_fire", bx, by);
            }
        }

        // PHASE 4 — COSMIC RAY THAT DELETES WALL + VOID
        if (pixel.life === 80) {
            for (let y = 0; y < height; y++) {
                deletePixel(pixel.x, y);            // deletes ANY pixel (wall, void, etc.)
                createPixel("cosmic_charge", pixel.x, y);
            }
        }

        // PHASE 5 — MAP-WIDE EXPLOSIONS
        if (pixel.life > 100 && pixel.life < 130) {
            for (let i = 0; i < 200; i++) {
                let bx = Math.floor(Math.random() * width);
                let by = Math.floor(Math.random() * height);
                createPixel("cosmic_explosion", bx, by);
                if (Math.random() < 0.3) createPixel("cosmic_plasma", bx, by);
                if (Math.random() < 0.2) createPixel("radio_being", bx, by);
            }
        }

        // PHASE 6 — FINAL ANNIHILATION BURST
        if (pixel.life === 130) {
            for (let i = 0; i < 500; i++) {
                let bx = Math.floor(Math.random() * width);
                let by = Math.floor(Math.random() * height);
                deletePixel(bx, by);
                createPixel("cosmic_fire", bx, by);
                createPixel("cosmic_explosion", bx, by);
                createPixel("cosmic_plasma", bx, by);
            }
        }

        // Remove bomb after final burst
        if (pixel.life > 140) {
            deletePixel(pixel.x, pixel.y);
        }
    }
};
elements.cosmic_metal = {
    color: ["#ccccff", "#bbbbee", "#aaaadd"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 8000,
};
elements.cosmic_brick = {
    color: ["#cc99ff", "#bb88ee", "#aa77dd"],
    behavior: behaviors.WALL,
    category: "Cosmic",
    state: "solid",
    density: 3500,
};