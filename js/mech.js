class Mech {
  constructor(x, y, colorScheme, controls, isPlayer1) {
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 64;
    this.colorScheme = colorScheme;
    this.controls = controls;
    this.isPlayer1 = isPlayer1;
    
    this.health = 100;
    this.maxHealth = 100;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isGrounded = false;
    this.isAttacking = false;
    this.isDefending = false;
    this.attackCooldown = 0;
    this.attackDuration = 0;
    this.hurtTimer = 0;
    this.frame = 0;
    this.frameTimer = 0;
    this.state = 'idle';
    this.facingRight = isPlayer1;
  }
  
  update(keys, groundY, canvasWidth, opponent) {
    this.velocityX = 0;
    
    if (!this.isAttacking && !this.isDefending) {
      if (keys[this.controls.left]) {
        this.velocityX = -5;
        this.facingRight = false;
        this.state = 'walk';
      }
      if (keys[this.controls.right]) {
        this.velocityX = 5;
        this.facingRight = true;
        this.state = 'walk';
      }
      if (!keys[this.controls.left] && !keys[this.controls.right]) {
        this.state = 'idle';
      }
      if (keys[this.controls.jump] && this.isGrounded) {
        this.velocityY = -15;
        this.isGrounded = false;
        this.state = 'jump';
      }
    }
    
    if (keys[this.controls.attack] && this.attackCooldown <= 0 && !this.isDefending) {
      this.isAttacking = true;
      this.attackDuration = 20;
      this.attackCooldown = 40;
      this.state = 'attack';
    }
    
    this.isDefending = keys[this.controls.defend] && !this.isAttacking;
    if (this.isDefending) {
      this.state = 'defend';
    }
    
    this.velocityY += 0.8;
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    if (this.y + this.height > groundY) {
      this.y = groundY - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
    }
    
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
    
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.attackDuration > 0) {
      this.attackDuration--;
      if (this.attackDuration <= 0) {
        this.isAttacking = false;
      }
    }
    if (this.hurtTimer > 0) this.hurtTimer--;
    
    this.frameTimer++;
    if (this.frameTimer >= 8) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % 4;
    }
    
    if (this.isAttacking) {
      this.checkAttackHit(opponent);
    }
  }
  
  checkAttackHit(opponent) {
    if (this.attackDuration !== 15) return;
    
    const attackRange = 60;
    const attackX = this.facingRight ? this.x + this.width : this.x - attackRange;
    const attackWidth = attackRange;
    
    if (attackX < opponent.x + opponent.width &&
        attackX + attackWidth > opponent.x &&
        this.y < opponent.y + opponent.height &&
        this.y + this.height > opponent.y) {
      
      let damage = 15;
      if (opponent.isDefending) {
        damage = Math.floor(damage * 0.2);
      }
      opponent.takeDamage(damage);
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.hurtTimer = 10;
    if (this.health < 0) this.health = 0;
  }
  
  draw(ctx) {
    ctx.save();
    
    if (this.hurtTimer > 0 && this.hurtTimer % 4 < 2) {
      ctx.globalAlpha = 0.5;
    }
    
    const centerX = this.x + this.width / 2;
    if (!this.facingRight) {
      ctx.translate(centerX * 2, 0);
      ctx.scale(-1, 1);
    }
    
    this.drawMech(ctx);
    
    ctx.restore();
    
    if (this.isAttacking) {
      this.drawAttackEffect(ctx);
    }
    
    if (this.isDefending) {
      this.drawShield(ctx);
    }
  }
  
  drawMech(ctx) {
    const colors = this.colorScheme;
    const x = this.x;
    const y = this.y;
    const bounce = this.state === 'walk' ? Math.sin(this.frame * Math.PI / 2) * 2 : 0;
    
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x + 8, y + bounce + 28, 32, 28);
    
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 10, y + bounce + 26, 28, 28);
    
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(x + 12, y + bounce + 28, 8, 8);
    
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x + 12, y + bounce + 8, 24, 20);
    
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 14, y + bounce + 6, 20, 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 26, y + bounce + 10, 6, 6);
    
    ctx.fillStyle = colors.dark;
    ctx.fillRect(x + 28, y + bounce + 12, 2, 2);
    
    const armOffset = this.isAttacking ? 10 : (this.state === 'walk' ? Math.sin(this.frame * Math.PI / 2) * 3 : 0);
    
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x - 4, y + bounce + 28 + armOffset, 10, 20);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x - 2, y + bounce + 26 + armOffset, 8, 20);
    
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x + 40, y + bounce + 28 - armOffset, 10, 20);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 42, y + bounce + 26 - armOffset, 8, 20);
    
    const legOffset = this.state === 'walk' ? Math.sin(this.frame * Math.PI / 2) * 4 : 0;
    
    ctx.fillStyle = colors.dark;
    ctx.fillRect(x + 14, y + 52 + bounce, 8, 16);
    ctx.fillRect(x + 26, y + 52 + bounce, 8, 16);
    
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x + 12, y + 54 + bounce + legOffset, 10, 14);
    ctx.fillRect(x + 26, y + 54 + bounce - legOffset, 10, 14);
    
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 14, y + 52 + bounce + legOffset, 8, 12);
    ctx.fillRect(x + 28, y + 52 + bounce - legOffset, 8, 12);
  }
  
  drawAttackEffect(ctx) {
    const colors = this.colorScheme;
    const attackX = this.facingRight ? this.x + this.width : this.x - 50;
    const progress = 1 - (this.attackDuration / 20);
    const size = 30 + progress * 30;
    
    ctx.save();
    ctx.globalAlpha = 1 - progress * 0.5;
    
    ctx.fillStyle = colors.highlight;
    ctx.beginPath();
    ctx.arc(
      attackX + 25,
      this.y + this.height / 2,
      size,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(
      attackX + 25,
      this.y + this.height / 2,
      size * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
  }
  
  drawShield(ctx) {
    const colors = this.colorScheme;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    ctx.strokeStyle = colors.highlight;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      45,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      43,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
  }
  
  drawHealthBar(ctx, x, y, isLeft) {
    const barWidth = 180;
    const barHeight = 20;
    const healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    const healthWidth = barWidth * healthPercent;
    if (isLeft) {
      ctx.fillRect(x, y, healthWidth, barHeight);
    } else {
      ctx.fillRect(x + barWidth - healthWidth, y, healthWidth, barHeight);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = isLeft ? 'left' : 'right';
    ctx.fillText(`${this.health}/${this.maxHealth}`, isLeft ? x + 5 : x + barWidth - 5, y + 15);
  }
  
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isGrounded = false;
    this.isAttacking = false;
    this.isDefending = false;
    this.attackCooldown = 0;
    this.attackDuration = 0;
    this.hurtTimer = 0;
    this.frame = 0;
    this.frameTimer = 0;
    this.state = 'idle';
    this.facingRight = this.isPlayer1;
  }
}
