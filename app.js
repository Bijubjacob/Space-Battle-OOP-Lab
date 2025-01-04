//let game = document.getElementsByClassName('container')
let start = document.getElementById('start')
let attack = document.getElementById('attack')
let retreat = document.getElementById('retreat')

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;

let GAME_WIDTH_minX = -780;
let GAME_WIDTH = 780;
let GAME_HEIGHT_minY = 0;
const GAME_HEIGHT = 650;

const PLAYER_WIDTH = 20;
const ENEMY_WIDTH = 20;
const PLAYER_MAX_SPEED = 600;
const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.5;
const ENEMYLASER_MAX_SPEED = 300;

const GAME_STATE = {
    lastTime: Date.now(),
    leftPressed: false,
    rightPressed: false,
    spacePressed: false,
    playerX: 0,
    playerY: 0,
    enemyX: 0,
    enemyY: 0,
    playerCooldown: 0, // Add cooldown timer to GAME_STATE
    lasers: [],
    enemylasers: [],
    playerCanFire: true,  // Flag to track if the player can fire
    enemyCanFire: false,   // Flag to track if the enemy can fire
    enemyDirection: 1,  // 1 for moving right, -1 for moving left
    zigzagWidth: 200,   // Horizontal distance for the zigzag
    zigzagSpeed: 100
};

function setPosition(el, x, y) {
    el.style.transform = `translate(${x}px, ${y}px)`;
}

function clamp(v, min, max) {
    if (v <= min) {
        return v;
    } else if (v > max) {
        return max;
    } else {
        return v;
    }
}


//ship class is general ship class
class Ship {
    //class constructor for initializing the instance
    constructor(name, hull, firepower, accuracy,) {
        this.name = name
        this.hull = hull
        this.firepower = firepower
        this.accuracy = accuracy

    }


    attack(enemy) {
        let chance = Math.random()
        if (this.accuracy >= chance) {
            enemy.hull -= this.firepower
            console.log(`${this.name} attacked ${enemy.name} their hull:${enemy.hull}`)
        } else {
            console.log("shot missed")
        }
    }
}



//enemy ship class
class EnemyShip extends Ship {

    constructor(name, hull, firepower, accuracy) {
        super(name, hull, firepower, accuracy)
        this.name = 'enemy'
        this.hull = Math.round((Math.random() * 3)) + 3 // hull random between 3-6
        this.firepower = Math.round((Math.random() * 2)) + 2  // firepower between 2 and 4
        this.accuracy = (Math.random() * 0.2) + 0.6// call to randomaccuracy function
    }

    attack(enemy) {
        let chance = Math.random()
        if (this.accuracy >= chance) {
            enemy.hull -= this.firepower
            console.log(`${this.name} attacked ${enemy.name} their hull:${enemy.hull}`)
        } else {
            console.log("shot missed")
        }
    }
}


start.addEventListener('click', startGame)
let myship = new Ship('uss battlemage', 20, 5, 0.7)

let enemyarr = []

let playerCreated = false;  // Track if player ship has been created

function startGame() {
    // If the player ship is already created, return early
    if (playerCreated) {
        return;
    }

    let enemy = new EnemyShip();
    enemyarr.push(enemy);
    console.log('Game started');
    createPlayer(document.querySelector(".container"));
    playerCreated = true;  // Mark that the player ship has been created


    function createPlayer(container) {
        // Remove previous player ship if it exists (in case of a game reset)
        const existingPlayer = document.querySelector(".myship");
        if (existingPlayer) {
            container.removeChild(existingPlayer);
        }

        // Create the new player ship
        GAME_STATE.playerX = GAME_WIDTH / 20;
        GAME_STATE.playerY = GAME_HEIGHT - 50;
        const player = document.createElement("img");
        player.src = "img/Untitled.png";
        player.className = "myship";
        player.style.height = "100px";
        player.style.width = "75px";

        container.appendChild(player);
        setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
    }



    function updatePlayer(dt, container) {
        if (GAME_STATE.leftPressed) {
            GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
        }
        if (GAME_STATE.rightPressed) {
            GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
        }

        // Clamp player position to stay within bounds
        GAME_STATE.playerX = clamp(Math.max(GAME_WIDTH_minX, Math.min(GAME_STATE.playerX, GAME_WIDTH)));

        // Check if the space key is pressed and if the cooldown is over
        if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
            createLaser(container, GAME_STATE.playerX, GAME_STATE.playerY);
            GAME_STATE.playerCooldown = LASER_COOLDOWN;  // Reset the cooldown
            GAME_STATE.playerHasFiredLaser = true;  // Set flag when the player fires a laser
        }

        // Decrease the cooldown by the time elapsed (dt)
        if (GAME_STATE.playerCooldown > 0) {
            GAME_STATE.playerCooldown -= dt;
        }

        // Update player position on screen
        const player = document.querySelector(".myship");
        if (player) {
            setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
        }
    }


    // Laser creation function (updated to align correctly with ship position)
    function createLaser(container, x, y) {
        console.log(`Creating laser at x: ${x}, y: ${y}`);  // Log laser position for debugging

        // Calculate the direction vector from player to enemy
        const enemyX = GAME_STATE.enemyX;
        const enemyY = GAME_STATE.enemyY;

        const deltaX = enemyX - x;
        const deltaY = enemyY - y;

        // Calculate the distance between the player and the enemy
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Normalize the direction (unit vector)
        const directionX = deltaX / distance;
        const directionY = deltaY / distance;

        // Create laser element
        const element = document.createElement("img");
        element.src = "img/clipart1216920.png";  // Ensure the correct laser image
        element.className = "laser";
        element.style.height = "50px";
        element.style.width = "25px";
        container.appendChild(element);

        // Create the laser object with direction and speed
        const laser = {
            x: x - 120,  // Adjust the starting position
            y: y - 40,   // Adjust the starting position
            element: element,
            directionX: directionX,
            directionY: directionY,
            speed: LASER_MAX_SPEED,  // Set laser speed
            firepower: myship.firepower,  // Include firepower for damage calculation
            isDead: false
        };

        // Add laser to the lasers array
        GAME_STATE.lasers.push(laser);

        // Set the position of the laser
        setPosition(element, laser.x, laser.y);
    }



    // Update laser positions
    function updatelasers(dt, container) {
        const lasers = GAME_STATE.lasers.filter(laser => !laser.isDead);  // Filter out dead lasers
        for (let i = 0; i < lasers.length; i++) {
            const laser = lasers[i];

            // Ensure laser element exists before accessing its position
            if (laser.element) {
                // Move the laser towards the enemy based on direction
                laser.x += laser.directionX * laser.speed * dt;
                laser.y += laser.directionY * laser.speed * dt;

                // Check for laser collision with enemy ship
                if (laser.y <= GAME_STATE.enemyY + ENEMY_WIDTH && laser.x >= GAME_STATE.enemyX && laser.x <= GAME_STATE.enemyX + ENEMY_WIDTH) {
                    // The laser hits the enemy, apply damage based on firepower
                    GAME_STATE.enemy.hull -= laser.firepower;  // Subtract firepower from enemy's hull

                    console.log(`Enemy hit! Enemy hull: ${GAME_STATE.enemy.hull}`);

                    // Destroy the laser after hitting the enemy
                    destroyLaser(container, laser);
                    break;  // Exit the loop once a collision is detected
                }

                // If the laser has moved off the screen, destroy it
                if (laser.y < 0 || laser.y > GAME_HEIGHT || laser.x < GAME_WIDTH_minX || laser.x > GAME_WIDTH) {
                    destroyLaser(container, laser);
                } else {
                    // Update laser position
                    setPosition(laser.element, laser.x, laser.y);
                }
            }
        }
        GAME_STATE.lasers = lasers;  // Update the lasers array (removes dead lasers)
    }


    function destroyLaser(container, laser) {
        if (!laser.isDead && laser.element) {
            container.removeChild(laser.element);  // Remove the laser from the DOM
            laser.isDead = true;  // Mark the laser as dead
        }
    }

    // Enemy Laser creation function (updated to align correctly with Enemyship position)
    function createEnemyShip(container) {
        GAME_STATE.enemyX = GAME_WIDTH / 2; // Start off-screen, left side
        GAME_STATE.enemyY = GAME_HEIGHT / 4;  // Initial vertical position

        // Random movement behavior parameters
        GAME_STATE.directionChangeInterval = Math.random() * 3 + 1; // Random interval for direction change (1-4 seconds)
        GAME_STATE.lastDirectionChangeTime = Date.now();
        GAME_STATE.enemyDirection = Math.random() < 0.5 ? -1 : 1;  // Random starting direction (left or right)
        GAME_STATE.enemySpeed = Math.random() * 150 + 100; // Random speed (between 100 and 250 pixels per second)


        const enemy = document.createElement("img");
        enemy.src = "img/pngegg.png";  // Add your enemy ship image here
        enemy.className = "enemy";
        enemy.style.height = "100px";
        enemy.style.width = "75px";

        container.appendChild(enemy);
        setPosition(enemy, GAME_STATE.enemyX, GAME_STATE.enemyY);  // Set initial position of the enemy ship

        // Optionally, store the enemy object if needed
        GAME_STATE.enemy = enemy;
    }

    // Global function to create enemy laser
    // Function to create the enemy laser, now aimed at the player
    function createEnemyLaser(container, enemyX, enemyY) {
        const element1 = document.createElement("img");
        element1.src = "img/enemypngegg.png";  // Adjust enemy laser image path
        element1.className = "enemylaser";
        element1.style.color = "red";
        element1.style.height = "50px";
        element1.style.width = "25px";
        container.appendChild(element1);

        // Calculate the direction from the enemy to the player
        const playerX = GAME_STATE.playerX;
        const playerY = GAME_STATE.playerY;

        // Calculate the difference in position (direction vector)
        const deltaX = playerX - enemyX;
        const deltaY = playerY - enemyY;

        // Calculate the distance between the enemy and the player
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Normalize the direction (get unit vector)
        const directionX = deltaX / distance;
        const directionY = deltaY / distance;

        // Store the laser object with its direction and speed
        const enemylaser = {
            x: enemyX - 80,  // Adjust laser X position based on enemy's position
            y: enemyY - 40,  // Adjust laser Y position based on enemy's position
            element1,
            directionX,  // Direction the laser will move in X
            directionY,  // Direction the laser will move in Y
            speed: ENEMYLASER_MAX_SPEED,  // Speed of the laser
            isDead: false  // Track if the laser is off-screen or destroyed
        };

        // Add the laser to the list of lasers
        GAME_STATE.enemylasers.push(enemylaser);

        // Set the initial position of the laser
        setPosition(element1, enemylaser.x, enemylaser.y);
    }


    // Variables for tracking the state
    let enemyFireTimer = 0;  // Timer for when the enemy can fire

    const ENEMY_FIRE_DELAY_MIN = 1; // Minimum delay for enemy firing (in seconds)
    const ENEMY_FIRE_DELAY_MAX = 3; // Maximum delay for enemy firing (in seconds)

    // Function for the enemy to fire
    function enemyFiresLaser(container) {
        if (GAME_STATE.playerHasFiredLaser && GAME_STATE.enemyCanFire) {
            // Create the enemy laser after player fires
            createEnemyLaser(container, GAME_STATE.enemyX, GAME_STATE.enemyY);

            // Set a random delay for the next enemy fire
            enemyFireTimer = Math.random() * (ENEMY_FIRE_DELAY_MAX - ENEMY_FIRE_DELAY_MIN) + ENEMY_FIRE_DELAY_MIN;

            // Set enemyCanFire to false so the enemy doesn't fire again immediately
            GAME_STATE.enemyCanFire = false;

            // Reset playerHasFiredLaser to false to wait for the next player shot
            GAME_STATE.playerHasFiredLaser = false;
        }
    }

    // Function to update the enemy lasers, moving them towards the player
    function updateenemylasers(dt, container) {
        const enemylasers = GAME_STATE.enemylasers.filter(laser => !laser.isDead);  // Filter out dead lasers
        for (let i = 0; i < enemylasers.length; i++) {
            const enemylaser = enemylasers[i];

            // Ensure the laser has a valid element before attempting to move it
            if (enemylaser.element1) {
                // Move the laser towards the player based on the calculated direction
                enemylaser.x += enemylaser.directionX * enemylaser.speed * dt;
                enemylaser.y += enemylaser.directionY * enemylaser.speed * dt;

                // Check if the laser has gone off the screen (out of bounds)
                if (enemylaser.y > GAME_HEIGHT || enemylaser.x < GAME_WIDTH_minX || enemylaser.x > GAME_WIDTH) {
                    destroyenemyLaser(container, enemylaser);  // Destroy laser if offscreen
                } else {
                    // Update the laser's position
                    setPosition(enemylaser.element1, enemylaser.x, enemylaser.y);
                }
            }
        }

        // Update the enemylasers array to remove dead lasers
        GAME_STATE.enemylasers = enemylasers;
    }


    // Function to destroy the enemy laser when it goes off-screen
    function destroyenemyLaser(container, enemylaser) {
        if (!enemylaser.isDead && enemylaser.element1) {
            container.removeChild(enemylaser.element1);  // Remove the laser from the DOM
            enemylaser.isDead = true;  // Mark laser as dead
        }
    }


    function updateEnemy(dt) {
        const currentTime = Date.now();
        const timeSinceLastChange = (currentTime - GAME_STATE.lastDirectionChangeTime) / 1000; // Time in seconds

        // Randomly change the direction of the enemy ship every `directionChangeInterval` seconds
        if (timeSinceLastChange >= GAME_STATE.directionChangeInterval) {
            GAME_STATE.enemyDirection = Math.random() < 0.5 ? -1 : 1;  // Random direction (left or right)
            GAME_STATE.directionChangeInterval = Math.random() * 3 + 1; // Randomize next interval (1-4 seconds)
            GAME_STATE.lastDirectionChangeTime = currentTime; // Reset the timer
            GAME_STATE.enemySpeed = Math.random() * 850 + 100; // Randomize speed between 100 and 250
        }

        // Move the enemy horizontally in the current random direction
        GAME_STATE.enemyX += GAME_STATE.enemyDirection * dt * GAME_STATE.enemySpeed;

        // Ensure the enemy doesn't move off-screen horizontally:
        // The enemy should stay within the screen's left and right edges
        GAME_STATE.enemyX = clamp(Math.max(GAME_WIDTH_minX, Math.min(GAME_STATE.enemyX, (GAME_WIDTH - ENEMY_WIDTH))));

        // For random vertical movement, adjust the vertical position slightly each frame
        const verticalMovementSpeed = Math.random() * 100 + 50; // Random speed for vertical movement
        GAME_STATE.enemyY += (Math.random() * 2 - 1) * verticalMovementSpeed * dt;  // Random vertical motion

        // Clamp the vertical position to make sure the enemy stays within the screen's height
        GAME_STATE.enemyY = clamp(Math.max(GAME_HEIGHT_minY, Math.min(GAME_STATE.enemyY, (GAME_HEIGHT - ENEMY_WIDTH) / 2)));

        // Update the position of the enemy ship
        setPosition(GAME_STATE.enemy, GAME_STATE.enemyX, GAME_STATE.enemyY);
    }


    // Update function that runs every frame
    function update() {
        const currentTime = Date.now();
        const dt = (currentTime - GAME_STATE.lastTime) / 1000; // Time delta for smooth animation

        const container = document.querySelector(".container");

        // Update player, lasers, and enemy lasers
        updatePlayer(dt, container);
        updatelasers(dt, container);
        updateenemylasers(dt, container);
        updateEnemy(dt);
        enemyFiresLaser(container)

        // If the enemy's fire timer is greater than 0, reduce it
        if (enemyFireTimer > 0) {
            enemyFireTimer -= dt;  // Decrement the timer
        } else {
            // Allow the enemy to fire after the cooldown period
            if (!GAME_STATE.enemyCanFire) {
                GAME_STATE.enemyCanFire = true;
            }
        }

        GAME_STATE.lastTime = currentTime;  // Update last time for the next frame
        window.requestAnimationFrame(update);  // Continue the game loop
    }



    function onKeyDown(e) {
        if (e.keyCode === KEY_CODE_LEFT) {
            GAME_STATE.leftPressed = true;
        } else if (e.keyCode === KEY_CODE_RIGHT) {
            GAME_STATE.rightPressed = true;
        } else if (e.keyCode === KEY_CODE_SPACE) {
            GAME_STATE.spacePressed = true;
        }
    }

    function onKeyUp(e) {
        if (e.keyCode === KEY_CODE_LEFT) {
            GAME_STATE.leftPressed = false;
        } else if (e.keyCode === KEY_CODE_RIGHT) {
            GAME_STATE.rightPressed = false;
        } else if (e.keyCode === KEY_CODE_SPACE) {
            GAME_STATE.spacePressed = false;
        }
    }

    function init() {
        const container = document.querySelector(".container");
        createPlayer(container); // Create the player ship
        createEnemyShip(container); // Create the enemy ship with random movement
    }

    init();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.requestAnimationFrame(update);




    // Attack button event listener
    attack.addEventListener('click', attackF);

    // Attack function, which fires a laser and performs an attack with the ship
    function attackF() {
        const container = document.querySelector(".container");

        // Perform the attack with the ship (e.g., damaging the enemy)
        myship.attack(enemyarr[0]);

        // Check if the enemy is defeated, if so, generate a new enemy
        if (GAME_STATE.enemy.hull <= 0) {
            console.log('Enemy defeated!');
            enemyarr.pop();  // Remove defeated enemy from the array
            enemyarr.push(new EnemyShip());  // Generate a new enemy ship
        }


        // If the enemy is still alive, it attacks the player
        if (enemyarr[0].hull > 0) {
            enemyarr[0].attack(myship);
        }
    }

    retreat.addEventListener('click', function () {
        alert = "Game Over!";
    })

    function checkGameOver() {
        if (myship.hull <= 0) {
            console.log("Game Over! You were destroyed!");
            // Hide game area and show game over screen
            document.querySelector(".container").style.display = "none";
            document.getElementById("game-over").style.display = "block";

            // Handle restart
            document.getElementById("restart-button").addEventListener("click", function () {
                resetGame(); // Restart the game
                document.querySelector(".container").style.display = "block";
                document.getElementById("game-over").style.display = "none";
            });
        }
    }
}