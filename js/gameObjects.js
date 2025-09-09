// Game Objects Classes
class Platform {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  render(ctx) {
    // Use platform sprite if available
    if (window.game && window.game.assets && window.game.assets.platformSprite) {
      ctx.drawImage(
        window.game.assets.platformSprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      // Fallback to gradient rendering
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.color + "80");
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  checkCollision(character) {
    return (
      character.x < this.x + this.width &&
      character.x + character.width > this.x &&
      character.y < this.y + this.height &&
      character.y + character.height > this.y
    );
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.collected = false;
    this.bobOffset = 0;
    this.bobSpeed = 3;
  }

  update(deltaTime) {
    this.bobOffset += this.bobSpeed * deltaTime;
  }

  render(ctx) {
    if (this.collected) return;

    const bobY = this.y + Math.sin(this.bobOffset) * 5;
    
    ctx.save();
    ctx.translate(0, bobY - this.y);
    
    switch (this.type) {
      case "health":
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("H", this.x + this.width / 2, this.y + this.height / 2 + 4);
        break;
      case "speed":
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("S", this.x + this.width / 2, this.y + this.height / 2 + 4);
        break;
    }
    
    ctx.restore();
  }

  checkCollision(character) {
    if (this.collected) return false;
    return (
      character.x < this.x + this.width &&
      character.x + character.width > this.x &&
      character.y < this.y + this.height &&
      character.y + character.height > this.y
    );
  }

  collect() {
    this.collected = true;
  }
}

class Goal {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 80;
    this.type = type; // 'fireboy', 'watergirl', or 'both'
    this.activated = false;
    this.glowIntensity = 0;
  }

  update(deltaTime) {
    this.glowIntensity += deltaTime * 3;
  }

  render(ctx) {
    const glow = Math.sin(this.glowIntensity) * 0.5 + 0.5;
    
    // Glow effect
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 20 * glow;
    ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + glow * 0.2})`;
    ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
    ctx.shadowBlur = 0;

    // Goal body
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Goal text
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GOAL", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  checkCollision(character) {
    return (
      character.x < this.x + this.width &&
      character.x + character.width > this.x &&
      character.y < this.y + this.height &&
      character.y + character.height > this.y
    );
  }
}

class Switch extends Goal {
  constructor(x, y, type) {
    super(x, y, type);
    this.activated = false;
    this.activationTime = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.activated) {
      this.activationTime += deltaTime;
    }
  }

  render(ctx) {
    const glow = Math.sin(this.glowIntensity) * 0.5 + 0.5;
    const color = this.activated ? "#00ff00" : "#ff0000";
    
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * glow;
    ctx.fillStyle = `${color}${Math.floor((0.3 + glow * 0.2) * 255).toString(16).padStart(2, '0')}`;
    ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
    ctx.shadowBlur = 0;

    // Switch body
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Switch text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SWITCH", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  activate() {
    this.activated = true;
    this.activationTime = 0;
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
    this.maxHealth = 50;
    this.speed = 100;
    this.direction = 1;
    this.attackCooldown = 0;
    this.color = type === "fire" ? "#ff6b35" : "#4a90e2";
  }

  update(deltaTime) {
    // Move back and forth
    this.x += this.direction * this.speed * deltaTime;
    
    // Reverse direction at screen edges
    if (this.x <= 0 || this.x + this.width >= window.game.width) {
      this.direction *= -1;
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
  }

  render(ctx) {
    // Draw enemy body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw health bar
    const barWidth = this.width;
    const barHeight = 4;
    const barX = this.x;
    const barY = this.y - 8;

    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  attack() {
    if (this.attackCooldown <= 0) {
      this.attackCooldown = 2; // 2 seconds between attacks
      return new Projectile(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.direction,
        this.type
      );
    }
    return null;
  }
}

class BossEnemy extends Enemy {
  constructor(x, y, type) {
    super(x, y, type);
    this.width = 80;
    this.height = 80;
    this.health = 200;
    this.maxHealth = 200;
    this.speed = 50;
    this.ultimateCooldown = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    // Update ultimate cooldown
    if (this.ultimateCooldown > 0) {
      this.ultimateCooldown -= deltaTime;
    }
  }

  render(ctx) {
    // Draw boss body (larger)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw boss crown
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(this.x + 10, this.y - 10, this.width - 20, 15);

    // Draw health bar (larger)
    const barWidth = this.width;
    const barHeight = 8;
    const barX = this.x;
    const barY = this.y - 15;

    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  ultimateAttack() {
    if (this.ultimateCooldown <= 0) {
      this.ultimateCooldown = 10; // 10 seconds between ultimate attacks
      return new UltimateProjectile(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.direction,
        this.type
      );
    }
    return null;
  }
}

class Door {
  constructor(x, y, sprite = null) {
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 80;
    this.open = false;
    this.animationTime = 0;
    this.sprite = sprite;
  }

  update(deltaTime) {
    this.animationTime += deltaTime;
  }

  render(ctx) {
    ctx.save();

    // Draw door sprite or fallback rectangle
    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      const glow = Math.sin(this.animationTime * 5) * 0.5 + 0.5;
      
      // Glow effect
      ctx.shadowColor = "#ffff00";
      ctx.shadowBlur = 20 * glow;
      ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + glow * 0.2})`;
      ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
      ctx.shadowBlur = 0;

      // Door body
      ctx.fillStyle = this.open ? "#00ff00" : "#ffff00";
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Door frame
      ctx.strokeStyle = "#8B4513";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  checkCollision(character) {
    return (
      character.x < this.x + this.width &&
      character.x + character.width > this.x &&
      character.y < this.y + this.height &&
      character.y + character.height > this.y
    );
  }
}
