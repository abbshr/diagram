class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 400;
    
    this.keys = {};
    this.gameState = 'menu';
    this.winner = null;
    this.stars = [];
    
    this.initStars();
    this.initMechs();
    this.setupEventListeners();
    this.gameLoop();
  }
  
  initStars() {
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 340,
        size: Math.random() * 2 + 1,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }
  
  initMechs() {
    const player1Colors = {
      primary: '#00aaff',
      shadow: '#0066aa',
      highlight: '#66ddff',
      dark: '#003366'
    };
    
    const player2Colors = {
      primary: '#ff4444',
      shadow: '#aa2222',
      highlight: '#ff8888',
      dark: '#661111'
    };
    
    const player1Controls = {
      left: 'KeyA',
      right: 'KeyD',
      jump: 'KeyW',
      attack: 'KeyJ',
      defend: 'KeyK'
    };
    
    const player2Controls = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      jump: 'ArrowUp',
      attack: 'Comma',
      defend: 'Period'
    };
    
    this.player1 = new Mech(100, 200, player1Colors, player1Controls, true);
    this.player2 = new Mech(650, 200, player2Colors, player2Controls, false);
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' && (this.gameState === 'menu' || this.gameState === 'gameover')) {
        this.startGame();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    document.getElementById('startBtn').addEventListener('click', () => {
      this.startGame();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.startGame();
    });
  }
  
  startGame() {
    this.gameState = 'playing';
    this.winner = null;
    this.player1.reset(100, 200);
    this.player2.reset(650, 200);
  }
  
  update() {
    if (this.gameState !== 'playing') return;
    
    const groundY = this.canvas.height - 60;
    
    this.player1.update(this.keys, groundY, this.canvas.width, this.player2);
    this.player2.update(this.keys, groundY, this.canvas.width, this.player1);
    
    if (this.player1.health <= 0) {
      this.gameState = 'gameover';
      this.winner = 'Player 2';
    } else if (this.player2.health <= 0) {
      this.gameState = 'gameover';
      this.winner = 'Player 1';
    }
    
    this.stars.forEach(star => {
      star.twinkle += 0.05;
    });
  }
  
  draw() {
    this.ctx.fillStyle = '#111122';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawStars();
    this.drawGround();
    
    if (this.gameState === 'menu') {
      this.drawMenu();
    } else if (this.gameState === 'playing' || this.gameState === 'gameover') {
      this.player1.draw(this.ctx);
      this.player2.draw(this.ctx);
      this.drawHealthBars();
      
      if (this.gameState === 'gameover') {
        this.drawGameOver();
      }
    }
  }
  
  drawStars() {
    this.stars.forEach(star => {
      const alpha = 0.5 + Math.sin(star.twinkle) * 0.5;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
  }
  
  drawGround() {
    const groundY = this.canvas.height - 60;
    
    this.ctx.fillStyle = '#222233';
    this.ctx.fillRect(0, groundY, this.canvas.width, 60);
    
    this.ctx.fillStyle = '#333344';
    for (let i = 0; i < this.canvas.width; i += 40) {
      this.ctx.fillRect(i, groundY, 20, 4);
    }
    
    this.ctx.strokeStyle = '#444455';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(this.canvas.width, groundY);
    this.ctx.stroke();
  }
  
  drawHealthBars() {
    this.player1.drawHealthBar(this.ctx, 20, 20, true);
    this.player2.drawHealthBar(this.ctx, this.canvas.width - 200, 20, false);
    
    this.ctx.fillStyle = '#00aaff';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('P1', 20, 55);
    
    this.ctx.fillStyle = '#ff4444';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('P2', this.canvas.width - 20, 55);
  }
  
  drawMenu() {
    this.ctx.fillStyle = '#00aaff';
    this.ctx.font = '24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PIXEL MECH BATTLE', this.canvas.width / 2, 120);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('Press SPACE or click START', this.canvas.width / 2, 200);
    
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#00aaff';
    this.ctx.fillText('Player 1', 200, 260);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('A/D - Move', 200, 285);
    this.ctx.fillText('W - Jump', 200, 305);
    this.ctx.fillText('J - Attack', 200, 325);
    this.ctx.fillText('K - Defend', 200, 345);
    
    this.ctx.fillStyle = '#ff4444';
    this.ctx.fillText('Player 2', 600, 260);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('←/→ - Move', 600, 285);
    this.ctx.fillText('↑ - Jump', 600, 305);
    this.ctx.fillText(', - Attack', 600, 325);
    this.ctx.fillText('. - Defend', 600, 345);
  }
  
  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const winnerColor = this.winner === 'Player 1' ? '#00aaff' : '#ff4444';
    this.ctx.fillStyle = winnerColor;
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.winner} WINS!`, this.canvas.width / 2, 180);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('Press SPACE or click RESET', this.canvas.width / 2, 240);
  }
  
  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

window.onload = () => {
  new Game();
};
