// Main Game Class
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
    this.defenseWalls = []; // Active defense barriers
    this.effects = []; // Visual effects array
    this.textEffects = []; // Text effects array

    // Active defense system
    this.activeDefense = {
      fireboy: false,
      watergirl: false,
    };
    this.defenseCooldown = {
      fireboy: 0,
      watergirl: 0,
    };
    this.defenseStartTime = {
      fireboy: 0,
      watergirl: 0,
    };
    this.defenseDuration = 3; // 3 seconds
    this.defenseCooldownTime = 10; // 10 seconds cooldown (in seconds)

    this.fireboyScore = 0;
    this.watergirlScore = 0;
    this.doorWinner = null; // Track who won the door in level 1

    this.keys = {};
    this.lastTime = 0;
    this.gameSpeed = 1;
    this.isTabVisible = true;
    this.maxDeltaTime = 1 / 30; // Cap delta time to 30 FPS minimum

    // Door system
    this.door = null;
    this.doorSpawnTime = 0;
    this.doorSpawnDelay = 0;
    this.doorActive = false;
    this.doorCountdown = 0;
    this.gameStartTime = 0;

    // Ultimate system
    this.ultimateCooldown = {
      fireboy: 0,
      watergirl: 0,
    };

    // Asset loading
    this.assets = {
      fireboySprite: null,
      watergirlSprite: null,
      background: null,
      platformSprite: null,
      doorSprite: null,
    };
    this.assetsLoaded = 0;
    this.totalAssets = 5;

    // Initialize level manager
    this.levelManager = new LevelManager(this);

    // Load assets and start game
    this.loadAssets();
    this.setupEventListeners();
    
    // Start the game loop immediately
    this.gameLoop();
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

    // Load Door sprite
    this.assets.doorSprite = new Image();
    this.assets.doorSprite.onload = () => {
      this.assetsLoaded++;
      this.checkAssetsLoaded();
    };
    this.assets.doorSprite.src = "assets/door.png";

    // Load Platform sprite
    this.assets.platformSprite = new Image();
    this.assets.platformSprite.onload = () => {
      this.assetsLoaded++;
      this.checkAssetsLoaded();
    };
    this.assets.platformSprite.src = "assets/platform.png";
  }

  checkAssetsLoaded() {
    if (this.assetsLoaded >= this.totalAssets) {
      this.levelManager.createLevel(this.currentLevel);
    }
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Tab visibility change
    document.addEventListener("visibilitychange", () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.lastTime = performance.now();
      }
    });

    // UI events
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

  startGame() {
    this.gameState = "playing";
    document.getElementById("menuScreen").classList.add("hidden");
    this.gameLoop();
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      document.getElementById("pauseBtn").textContent = "Resume";
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      document.getElementById("pauseBtn").textContent = "Pause";
      this.gameLoop();
    }
  }

  resetLevel() {
    this.levelManager.createLevel(this.currentLevel);
    this.gameState = "playing";
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevels) {
      this.currentLevel++;
      this.levelManager.createLevel(this.currentLevel);
      document.getElementById("nextLevelBtn").style.display = "none";
    }
  }

  restartGame() {
    this.currentLevel = 1;
    this.fireboyScore = 0;
    this.watergirlScore = 0;
    this.levelManager.createLevel(this.currentLevel);
    this.gameState = "playing";
    document.getElementById("gameOverScreen").classList.add("hidden");
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = Math.min(
      (currentTime - this.lastTime) / 1000,
      this.maxDeltaTime
    );
    this.lastTime = currentTime;

    if (this.gameState === "playing") {
      this.update(deltaTime);
    }
    
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    if (!this.isTabVisible) return;

    // Update characters
    if (this.fireboy) {
      this.fireboy.update(deltaTime);
      this.fireboy.handleInput(this.keys);
    }
    if (this.watergirl) {
      this.watergirl.update(deltaTime);
      this.watergirl.handleInput(this.keys);
    }

    // Update projectiles
    this.projectiles.forEach((projectile) => projectile.update(deltaTime));
    this.projectiles = this.projectiles.filter(
      (projectile) =>
        projectile.x > -50 &&
        projectile.x < this.width + 50 &&
        projectile.y > -50 &&
        projectile.y < this.height + 50
    );

    // Update power-ups
    this.powerUps.forEach((powerUp) => powerUp.update(deltaTime));

    // Update enemies
    this.enemies.forEach((enemy) => {
      enemy.update(deltaTime);
      if (enemy.attack) {
        const projectile = enemy.attack();
        if (projectile) {
          this.projectiles.push(projectile);
        }
      }
    });

    // Update effects
    this.effects.forEach((effect) => effect.update(deltaTime));
    this.effects = this.effects.filter((effect) => effect.life > 0);

    // Update text effects
    this.textEffects.forEach((effect) => effect.update(deltaTime));
    this.textEffects = this.textEffects.filter((effect) => effect.life > 0);

    // Update door animation
    if (this.door) {
      this.door.update(deltaTime);
    }

    // Check door collision
    if (this.door && this.fireboy && this.watergirl) {
      this.levelManager.checkDoorCollision();
    }

    // Update defense system
    this.updateDefenseSystem(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update door system
    this.updateDoorSystem(deltaTime);
  }

  updateDefenseSystem(deltaTime) {
    // Update defense cooldowns
    if (this.defenseCooldown.fireboy > 0) {
      this.defenseCooldown.fireboy -= deltaTime;
    }
    if (this.defenseCooldown.watergirl > 0) {
      this.defenseCooldown.watergirl -= deltaTime;
    }

    // Clear defense walls at start of each update
    this.defenseWalls = [];

    // Check for defense activation
    if (this.keys["KeyQ"] && this.defenseCooldown.fireboy <= 0 && !this.activeDefense.fireboy) {
      this.activeDefense.fireboy = true;
      this.defenseStartTime.fireboy = Date.now();
    }
    if (this.keys["KeyP"] && this.defenseCooldown.watergirl <= 0 && !this.activeDefense.watergirl) {
      this.activeDefense.watergirl = true;
      this.defenseStartTime.watergirl = Date.now();
    }

    // Create defense barriers for active defense
    if (this.activeDefense.fireboy) {
      this.createDefenseBarrier("fireboy");
    }
    if (this.activeDefense.watergirl) {
      this.createDefenseBarrier("watergirl");
    }

    // Check defense duration and deactivate
    if (this.activeDefense.fireboy) {
      const defenseTime = (Date.now() - this.defenseStartTime.fireboy) / 1000;
      if (defenseTime >= this.defenseDuration) {
        this.activeDefense.fireboy = false;
        this.defenseCooldown.fireboy = this.defenseCooldownTime;
      }
    }
    if (this.activeDefense.watergirl) {
      const defenseTime = (Date.now() - this.defenseStartTime.watergirl) / 1000;
      if (defenseTime >= this.defenseDuration) {
        this.activeDefense.watergirl = false;
        this.defenseCooldown.watergirl = this.defenseCooldownTime;
      }
    }
  }

  createDefenseBarrier(defender) {
    if (defender === "fireboy" && this.fireboy) {
      let barrierX;
      if (this.fireboy.facingRight) {
        barrierX = this.fireboy.x + this.fireboy.width + 10;
      } else {
        barrierX = this.fireboy.x - 4 - 10; // 4px width + 10px margin
      }
      const barrier = new DefenseBarrier(
        barrierX,
        this.fireboy.y + this.fireboy.height / 2 - 25, // Center vertically
        defender
      );
      this.defenseWalls.push(barrier);
    } else if (defender === "watergirl" && this.watergirl) {
      let barrierX;
      if (this.watergirl.facingRight) {
        barrierX = this.watergirl.x + this.watergirl.width + 10;
      } else {
        barrierX = this.watergirl.x - 4 - 10; // 4px width + 10px margin
      }
      const barrier = new DefenseBarrier(
        barrierX,
        this.watergirl.y + this.watergirl.height / 2 - 25, // Center vertically
        defender
      );
      this.defenseWalls.push(barrier);
    }
  }

  updateDoorSystem(deltaTime) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.gameStartTime;

    // Check if it's time to spawn the door
    if (!this.doorActive && this.gameMode === "competitive" && elapsedTime >= this.doorSpawnDelay) {
      this.levelManager.spawnDoor();
    }

    // Update door countdown
    if (this.doorActive) {
      this.doorCountdown = Math.max(0, this.doorSpawnDelay - elapsedTime);
    }

    // Update door animation
    if (this.door) {
      this.door.update(deltaTime);
    }
  }

  checkCollisions() {
    // Projectile vs Character collisions
    this.projectiles.forEach((projectile, projectileIndex) => {
      if (projectile.owner === "fireboy" && this.watergirl) {
        if (projectile.checkCollision(this.watergirl)) {
          this.watergirl.takeDamage(projectile.damage);
          this.projectiles.splice(projectileIndex, 1);
          this.addEffect(this.watergirl.x, this.watergirl.y, "explosion");
        }
      } else if (projectile.owner === "watergirl" && this.fireboy) {
        if (projectile.checkCollision(this.fireboy)) {
          this.fireboy.takeDamage(projectile.damage);
          this.projectiles.splice(projectileIndex, 1);
          this.addEffect(this.fireboy.x, this.fireboy.y, "explosion");
        }
      }
    });

    // Projectile vs Defense Barrier collisions
    this.projectiles.forEach((projectile, projectileIndex) => {
      this.defenseWalls.forEach((barrier) => {
        if (barrier.checkCollision(projectile)) {
          // Award defense points
          if (window.pointSystem) {
            window.pointSystem.addPoints(barrier.owner, 1, "defense");
          }
          
          // Track defense count
          if (barrier.owner === "fireboy" && this.fireboy) {
            this.fireboy.defenseCount++;
          } else if (barrier.owner === "watergirl" && this.watergirl) {
            this.watergirl.defenseCount++;
          }
          
          // Remove projectile
          this.projectiles.splice(projectileIndex, 1);
          this.addEffect(barrier.x, barrier.y, "explosion");
        }
      });
    });

    // Character vs PowerUp collisions
    this.powerUps.forEach((powerUp, powerUpIndex) => {
      if (this.fireboy && powerUp.checkCollision(this.fireboy)) {
        this.collectPowerUp(powerUp, "fireboy");
        this.powerUps.splice(powerUpIndex, 1);
      } else if (this.watergirl && powerUp.checkCollision(this.watergirl)) {
        this.collectPowerUp(powerUp, "watergirl");
        this.powerUps.splice(powerUpIndex, 1);
      }
    });

    // Character vs Goal collisions
    this.goals.forEach((goal) => {
      if (goal.checkCollision(this.fireboy) || goal.checkCollision(this.watergirl)) {
        this.handleGoalReached(goal);
      }
    });
  }

  collectPowerUp(powerUp, character) {
    powerUp.collect();
    this.addEffect(powerUp.x, powerUp.y, "heal");

    if (character === "fireboy") {
      if (powerUp.type === "health") {
        this.fireboy.heal(25);
      } else if (powerUp.type === "speed") {
        this.fireboy.speed += 50;
        setTimeout(() => {
          this.fireboy.speed -= 50;
        }, 10000);
      }
    } else if (character === "watergirl") {
      if (powerUp.type === "health") {
        this.watergirl.heal(25);
      } else if (powerUp.type === "speed") {
        this.watergirl.speed += 50;
        setTimeout(() => {
          this.watergirl.speed -= 50;
        }, 10000);
      }
    }
  }

  handleGoalReached(goal) {
    if (goal.type === "both") {
      // Both players need to reach the goal
      if (goal.checkCollision(this.fireboy) && goal.checkCollision(this.watergirl)) {
        this.showLevelComplete();
      }
    } else {
      // Single player goal
      this.showLevelComplete();
    }
  }

  showLevelComplete() {
    this.gameState = "gameOver";
    document.getElementById("gameOverTitle").textContent = "Level Complete!";
    document.getElementById("gameOverMessage").textContent = "Great teamwork!";
    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("nextLevelBtn").style.display = "inline-block";
  }

  addEffect(x, y, type) {
    this.effects.push(new Effect(x, y, type));
  }

  addTextEffect(x, y, text, color) {
    this.textEffects.push(new TextEffect(x, y, text, color));
  }

  playSound(frequency, duration, type) {
    // Simple sound generation
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  updateUI() {
    document.getElementById("fireboyScore").textContent = this.fireboyScore;
    document.getElementById("watergirlScore").textContent = this.watergirlScore;
    document.getElementById("currentLevel").textContent = this.currentLevel;
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

  render() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw background
    this.drawBackground();

    // Draw platforms
    this.platforms.forEach((platform) => platform.render(this.ctx));

    // Draw power-ups
    this.powerUps.forEach((powerUp) => powerUp.render(this.ctx));

    // Draw goals
    this.goals.forEach((goal) => goal.render(this.ctx));

    // Draw enemies
    this.enemies.forEach((enemy) => enemy.render(this.ctx));

    // Draw door
    if (this.door) {
      this.door.render(this.ctx);
    }

    // Draw defense barriers
    this.defenseWalls.forEach((wall) => wall.render(this.ctx));

    // Draw projectiles
    this.projectiles.forEach((projectile) => projectile.render(this.ctx));

    // Draw characters
    if (this.fireboy) this.fireboy.render(this.ctx);
    if (this.watergirl) this.watergirl.render(this.ctx);

    // Draw effects
    this.effects.forEach((effect) => effect.render(this.ctx));
    this.textEffects.forEach((effect) => effect.render(this.ctx));

    // Draw UI
    this.drawUI();
    this.drawDoorUI();
  }

  drawUI() {
    // Health bars
    if (this.fireboy) {
      this.drawHealthBar(this.fireboy, 20, 20);
    }
    if (this.watergirl) {
      this.drawHealthBar(this.watergirl, this.width - 120, 20);
    }

    // Defense UI
    this.drawDefenseUI();

    // Ultimate indicators
    this.drawUltimateIndicators();

    // Ultimate buttons
    this.drawUltimateButtons();
  }

  drawHealthBar(character, x, y) {
    const barWidth = 100;
    const barHeight = 10;
    const healthPercent = character.health / character.maxHealth;

    // Background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Health
    this.ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00";
    this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, barWidth, barHeight);
  }

  drawDefenseUI() {
    const fontSize = 16;
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.textAlign = "left";

    // Fireboy defense status
    if (this.fireboy) {
      const fireboyY = 60;
      if (this.defenseCooldown.fireboy <= 0 && !this.activeDefense.fireboy) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.fillText("DEFENSE READY (Q)", 20, fireboyY);
      } else if (this.activeDefense.fireboy) {
        const timeLeft = this.defenseDuration - (Date.now() - this.defenseStartTime.fireboy) / 1000;
        this.ctx.fillStyle = "#ffff00";
        this.ctx.fillText(`DEFENSE: ${timeLeft.toFixed(1)}s`, 20, fireboyY);
      } else {
        const cooldownLeft = this.defenseCooldown.fireboy;
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillText(`DEFENSE COOLDOWN: ${cooldownLeft.toFixed(1)}s`, 20, fireboyY);
      }
    }

    // Watergirl defense status
    if (this.watergirl) {
      const watergirlY = 60;
      if (this.defenseCooldown.watergirl <= 0 && !this.activeDefense.watergirl) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.fillText("DEFENSE READY (P)", this.width - 200, watergirlY);
      } else if (this.activeDefense.watergirl) {
        const timeLeft = this.defenseDuration - (Date.now() - this.defenseStartTime.watergirl) / 1000;
        this.ctx.fillStyle = "#ffff00";
        this.ctx.fillText(`DEFENSE: ${timeLeft.toFixed(1)}s`, this.width - 200, watergirlY);
      } else {
        const cooldownLeft = this.defenseCooldown.watergirl;
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillText(`DEFENSE COOLDOWN: ${cooldownLeft.toFixed(1)}s`, this.width - 200, watergirlY);
      }
    }
  }

  drawUltimateIndicators() {
    const fontSize = 14;
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.textAlign = "center";

    // Fireboy ultimate
    if (this.fireboy) {
      const fireboyX = 70;
      const fireboyY = 100;
      if (this.fireboy.ultimateCooldown <= 0) {
        this.ctx.fillStyle = "#ffff00";
        this.ctx.fillText("READY! (E)", fireboyX, fireboyY);
      } else {
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillText(`COOLDOWN: ${this.fireboy.ultimateCooldown.toFixed(1)}s`, fireboyX, fireboyY);
      }
    }

    // Watergirl ultimate
    if (this.watergirl) {
      const watergirlX = this.width - 70;
      const watergirlY = 100;
      if (this.watergirl.ultimateCooldown <= 0) {
        this.ctx.fillStyle = "#ffff00";
        this.ctx.fillText("READY! (O)", watergirlX, watergirlY);
      } else {
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillText(`COOLDOWN: ${this.watergirl.ultimateCooldown.toFixed(1)}s`, watergirlX, watergirlY);
      }
    }
  }

  drawUltimateButtons() {
    const buttonSize = 60;
    const buttonY = this.height - 80;

    // Fireboy ultimate button (bottom left)
    const fireboyButtonX = 20;
    this.ctx.fillStyle = this.fireboy && this.fireboy.ultimateCooldown <= 0 ? "#ffff00" : "#666";
    this.ctx.fillRect(fireboyButtonX, buttonY, buttonSize, buttonSize);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(fireboyButtonX, buttonY, buttonSize, buttonSize);
    
    this.ctx.fillStyle = "#000";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("E", fireboyButtonX + buttonSize / 2, buttonY + buttonSize / 2 + 8);

    // Watergirl ultimate button (bottom right)
    const watergirlButtonX = this.width - 80;
    this.ctx.fillStyle = this.watergirl && this.watergirl.ultimateCooldown <= 0 ? "#ffff00" : "#666";
    this.ctx.fillRect(watergirlButtonX, buttonY, buttonSize, buttonSize);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(watergirlButtonX, buttonY, buttonSize, buttonSize);
    
    this.ctx.fillStyle = "#000";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("O", watergirlButtonX + buttonSize / 2, buttonY + buttonSize / 2 + 8);
  }

  drawDoorUI() {
    // Draw door countdown
    if (this.doorActive) {
      const timeLeft = Math.ceil(this.doorCountdown / 1000);
      this.ctx.fillStyle = "#ffff00";
      this.ctx.font = "bold 24px Arial";
      this.ctx.textAlign = "center";
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(`DOOR: ${timeLeft}s`, this.width / 2, 60);
      this.ctx.fillText(`DOOR: ${timeLeft}s`, this.width / 2, 60);
    } else if (!this.door) {
      const timeUntilDoor = Math.ceil(
        (this.doorSpawnDelay - (Date.now() - this.gameStartTime)) / 1000
      );
      if (timeUntilDoor > 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "center";
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(`DOOR IN: ${timeUntilDoor}s`, this.width / 2, 60);
        this.ctx.fillText(`DOOR IN: ${timeUntilDoor}s`, this.width / 2, 60);
      }
    }
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  window.game = new Game();
});
