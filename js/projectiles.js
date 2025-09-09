// Projectile and Effects Classes
class Projectile {
  constructor(x, y, direction, owner) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 8;
    this.direction = direction;
    this.owner = owner;
    this.speed = 400;
    this.damage = 20;
    this.color = owner === "fireboy" ? "#ff6b35" : "#4a90e2";
  }

  update(deltaTime) {
    this.x += this.direction * this.speed * deltaTime;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  checkCollision(target) {
    return (
      this.x < target.x + target.width &&
      this.x + this.width > target.x &&
      this.y < target.y + target.height &&
      this.y + this.height > target.y
    );
  }
}

class UltimateProjectile {
  constructor(x, y, direction, owner) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.direction = direction;
    this.owner = owner;
    this.speed = 600;
    this.damage = 50;
    this.color = owner === "fireboy" ? "#ff0000" : "#0080ff";
    this.glowIntensity = 0;
  }

  update(deltaTime) {
    this.x += this.direction * this.speed * deltaTime;
    this.glowIntensity += deltaTime * 10;
  }

  render(ctx) {
    // Glow effect
    const glowRadius = 20 + Math.sin(this.glowIntensity) * 5;
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 2,
      this.y + this.height / 2,
      0,
      this.x + this.width / 2,
      this.y + this.height / 2,
      glowRadius
    );
    gradient.addColorStop(0, this.color + "80");
    gradient.addColorStop(1, this.color + "00");
    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x - glowRadius,
      this.y - glowRadius,
      this.width + glowRadius * 2,
      this.height + glowRadius * 2
    );

    // Main projectile
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  checkCollision(target) {
    return (
      this.x < target.x + target.width &&
      this.x + this.width > target.x &&
      this.y < target.y + target.height &&
      this.y + this.height > target.y
    );
  }
}

class DefenseBarrier {
  constructor(x, y, owner) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 80;
    this.owner = owner;
    this.active = true;
    this.color = owner === "fireboy" ? "#ff6b35" : "#4a90e2";
  }

  render(ctx) {
    if (!this.active) return;

    // Create vertical gradient
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x + this.width,
      this.y + this.height
    );
    gradient.addColorStop(0, this.color + "80");
    gradient.addColorStop(0.5, this.color + "ff");
    gradient.addColorStop(1, this.color + "80");

    // Draw barrier
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color + "40";
    ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    ctx.shadowBlur = 0;
  }

  checkCollision(target) {
    if (!this.active) return false;
    return (
      this.x < target.x + target.width &&
      this.x + this.width > target.x &&
      this.y < target.y + target.height &&
      this.y + this.height > target.y
    );
  }
}

class Effect {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.size = 20;
    this.angle = 0;
    this.velocityX = (Math.random() - 0.5) * 200;
    this.velocityY = (Math.random() - 0.5) * 200;
  }

  update(deltaTime) {
    this.life -= deltaTime;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    this.angle += deltaTime * 5;
    this.velocityX *= 0.98;
    this.velocityY *= 0.98;
  }

  render(ctx) {
    if (this.life <= 0) return;

    const alpha = this.life / this.maxLife;
    const size = this.size * alpha;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    switch (this.type) {
      case "explosion":
        ctx.fillStyle = "#ff6b35";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case "heal":
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case "goal":
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
    }

    ctx.restore();
  }
}

class TextEffect {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 2.0;
    this.maxLife = 2.0;
    this.velocityY = -50;
  }

  update(deltaTime) {
    this.life -= deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  render(ctx) {
    if (this.life <= 0) return;

    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
