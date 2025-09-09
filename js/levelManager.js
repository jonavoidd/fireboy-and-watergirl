// Level Management System
class LevelManager {
  constructor(game) {
    this.game = game;
  }

  createLevel(level) {
    this.game.projectiles = [];
    this.game.powerUps = [];
    this.game.platforms = [];
    this.game.goals = [];
    this.game.enemies = [];
    this.game.effects = [];
    this.game.textEffects = [];
    this.game.defenseWalls = [];

    // Reset defense system
    this.game.activeDefense = {
      fireboy: false,
      watergirl: false,
    };
    this.game.defenseCooldown = {
      fireboy: 0,
      watergirl: 0,
    };
    this.game.defenseStartTime = {
      fireboy: 0,
      watergirl: 0,
    };

    // Reset door system
    this.game.door = null;
    this.game.doorActive = false;
    this.game.doorCountdown = 0;
    this.game.gameStartTime = Date.now();
    this.game.doorSpawnDelay = 15000 + Math.random() * 15000; // 15-30 seconds

    // Create characters (always create them, even if assets aren't loaded)
    this.game.fireboy = new Fireboy(100, this.game.height - 150);
    this.game.watergirl = new Watergirl(this.game.width - 150, this.game.height - 150);

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

    // Update UI
    this.game.updateUI();
  }

  setupCompetitiveLevel() {
    this.game.gameMode = "competitive";
    document.getElementById("currentMode").textContent = "Competitive";
    document.getElementById("objectiveText").textContent =
      "Be the first to reach the door!";

    // Create platforms
    this.game.platforms = [
      new Platform(0, this.game.height - 50, this.game.width, 50, "#8B4513"),
      new Platform(200, this.game.height - 200, 200, 20, "#8B4513"),
      new Platform(600, this.game.height - 200, 200, 20, "#8B4513"),
      new Platform(400, this.game.height - 350, 200, 20, "#8B4513"),
    ];

    // Add power-ups
    this.game.powerUps.push(new PowerUp(300, this.game.height - 250, "health"));
    this.game.powerUps.push(new PowerUp(700, this.game.height - 250, "speed"));
  }

  setupCooperativeLevel() {
    this.game.gameMode = "cooperative";
    document.getElementById("currentMode").textContent = "Cooperative";
    document.getElementById("objectiveText").textContent =
      "Work together to reach the goal!";

    // Show door winner information
    if (this.game.doorWinner) {
      this.game.addTextEffect(
        this.game.width / 2,
        100,
        `${this.game.doorWinner.toUpperCase()} GOT THE POINT FROM LEVEL 1!`,
        this.game.doorWinner === "fireboy" ? "#ff6b35" : "#4a90e2"
      );
    }

    // Create platforms
    this.game.platforms = [
      new Platform(0, this.game.height - 50, this.game.width, 50, "#8B4513"),
      new Platform(150, this.game.height - 200, 150, 20, "#8B4513"),
      new Platform(300, this.game.height - 350, 150, 20, "#8B4513"),
      new Platform(450, this.game.height - 500, 150, 20, "#8B4513"),
      new Platform(600, this.game.height - 350, 150, 20, "#8B4513"),
      new Platform(750, this.game.height - 200, 150, 20, "#8B4513"),
    ];

    // Create goal
    this.game.goals.push(new Goal(850, this.game.height - 250, "both"));

    // Add enemies that both players must defeat
    this.game.enemies.push(new Enemy(400, this.game.height - 400, "fire"));
    this.game.enemies.push(new Enemy(500, this.game.height - 400, "water"));
  }

  setupBossLevel() {
    this.game.gameMode = "competitive";
    document.getElementById("currentMode").textContent = "Boss Battle";
    document.getElementById("objectiveText").textContent =
      "Defeat the boss first!";

    // Create platforms
    this.game.platforms = [
      new Platform(0, this.game.height - 50, this.game.width, 50, "#8B4513"),
      new Platform(200, this.game.height - 200, 200, 20, "#8B4513"),
      new Platform(600, this.game.height - 200, 200, 20, "#8B4513"),
    ];

    // Create boss
    this.game.enemies.push(new BossEnemy(400, this.game.height - 300, "fire"));
  }

  setupPuzzleLevel() {
    this.game.gameMode = "cooperative";
    document.getElementById("currentMode").textContent = "Puzzle";
    document.getElementById("objectiveText").textContent =
      "Solve the puzzle together!";

    // Create platforms
    this.game.platforms = [
      new Platform(0, this.game.height - 50, this.game.width, 50, "#8B4513"),
      new Platform(200, this.game.height - 200, 150, 20, "#8B4513"),
      new Platform(450, this.game.height - 200, 150, 20, "#8B4513"),
    ];

    // Create switches
    this.game.goals.push(new Switch(250, this.game.height - 250, "fireboy"));
    this.game.goals.push(new Switch(500, this.game.height - 250, "watergirl"));

    // Create final goal
    this.game.goals.push(new Goal(700, this.game.height - 250, "both"));
  }

  setupFinalLevel() {
    this.game.gameMode = "cooperative";
    document.getElementById("currentMode").textContent = "Final Level";
    document.getElementById("objectiveText").textContent =
      "Complete the final challenge!";

    // Create platforms
    this.game.platforms = [
      new Platform(0, this.game.height - 50, this.game.width, 50, "#8B4513"),
      new Platform(150, this.game.height - 200, 100, 20, "#8B4513"),
      new Platform(300, this.game.height - 350, 100, 20, "#8B4513"),
      new Platform(450, this.game.height - 500, 100, 20, "#8B4513"),
      new Platform(600, this.game.height - 350, 100, 20, "#8B4513"),
      new Platform(750, this.game.height - 200, 100, 20, "#8B4513"),
    ];

    // Create final boss
    this.game.enemies.push(new BossEnemy(400, this.game.height - 400, "fire"));
    this.game.enemies.push(new BossEnemy(500, this.game.height - 400, "water"));

    // Create final goal
    this.game.goals.push(new Goal(850, this.game.height - 250, "both"));
  }

  spawnDoor() {
    // Find a random platform to spawn the door on
    const platforms = this.game.platforms.filter(p => p.width > 100);
    if (platforms.length === 0) return;

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const doorX = platform.x + platform.width / 2 - 40;
    const doorY = platform.y - 80;

    this.game.door = new Door(doorX, doorY, this.game.assets.doorSprite);
    this.game.doorActive = true;
    this.game.doorSpawnTime = Date.now();

    // Play door spawn sound
    this.game.playSound(500, 0.5, "triangle");
  }

  checkDoorCollision() {
    if (!this.game.door) return;

    // Check if Fireboy reaches the door
    if (this.game.door.checkCollision(this.game.fireboy)) {
      this.handleDoorWin("fireboy");
    }
    // Check if Watergirl reaches the door
    else if (this.game.door.checkCollision(this.game.watergirl)) {
      this.handleDoorWin("watergirl");
    }
  }

  handleDoorWin(winner) {
    // Add points using global point system
    if (window.pointSystem) {
      window.pointSystem.addPoints(winner, 1, "door");
    }

    // Update local scores
    if (winner === "fireboy") {
      this.game.fireboyScore++;
    } else {
      this.game.watergirlScore++;
    }

    // Play win sound
    this.game.playSound(800, 1.0, "sine");

    // Add visual effects
    this.game.addEffect(this.game.door.x + 30, this.game.door.y + 30, "goal");
    this.game.addTextEffect(
      this.game.door.x + 30,
      this.game.door.y - 20,
      `${winner.toUpperCase()} WINS!`,
      winner === "fireboy" ? "#ff6b35" : "#4a90e2"
    );

    // Show level transition message
    this.game.addTextEffect(
      this.game.width / 2,
      this.game.height / 2,
      "TRANSITIONING TO LEVEL 2...",
      "#ffff00"
    );

    // Transition to level 2 after a short delay
    setTimeout(() => {
      this.transitionToLevel2(winner);
    }, 2000);

    // Update UI
    this.game.updateUI();
  }

  transitionToLevel2(winner) {
    // Store the winner for level 2
    this.game.doorWinner = winner;
    
    // Transition to level 2
    this.game.currentLevel = 2;
    this.createLevel(this.game.currentLevel);
    
    // Reset door system for level 2
    this.game.door = null;
    this.game.doorActive = false;
    this.game.doorCountdown = 0;
    this.game.doorSpawnDelay = 15000 + Math.random() * 15000;
    
    // Show level 2 message
    this.game.addTextEffect(
      this.game.width / 2,
      this.game.height / 2 - 50,
      "LEVEL 2: COOPERATIVE MODE",
      "#ffff00"
    );
    this.game.addTextEffect(
      this.game.width / 2,
      this.game.height / 2 - 20,
      `${winner.toUpperCase()} GOT THE POINT!`,
      winner === "fireboy" ? "#ff6b35" : "#4a90e2"
    );
    
    // Update UI
    this.game.updateUI();
  }
}
