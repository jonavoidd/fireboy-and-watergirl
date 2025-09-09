// Character Classes
class Character {
  constructor(x, y, color, name) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.color = color;
    this.name = name;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 200;
    this.jumpPower = 500;
    this.velocityX = 0;
    this.velocityY = 0;
    this.onGround = false;
    this.facingRight = true;
    this.ultimateCooldown = 0;
    this.ultimateDuration = 0;
    this.ultimateActive = false;
    this.defenseCount = 0;
    this.defenseCooldown = 0;
    this.defenseActive = false;
    this.defenseStartTime = 0;
    this.defenseDuration = 3; // 3 seconds
    this.defenseCooldownTime = 10; // 10 seconds cooldown
  }

  update(deltaTime) {
    // Apply gravity
    this.velocityY += 800 * deltaTime;

    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Keep character on screen
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > window.game.width) {
      this.x = window.game.width - this.width;
    }

    // Check platform collisions
    this.checkPlatformCollisions(window.game.platforms);

    // Check if on ground (fallback for bottom of screen)
    if (!this.onGround) {
      this.onGround = this.y + this.height >= window.game.height - 50;
    }

    // Update ultimate cooldown
    if (this.ultimateCooldown > 0) {
      this.ultimateCooldown -= deltaTime;
    }

    // Update ultimate duration
    if (this.ultimateDuration > 0) {
      this.ultimateDuration -= deltaTime;
      if (this.ultimateDuration <= 0) {
        this.ultimateActive = false;
      }
    }

    // Update defense cooldown
    if (this.defenseCooldown > 0) {
      this.defenseCooldown -= deltaTime;
    }

    // Update defense duration
    if (this.defenseActive) {
      const defenseTime = (Date.now() - this.defenseStartTime) / 1000;
      if (defenseTime >= this.defenseDuration) {
        this.defenseActive = false;
        this.defenseCooldown = this.defenseCooldownTime;
      }
    }
  }

  render(ctx) {
    if (this.name === "fireboy" && window.game.assets.fireboySprite) {
      // Draw Fireboy sprite
      ctx.drawImage(
        window.game.assets.fireboySprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (this.name === "watergirl" && window.game.assets.watergirlSprite) {
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

      // Draw eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x + 15, this.y + 15, 5, 5);
      ctx.fillRect(this.x + 25, this.y + 15, 5, 5);
    }

    // Draw health bar
    const barWidth = 40;
    const barHeight = 5;
    const barX = this.x;
    const barY = this.y - 10;

    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Ultimate indicator
    if (this.ultimateCooldown <= 0) {
      ctx.fillStyle = "#ff0";
      ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, 2);
    }

    // Defense indicator
    if (this.defenseActive) {
      ctx.strokeStyle = "#00f";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
  }

  jump() {
    if (this.onGround) {
      this.velocityY = -this.jumpPower;
      this.onGround = false;
    }
  }

  moveLeft() {
    this.velocityX = -this.speed;
    this.facingRight = false;
  }

  moveRight() {
    this.velocityX = this.speed;
    this.facingRight = true;
  }

  stop() {
    this.velocityX = 0;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }

  activateUltimate() {
    if (this.ultimateCooldown <= 0) {
      this.ultimateActive = true;
      this.ultimateDuration = 5; // 5 seconds
      this.ultimateCooldown = 15; // 15 seconds cooldown
      return true;
    }
    return false;
  }

  activateDefense() {
    if (this.defenseCooldown <= 0 && !this.defenseActive) {
      this.defenseActive = true;
      this.defenseStartTime = Date.now();
      return true;
    }
    return false;
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
        // Hitting platform from below
        else if (this.velocityY < 0 && this.y + this.height > platform.y + platform.height) {
          this.y = platform.y + platform.height;
          this.velocityY = 0;
        }
        // Hitting platform from the left
        else if (this.velocityX > 0 && this.x < platform.x) {
          this.x = platform.x - this.width;
          this.velocityX = 0;
        }
        // Hitting platform from the right
        else if (this.velocityX < 0 && this.x + this.width > platform.x + platform.width) {
          this.x = platform.x + platform.width;
          this.velocityX = 0;
        }
      }
    });
  }

  shoot() {
    if (this.ultimateActive) {
      return new UltimateProjectile(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.facingRight ? 1 : -1,
        this.name
      );
    } else {
      return new Projectile(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.facingRight ? 1 : -1,
        this.name
      );
    }
  }
}

class Fireboy extends Character {
  constructor(x, y) {
    super(x, y, "#ff6b35", "fireboy");
    this.controls = {
      left: "KeyA",
      right: "KeyD",
      jump: "KeyW",
      shoot: "Space",
      ultimate: "KeyE",
      defense: "KeyQ"
    };
  }

  handleInput(keys) {
    if (keys[this.controls.left]) {
      this.moveLeft();
    } else if (keys[this.controls.right]) {
      this.moveRight();
    } else {
      this.stop();
    }

    if (keys[this.controls.jump]) {
      this.jump();
    }

    if (keys[this.controls.shoot]) {
      const projectile = this.shoot();
      if (projectile) {
        window.game.projectiles.push(projectile);
      }
    }

    if (keys[this.controls.ultimate]) {
      this.activateUltimate();
    }

    if (keys[this.controls.defense]) {
      this.activateDefense();
    }
  }
}

class Watergirl extends Character {
  constructor(x, y) {
    super(x, y, "#4a90e2", "watergirl");
    this.controls = {
      left: "ArrowLeft",
      right: "ArrowRight",
      jump: "ArrowUp",
      shoot: "Enter",
      ultimate: "KeyO",
      defense: "KeyP"
    };
  }

  handleInput(keys) {
    if (keys[this.controls.left]) {
      this.moveLeft();
    } else if (keys[this.controls.right]) {
      this.moveRight();
    } else {
      this.stop();
    }

    if (keys[this.controls.jump]) {
      this.jump();
    }

    if (keys[this.controls.shoot]) {
      const projectile = this.shoot();
      if (projectile) {
        window.game.projectiles.push(projectile);
      }
    }

    if (keys[this.controls.ultimate]) {
      this.activateUltimate();
    }

    if (keys[this.controls.defense]) {
      this.activateDefense();
    }
  }
}
