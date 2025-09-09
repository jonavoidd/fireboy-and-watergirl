// Game Engine and Character Classes
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.currentLevel = 1;
    this.maxLevels = 5;
    this.gameMode = "competitive"; // 'competitive' or 'cooperative'
    this.gameState = "menu"; // 'menu', 'playing', 'paused', 'gameOver'

    this.fireboy = null;
    this.watergirl = null;
    this.projectiles = [];
    this.powerUps = [];
    this.platforms = [];
    this.goals = [];
    this.enemies = [];
    this.effects = []; // Visual effects array

    this.fireboyScore = 0;
    this.watergirlScore = 0;

    this.keys = {};
    this.lastTime = 0;
    this.gameSpeed = 1;

    // Sound effects (using Web Audio API)
    this.audioContext = null;
    this.sounds = {};

    // Game assets
    this.assets = {
      background: null,
      fireboySprite: null,
      watergirlSprite: null,
    };
    this.assetsLoaded = 0;
    this.totalAssets = 3;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initAudio();
    this.loadAssets();
  }

  loadAssets() {
    // Load background image
    this.assets.background = new Image();
    this.assets.background.onload = () => {
      this.assetsLoaded++;
      this.checkAssetsLoaded();
    };
    this.assets.background.src = "assets/main-bg.png";

    // Load Fireboy sprite
    this.assets.fireboySprite = new Image();
    this.assets.fireboySprite.onload = () => {
      this.assetsLoaded++;
      this.checkAssetsLoaded();
    };
    this.assets.fireboySprite.src = "assets/fireboy.webp";

    // Load Watergirl sprite
    this.assets.watergirlSprite = new Image();
    this.assets.watergirlSprite.onload = () => {
      this.assetsLoaded++;
      this.checkAssetsLoaded();
    };
    this.assets.watergirlSprite.src = "assets/watergirl.webp";
  }

  checkAssetsLoaded() {
    if (this.assetsLoaded >= this.totalAssets) {
      this.createLevel(this.currentLevel);
      this.gameLoop();
    }
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("Web Audio API not supported");
    }
  }

  playSound(frequency, duration, type = "sine") {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  addEffect(x, y, type, duration = 1000) {
    this.effects.push(new Effect(x, y, type, duration));
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      e.preventDefault();
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      e.preventDefault();
    });

    // Button controls
    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("resetBtn")
      .addEventListener("click", () => this.resetLevel());
    document
      .getElementById("nextLevelBtn")
      .addEventListener("click", () => this.nextLevel());
    document
      .getElementById("restartBtn")
      .addEventListener("click", () => this.restartGame());
  }

  createLevel(level) {
    this.projectiles = [];
    this.powerUps = [];
    this.platforms = [];
    this.goals = [];
    this.enemies = [];

    // Create characters
    this.fireboy = new Fireboy(100, this.height - 150);
    this.watergirl = new Watergirl(this.width - 150, this.height - 150);

    // Level-specific setup
    switch (level) {
      case 1:
        this.setupCompetitiveLevel();
        break;
      case 2:
        this.setupCooperativeLevel();
        break;
      case 3:
        this.setupBossLevel();
        break;
      case 4:
        this.setupPuzzleLevel();
        break;
      case 5:
        this.setupFinalLevel();
        break;
    }

    this.updateUI();
  }

  setupCompetitiveLevel() {
    this.gameMode = "competitive";
    document.getElementById("currentMode").textContent = "Competitive";
    document.getElementById("objectiveText").textContent =
      "Defeat your opponent!";

    // Create platforms
    this.platforms = [
      new Platform(0, this.height - 50, this.width, 50, "#8B4513"),
      new Platform(200, this.height - 200, 200, 20, "#8B4513"),
      new Platform(600, this.height - 200, 200, 20, "#8B4513"),
      new Platform(400, this.height - 350, 200, 20, "#8B4513"),
    ];

    // Add power-ups
    this.powerUps.push(new PowerUp(300, this.height - 250, "health"));
    this.powerUps.push(new PowerUp(700, this.height - 250, "speed"));
  }

  setupCooperativeLevel() {
    this.gameMode = "cooperative";
    document.getElementById("currentMode").textContent = "Cooperative";
    document.getElementById("objectiveText").textContent =
      "Work together to reach the goal!";

    // Create platforms
    this.platforms = [
      new Platform(0, this.height - 50, this.width, 50, "#8B4513"),
      new Platform(150, this.height - 200, 150, 20, "#8B4513"),
      new Platform(300, this.height - 350, 150, 20, "#8B4513"),
      new Platform(450, this.height - 500, 150, 20, "#8B4513"),
      new Platform(600, this.height - 350, 150, 20, "#8B4513"),
      new Platform(750, this.height - 200, 150, 20, "#8B4513"),
    ];

    // Create goal
    this.goals.push(new Goal(850, this.height - 250, "both"));

    // Add enemies that both players must defeat
    this.enemies.push(new Enemy(400, this.height - 400, "fire"));
    this.enemies.push(new Enemy(500, this.height - 400, "water"));
  }

  setupBossLevel() {
    this.gameMode = "competitive";
    document.getElementById("currentMode").textContent = "Boss Battle";
    document.getElementById("objectiveText").textContent =
      "Defeat the boss first!";

    // Create platforms
    this.platforms = [
      new Platform(0, this.height - 50, this.width, 50, "#8B4513"),
      new Platform(200, this.height - 200, 200, 20, "#8B4513"),
      new Platform(600, this.height - 200, 200, 20, "#8B4513"),
    ];

    // Add boss enemy
    this.enemies.push(new BossEnemy(this.width / 2 - 50, this.height - 300));
  }

  setupPuzzleLevel() {
    this.gameMode = "cooperative";
    document.getElementById("currentMode").textContent = "Puzzle";
    document.getElementById("objectiveText").textContent =
      "Solve the puzzle together!";

    // Create platforms
    this.platforms = [
      new Platform(0, this.height - 50, this.width, 50, "#8B4513"),
      new Platform(100, this.height - 200, 100, 20, "#8B4513"),
      new Platform(300, this.height - 200, 100, 20, "#8B4513"),
      new Platform(500, this.height - 200, 100, 20, "#8B4513"),
      new Platform(700, this.height - 200, 100, 20, "#8B4513"),
      new Platform(900, this.height - 200, 100, 20, "#8B4513"),
    ];

    // Create switches that both players need to activate
    this.goals.push(new Switch(150, this.height - 250, "fire"));
    this.goals.push(new Switch(350, this.height - 250, "water"));
    this.goals.push(new Switch(550, this.height - 250, "fire"));
    this.goals.push(new Switch(750, this.height - 250, "water"));
  }

  setupFinalLevel() {
    this.gameMode = "competitive";
    document.getElementById("currentMode").textContent = "Final Battle";
    document.getElementById("objectiveText").textContent = "Final showdown!";

    // Create platforms
    this.platforms = [
      new Platform(0, this.height - 50, this.width, 50, "#8B4513"),
      new Platform(200, this.height - 200, 200, 20, "#8B4513"),
      new Platform(600, this.height - 200, 200, 20, "#8B4513"),
      new Platform(400, this.height - 350, 200, 20, "#8B4513"),
    ];

    // Add multiple power-ups
    this.powerUps.push(new PowerUp(300, this.height - 250, "health"));
    this.powerUps.push(new PowerUp(700, this.height - 250, "speed"));
    this.powerUps.push(new PowerUp(450, this.height - 400, "power"));
  }

  startGame() {
    this.gameState = "playing";
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "inline-block";
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      document.getElementById("pauseBtn").textContent = "Resume";
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      document.getElementById("pauseBtn").textContent = "Pause";
    }
  }

  resetLevel() {
    this.createLevel(this.currentLevel);
    this.gameState = "playing";
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevels) {
      this.currentLevel++;
      this.createLevel(this.currentLevel);
      document.getElementById("nextLevelBtn").style.display = "none";
    }
  }

  restartGame() {
    this.currentLevel = 1;
    this.fireboyScore = 0;
    this.watergirlScore = 0;
    this.createLevel(this.currentLevel);
    this.gameState = "playing";
    document.getElementById("gameOverScreen").classList.add("hidden");
  }

  update(deltaTime) {
    if (this.gameState !== "playing") return;

    // Update characters
    this.fireboy.update(deltaTime, this.keys, this.platforms);
    this.watergirl.update(deltaTime, this.keys, this.platforms);

    // Update projectiles
    this.projectiles.forEach((projectile, index) => {
      projectile.update(deltaTime);
      if (projectile.isOffScreen(this.width, this.height)) {
        this.projectiles.splice(index, 1);
      }
    });

    // Update enemies
    this.enemies.forEach((enemy) => enemy.update(deltaTime));

    // Update effects
    this.effects.forEach((effect, index) => {
      effect.update(deltaTime);
      if (effect.isFinished()) {
        this.effects.splice(index, 1);
      }
    });

    // Check collisions
    this.checkCollisions();

    // Check win conditions
    this.checkWinConditions();
  }

  checkCollisions() {
    // Projectile vs Character collisions
    this.projectiles.forEach((projectile, projIndex) => {
      if (
        projectile.type === "fireball" &&
        this.watergirl.checkCollision(projectile)
      ) {
        this.watergirl.takeDamage(20);
        this.addEffect(this.watergirl.x, this.watergirl.y, "hit");
        this.playSound(200, 0.2, "sawtooth");
        this.projectiles.splice(projIndex, 1);
      } else if (
        projectile.type === "waterball" &&
        this.fireboy.checkCollision(projectile)
      ) {
        this.fireboy.takeDamage(20);
        this.addEffect(this.fireboy.x, this.fireboy.y, "hit");
        this.playSound(200, 0.2, "sawtooth");
        this.projectiles.splice(projIndex, 1);
      }
    });

    // Character vs Power-up collisions
    this.powerUps.forEach((powerUp, index) => {
      if (this.fireboy.checkCollision(powerUp)) {
        powerUp.apply(this.fireboy);
        this.addEffect(powerUp.x, powerUp.y, "powerup");
        this.playSound(400, 0.3, "square");
        this.powerUps.splice(index, 1);
      } else if (this.watergirl.checkCollision(powerUp)) {
        powerUp.apply(this.watergirl);
        this.addEffect(powerUp.x, powerUp.y, "powerup");
        this.playSound(400, 0.3, "square");
        this.powerUps.splice(index, 1);
      }
    });

    // Character vs Goal collisions
    this.goals.forEach((goal) => {
      if (goal.checkCollision(this.fireboy, this.watergirl)) {
        goal.activate();
        this.addEffect(goal.x, goal.y, "goal");
        this.playSound(600, 0.5, "triangle");
      }
    });
  }

  checkWinConditions() {
    if (this.gameMode === "competitive") {
      if (this.fireboy.health <= 0) {
        this.watergirlScore++;
        this.showGameOver("Watergirl Wins!");
      } else if (this.watergirl.health <= 0) {
        this.fireboyScore++;
        this.showGameOver("Fireboy Wins!");
      }
    } else if (this.gameMode === "cooperative") {
      // Check if all goals are activated
      const allGoalsActivated = this.goals.every((goal) => goal.activated);
      if (allGoalsActivated) {
        this.showLevelComplete();
      }
    }
  }

  showGameOver(winner) {
    this.gameState = "gameOver";
    document.getElementById("gameOverTitle").textContent = "Round Over!";
    document.getElementById("gameOverMessage").textContent = winner;
    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("nextLevelBtn").style.display = "inline-block";
  }

  showLevelComplete() {
    this.gameState = "gameOver";
    document.getElementById("gameOverTitle").textContent = "Level Complete!";
    document.getElementById("gameOverMessage").textContent = "Great teamwork!";
    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("nextLevelBtn").style.display = "inline-block";
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Show loading screen if assets not loaded
    if (this.assetsLoaded < this.totalAssets) {
      this.drawLoadingScreen();
      return;
    }

    // Draw background
    this.drawBackground();

    // Draw platforms
    this.platforms.forEach((platform) => platform.render(this.ctx));

    // Draw goals
    this.goals.forEach((goal) => goal.render(this.ctx));

    // Draw power-ups
    this.powerUps.forEach((powerUp) => powerUp.render(this.ctx));

    // Draw enemies
    this.enemies.forEach((enemy) => enemy.render(this.ctx));

    // Draw projectiles
    this.projectiles.forEach((projectile) => projectile.render(this.ctx));

    // Draw characters
    this.fireboy.render(this.ctx);
    this.watergirl.render(this.ctx);

    // Draw effects
    this.effects.forEach((effect) => effect.render(this.ctx));

    // Draw UI elements
    this.drawHealthBars();
  }

  drawLoadingScreen() {
    // Draw background
    this.ctx.fillStyle = "#2c3e50";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw loading text
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 32px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Loading Assets...",
      this.width / 2,
      this.height / 2 - 50
    );

    // Draw progress bar
    const progress = this.assetsLoaded / this.totalAssets;
    const barWidth = 400;
    const barHeight = 20;
    const barX = (this.width - barWidth) / 2;
    const barY = this.height / 2;

    // Background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress
    this.ctx.fillStyle = "#ff6b35";
    this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Border
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Progress text
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      `${Math.round(progress * 100)}%`,
      this.width / 2,
      barY + 40
    );

    this.ctx.textAlign = "left";
  }

  drawBackground() {
    if (this.assets.background) {
      // Draw background image scaled to fit canvas
      this.ctx.drawImage(this.assets.background, 0, 0, this.width, this.height);
    } else {
      // Fallback gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, "#87CEEB");
      gradient.addColorStop(0.5, "#98FB98");
      gradient.addColorStop(1, "#8FBC8F");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  drawHealthBars() {
    // Fireboy health bar background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(18, 18, 204, 24);

    // Fireboy health bar
    const fireboyHealthWidth = (this.fireboy.health / 100) * 200;
    const fireboyGradient = this.ctx.createLinearGradient(
      20,
      20,
      20 + fireboyHealthWidth,
      20
    );
    fireboyGradient.addColorStop(0, "#ff0000");
    fireboyGradient.addColorStop(0.5, "#ff6b35");
    fireboyGradient.addColorStop(1, "#ffaa00");

    this.ctx.fillStyle = fireboyGradient;
    this.ctx.fillRect(20, 20, fireboyHealthWidth, 20);

    // Fireboy health bar border
    this.ctx.strokeStyle = "#ff6b35";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 20, 200, 20);

    // Fireboy label
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 12px Arial";
    this.ctx.fillText("Fireboy", 20, 16);

    // Watergirl health bar background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.width - 222, 18, 204, 24);

    // Watergirl health bar
    const watergirlHealthWidth = (this.watergirl.health / 100) * 200;
    const watergirlGradient = this.ctx.createLinearGradient(
      this.width - 220,
      20,
      this.width - 220 + watergirlHealthWidth,
      20
    );
    watergirlGradient.addColorStop(0, "#1e90ff");
    watergirlGradient.addColorStop(0.5, "#4a90e2");
    watergirlGradient.addColorStop(1, "#87CEEB");

    this.ctx.fillStyle = watergirlGradient;
    this.ctx.fillRect(this.width - 220, 20, watergirlHealthWidth, 20);

    // Watergirl health bar border
    this.ctx.strokeStyle = "#4a90e2";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.width - 220, 20, 200, 20);

    // Watergirl label
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 12px Arial";
    this.ctx.textAlign = "right";
    this.ctx.fillText("Watergirl", this.width - 20, 16);
    this.ctx.textAlign = "left";
  }

  updateUI() {
    document.getElementById("currentLevel").textContent = this.currentLevel;
    document.getElementById(
      "fireboyScore"
    ).textContent = `Fireboy: ${this.fireboyScore}`;
    document.getElementById(
      "watergirlScore"
    ).textContent = `Watergirl: ${this.watergirlScore}`;
  }

  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// Character Classes
class Character {
  constructor(x, y, color, type) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.color = color;
    this.type = type;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 200;
    this.jumpPower = 400;
    this.velocityX = 0;
    this.velocityY = 0;
    this.onGround = false;
    this.facingRight = true;
    this.lastShot = 0;
    this.shootCooldown = 500; // milliseconds
  }

  update(deltaTime, keys, platforms) {
    // Handle input
    this.handleInput(keys, deltaTime);

    // Apply gravity
    this.velocityY += 800 * deltaTime; // gravity

    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Check platform collisions
    this.checkPlatformCollisions(platforms);

    // Keep character on screen
    this.x = Math.max(0, Math.min(this.x, 960));
    this.y = Math.max(0, Math.min(this.y, 540));
  }

  handleInput(keys, deltaTime) {
    // Override in subclasses
  }

  checkPlatformCollisions(platforms) {
    this.onGround = false;

    platforms.forEach((platform) => {
      if (
        this.x < platform.x + platform.width &&
        this.x + this.width > platform.x &&
        this.y < platform.y + platform.height &&
        this.y + this.height > platform.y
      ) {
        // Landing on top of platform
        if (this.velocityY > 0 && this.y < platform.y) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.onGround = true;
        }
      }
    });
  }

  jump() {
    if (this.onGround) {
      this.velocityY = -this.jumpPower;
      this.onGround = false;
    }
  }

  shoot(projectileType, game) {
    const currentTime = Date.now();
    if (currentTime - this.lastShot > this.shootCooldown) {
      const projectile = new Projectile(
        this.x + this.width / 2,
        this.y + this.height / 2,
        projectileType,
        this.facingRight ? 1 : -1
      );
      game.projectiles.push(projectile);
      this.lastShot = currentTime;

      // Play shooting sound
      if (projectileType === "fireball") {
        game.playSound(300, 0.1, "sawtooth");
      } else {
        game.playSound(250, 0.1, "triangle");
      }
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  checkCollision(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  render(ctx) {
    if (this.type === "fireboy" && window.game.assets.fireboySprite) {
      // Draw Fireboy sprite
      ctx.drawImage(
        window.game.assets.fireboySprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (
      this.type === "watergirl" &&
      window.game.assets.watergirlSprite
    ) {
      // Draw Watergirl sprite
      ctx.drawImage(
        window.game.assets.watergirlSprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      // Fallback to colored rectangles if sprites not loaded
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Character face
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x + 10, this.y + 10, 20, 20);

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x + 15, this.y + 15, 5, 5);
      ctx.fillRect(this.x + 25, this.y + 15, 5, 5);
    }
  }
}

class Fireboy extends Character {
  constructor(x, y) {
    super(x, y, "#ff6b35", "fireboy");
  }

  handleInput(keys, deltaTime) {
    // Movement
    if (keys["KeyA"]) {
      this.velocityX = -this.speed;
      this.facingRight = false;
    } else if (keys["KeyD"]) {
      this.velocityX = this.speed;
      this.facingRight = true;
    } else {
      this.velocityX = 0;
    }

    // Jumping
    if (keys["KeyW"] && this.onGround) {
      this.jump();
    }

    // Shooting
    if (keys["Space"]) {
      this.shoot("fireball", window.game);
    }
  }
}

class Watergirl extends Character {
  constructor(x, y) {
    super(x, y, "#4a90e2", "watergirl");
  }

  handleInput(keys, deltaTime) {
    // Movement
    if (keys["ArrowLeft"]) {
      this.velocityX = -this.speed;
      this.facingRight = false;
    } else if (keys["ArrowRight"]) {
      this.velocityX = this.speed;
      this.facingRight = true;
    } else {
      this.velocityX = 0;
    }

    // Jumping
    if (keys["ArrowUp"] && this.onGround) {
      this.jump();
    }

    // Shooting
    if (keys["Enter"]) {
      this.shoot("waterball", window.game);
    }
  }
}

// Game Object Classes
class Platform {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  render(ctx) {
    // Create a more appealing platform with gradient and shadow
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, "#8B4513");
    gradient.addColorStop(0.5, "#A0522D");
    gradient.addColorStop(1, "#654321");

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add a subtle border
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Add some texture lines
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    for (let i = 0; i < this.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(this.x + i, this.y);
      ctx.lineTo(this.x + i, this.y + this.height);
      ctx.stroke();
    }
  }
}

class Projectile {
  constructor(x, y, type, direction) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.direction = direction;
    this.speed = 300;
    this.width = 10;
    this.height = 10;
    this.velocityX = this.speed * direction;
  }

  update(deltaTime) {
    this.x += this.velocityX * deltaTime;
  }

  isOffScreen(width, height) {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }

  render(ctx) {
    if (this.type === "fireball") {
      // Create a fireball with gradient and glow effect
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.width / 2
      );
      gradient.addColorStop(0, "#ffff00");
      gradient.addColorStop(0.5, "#ff6b35");
      gradient.addColorStop(1, "#ff0000");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = "#ff6b35";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ff6b35";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Create a waterball with gradient and glow effect
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.width / 2
      );
      gradient.addColorStop(0, "#87CEEB");
      gradient.addColorStop(0.5, "#4a90e2");
      gradient.addColorStop(1, "#1e90ff");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = "#4a90e2";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#4a90e2";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.type = type;
    this.collected = false;
  }

  apply(character) {
    switch (this.type) {
      case "health":
        character.health = Math.min(character.maxHealth, character.health + 30);
        break;
      case "speed":
        character.speed += 50;
        break;
      case "power":
        character.shootCooldown = Math.max(200, character.shootCooldown - 100);
        break;
    }
    this.collected = true;
  }

  render(ctx) {
    if (this.collected) return;

    // Create a pulsing effect
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.1 + 1;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = (this.width / 2) * pulse;

    if (this.type === "health") {
      // Health power-up with red gradient and cross symbol
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "#ffaaaa");
      gradient.addColorStop(0.5, "#ff6666");
      gradient.addColorStop(1, "#ff0000");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw cross symbol
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY);
      ctx.lineTo(centerX + 8, centerY);
      ctx.moveTo(centerX, centerY - 8);
      ctx.lineTo(centerX, centerY + 8);
      ctx.stroke();
    } else if (this.type === "speed") {
      // Speed power-up with green gradient and lightning symbol
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "#aaffaa");
      gradient.addColorStop(0.5, "#66ff66");
      gradient.addColorStop(1, "#00ff00");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw lightning symbol
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 6, centerY - 8);
      ctx.lineTo(centerX + 2, centerY - 2);
      ctx.lineTo(centerX - 2, centerY + 2);
      ctx.lineTo(centerX + 6, centerY + 8);
      ctx.stroke();
    } else {
      // Power power-up with yellow gradient and star symbol
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "#ffffaa");
      gradient.addColorStop(0.5, "#ffff66");
      gradient.addColorStop(1, "#ffff00");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw star symbol
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 8);
      ctx.lineTo(centerX + 3, centerY + 3);
      ctx.lineTo(centerX + 8, centerY + 3);
      ctx.lineTo(centerX + 4, centerY + 6);
      ctx.lineTo(centerX + 6, centerY + 10);
      ctx.lineTo(centerX, centerY + 7);
      ctx.lineTo(centerX - 6, centerY + 10);
      ctx.lineTo(centerX - 4, centerY + 6);
      ctx.lineTo(centerX - 8, centerY + 3);
      ctx.lineTo(centerX - 3, centerY + 3);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

class Goal {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.type = type; // 'fire', 'water', 'both'
    this.activated = false;
  }

  checkCollision(fireboy, watergirl) {
    if (this.type === "fire" && fireboy.checkCollision(this)) {
      this.activated = true;
      return true;
    } else if (this.type === "water" && watergirl.checkCollision(this)) {
      this.activated = true;
      return true;
    } else if (
      this.type === "both" &&
      (fireboy.checkCollision(this) || watergirl.checkCollision(this))
    ) {
      this.activated = true;
      return true;
    }
    return false;
  }

  render(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (this.activated) {
      // Activated goal with green gradient and checkmark
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        this.width / 2
      );
      gradient.addColorStop(0, "#aaffaa");
      gradient.addColorStop(0.5, "#66ff66");
      gradient.addColorStop(1, "#00ff00");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw checkmark
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY);
      ctx.lineTo(centerX - 2, centerY + 6);
      ctx.lineTo(centerX + 8, centerY - 6);
      ctx.stroke();
    } else {
      // Inactive goal with yellow gradient and question mark
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        this.width / 2
      );
      gradient.addColorStop(0, "#ffffaa");
      gradient.addColorStop(0.5, "#ffff66");
      gradient.addColorStop(1, "#ffff00");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw question mark
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("?", centerX, centerY + 5);
    }

    // Add border
    ctx.strokeStyle = this.activated ? "#00aa00" : "#aaaa00";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class Switch extends Goal {
  constructor(x, y, type) {
    super(x, y, type);
    this.width = 40;
    this.height = 20;
  }

  render(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (this.activated) {
      // Activated switch with green gradient
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, "#aaffaa");
      gradient.addColorStop(0.5, "#66ff66");
      gradient.addColorStop(1, "#00ff00");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw "ON" text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("ON", centerX, centerY + 3);
    } else {
      // Inactive switch with red gradient
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, "#ffaaaa");
      gradient.addColorStop(0.5, "#ff6666");
      gradient.addColorStop(1, "#ff0000");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw "OFF" text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("OFF", centerX, centerY + 3);
    }

    // Add border
    ctx.strokeStyle = this.activated ? "#00aa00" : "#aa0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.type = type;
    this.health = 50;
    this.speed = 50;
    this.direction = 1;
  }

  update(deltaTime) {
    this.x += this.speed * this.direction * deltaTime;

    // Simple AI - reverse direction at edges
    if (this.x <= 0 || this.x >= 960) {
      this.direction *= -1;
    }
  }

  render(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (this.type === "fire") {
      // Fire enemy with gradient and flame effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        this.width / 2
      );
      gradient.addColorStop(0, "#ffff00");
      gradient.addColorStop(0.5, "#ff6b35");
      gradient.addColorStop(1, "#ff0000");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Add flame details
      ctx.fillStyle = "#ffaa00";
      ctx.fillRect(this.x + 5, this.y + 5, 10, 15);
      ctx.fillRect(this.x + 15, this.y + 8, 8, 12);
      ctx.fillRect(this.x + 25, this.y + 6, 10, 14);
    } else {
      // Water enemy with gradient and wave effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        this.width / 2
      );
      gradient.addColorStop(0, "#87CEEB");
      gradient.addColorStop(0.5, "#4a90e2");
      gradient.addColorStop(1, "#1e90ff");

      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Add wave details
      ctx.strokeStyle = "#87CEEB";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 5, this.y + 10);
      ctx.quadraticCurveTo(this.x + 15, this.y + 5, this.x + 25, this.y + 10);
      ctx.quadraticCurveTo(this.x + 35, this.y + 15, this.x + 35, this.y + 20);
      ctx.stroke();
    }

    // Add border
    ctx.strokeStyle = this.type === "fire" ? "#ff0000" : "#1e90ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, "boss");
    this.width = 80;
    this.height = 80;
    this.health = 200;
    this.speed = 30;
  }

  render(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Create a menacing boss with multiple layers
    const outerGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      this.width / 2
    );
    outerGradient.addColorStop(0, "#ff0000");
    outerGradient.addColorStop(0.5, "#8B0000");
    outerGradient.addColorStop(1, "#4B0000");

    ctx.fillStyle = outerGradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Inner core
    const innerGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      this.width / 3
    );
    innerGradient.addColorStop(0, "#ffff00");
    innerGradient.addColorStop(0.5, "#ff6600");
    innerGradient.addColorStop(1, "#ff0000");

    ctx.fillStyle = innerGradient;
    ctx.fillRect(this.x + 15, this.y + 15, this.width - 30, this.height - 30);

    // Add menacing eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 20, this.y + 20, 8, 8);
    ctx.fillRect(this.x + 52, this.y + 20, 8, 8);

    // Add glowing effect
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

// Effect class for visual feedback
class Effect {
  constructor(x, y, type, duration) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.duration = duration;
    this.startTime = Date.now();
    this.radius = 10;
    this.alpha = 1;
  }

  update(deltaTime) {
    const elapsed = Date.now() - this.startTime;
    this.alpha = 1 - elapsed / this.duration;

    if (this.type === "hit") {
      this.radius += 50 * deltaTime;
    } else if (this.type === "powerup") {
      this.radius += 30 * deltaTime;
    } else if (this.type === "goal") {
      this.radius += 40 * deltaTime;
    }
  }

  isFinished() {
    return Date.now() - this.startTime >= this.duration;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === "hit") {
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "powerup") {
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "goal") {
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  window.game = new Game();
});
