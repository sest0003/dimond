// Diamond Pacman Game
class DiamondPacman {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 40; // Ökade från 20 till 40 för större spelare
        this.rows = this.canvas.height / this.gridSize;
        this.cols = this.canvas.width / this.gridSize;
        
        // Lägg till timing för saktare rörelse
        this.lastMoveTime = 0;
        this.moveDelay = 200; // 200ms mellan varje rörelse (5 rörelser per sekund)
        
        // Spelvariabler
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameWon = false;
        this.gameOver = false;
        
        // Spelare
        this.player = {
            x: 8,
            y: 13,
            direction: 'right',
            nextDirection: 'right',
            character: '😊'
        };
        
        // Spöken
        this.ghosts = [
            { x: 9, y: 1, direction: 'left', color: '#FF0000' },
            { x: 1, y: 9, direction: 'right', color: '#FF69B4' },
            { x: 9, y: 9, direction: 'up', color: '#00FFFF' }
        ];
        
        // Projektiler
        this.bullets = [];
        
        // Labyrint (1 = vägg, 0 = tom, 2 = diamant)
        this.maze = this.createMaze();
        this.diamonds = this.createDiamonds();
        
        // Karaktärsmappning med transparenta bilder
        this.characterMap = {
            'chili': 'chili_transparent.png',
            'ko': 'ko_transparent.png',
            'robot': 'robot_transparent.png',
            'potatis': 'potatis_transparent.png',
            'tårta': 'tårta_transparent.png',
            'huggtand': 'huggtand_transparant.png'
        };
        
        // Ladda karaktärsbilder
        this.characterImages = {};
        this.loadCharacterImages();
        
        this.init();
    }
    
    loadCharacterImages() {
        const imagePromises = [];
        
        Object.keys(this.characterMap).forEach(character => {
            const img = new Image();
            img.src = `images/${this.characterMap[character]}`;
            
            const promise = new Promise((resolve) => {
                img.onload = () => {
                    this.characterImages[character] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Kunde inte ladda bild för ${character}`);
                    resolve();
                };
            });
            
            imagePromises.push(promise);
        });
        
        return Promise.all(imagePromises);
    }
    
    async init() {
        // Vänta på att bilderna laddas
        await this.loadCharacterImages();
        
        // Hämta vald karaktär
        const selectedCharacter = localStorage.getItem('selectedCharacter') || 'chili';
        this.player.character = this.characterMap[selectedCharacter];
        
        // Uppdatera UI
        document.getElementById('currentCharacter').textContent = this.player.character;
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        
        // Event listeners
        this.setupEventListeners();
        
        // Starta spelet
        this.startGame();
    }
    
    setupEventListeners() {
        // Tangentbord
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.player.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    this.player.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    this.player.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    this.player.nextDirection = 'right';
                    break;
                case ' ':
                    e.preventDefault(); // Förhindra scrollning
                    this.shoot();
                    break;
            }
        });
        
        // Knappar
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    createMaze() {
        // Skapa din egen labyrint för hand
        const maze = [];
        
        // Först skapa en tom labyrint
        for (let y = 0; y < this.rows; y++) {
            maze[y] = [];
            for (let x = 0; x < this.cols; x++) {
                maze[y][x] = 0; // Tom ruta
            }
        }
        
        // Lägg till väggar runt kanterna
        for (let x = 0; x < this.cols; x++) {
            maze[0][x] = 1; // Övre kant
            maze[this.rows - 1][x] = 1; // Nedre kant
        }
        for (let y = 0; y < this.rows; y++) {
            maze[y][0] = 1; // Vänster kant
            maze[y][this.cols - 1] = 1; // Höger kant
        }
        
       // Labyrint mönster

       maze[1][3] = 1;
       maze[2][3] = 1;
  

        // v1
     maze[13][5] = 1;
     maze[12][5] = 1;  
     maze[11][5] = 1;  
     maze[10][5] = 1;  
     maze[10][6] = 1;  
     maze[10][7] = 1;  
     maze[10][8] = 1;  
     maze[10][9] = 1;  
     maze[10][10] = 1;  
     maze[10][11] = 1;  
     maze[10][12] = 1;  

     maze[9][10] = 1; 
     maze[8][10] = 1; 
     maze[7][10] = 1; 
     maze[6][10] = 1; 
    
     maze[6][9] = 1; 
     maze[6][8] = 1; 
     maze[6][7] = 1; 
     maze[6][6] = 1; 
     maze[6][5] = 1;
     maze[6][4] = 1;
     maze[5][4] = 1;
     maze[4][4] = 1;
     
     maze[4][5] = 1;
     maze[4][6] = 1;
     maze[4][7] = 1;
     maze[4][8] = 1;
     
    // v2
     maze[13][7] = 1;
     maze[12][7] = 1;   
    
    //v3
     maze[13][9] = 1;
     maze[12][9] = 1;
   

     // v4

     maze[13][15] = 1;
     maze[12][15] = 1;
     maze[11][15] = 1;
     maze[10][15] = 1;
     maze[9][15] = 1;
     maze[8][15] = 1;
     maze[7][15] = 1;
     maze[6][15] = 1;
     maze[5][15] = 1;
     maze[4][15] = 1;
     maze[4][14] = 1;
     maze[4][13] = 1;
     maze[4][12] = 1;
     maze[4][11] = 1;
     maze[4][10] = 1;
     
     maze[3][13] = 1;
     maze[2][13] = 1;
 
   
  
    
 
       
     maze[6][14] = 1;
     maze[6][13] = 1;
  
     maze[12][14] = 1;
     maze[12][13] = 1;
     maze[12][12] = 1;
     maze[12][11] = 1;

     maze[10][14] = 1;
   
  
       
        
        return maze;
    }
    
    createDiamonds() {
        const diamonds = [];
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                if (this.maze[y][x] === 0) {
                    diamonds.push({ x, y });
                }
            }
        }
        return diamonds;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            this.update();
        }
        
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const currentTime = Date.now();
        
        // Uppdatera projektiler kontinuerligt (snabbare än spelare)
        this.updateBullets();
        
        // Uppdatera bara om det har gått tillräckligt lång tid
        if (currentTime - this.lastMoveTime >= this.moveDelay) {
            // Uppdatera spelare
            this.updatePlayer();
            
            // Uppdatera spöken
            this.updateGhosts();
            
            // Kolla kollisioner
            this.checkCollisions();
            
            // Kolla om spelet är vunnet
            if (this.diamonds.length === 0 && this.ghosts.length === 0) {
                this.gameWon = true;
                this.gameRunning = false;
                this.showGameOver('Du vann! 🎉');
            }
            
            this.lastMoveTime = currentTime;
        }
    }
    
    updatePlayer() {
        // Kolla om nästa riktning är möjlig
        const nextPos = this.getNextPosition(this.player.x, this.player.y, this.player.nextDirection);
        if (this.isValidPosition(nextPos.x, nextPos.y)) {
            this.player.direction = this.player.nextDirection;
        }
        
        // Flytta spelare
        const newPos = this.getNextPosition(this.player.x, this.player.y, this.player.direction);
        if (this.isValidPosition(newPos.x, newPos.y)) {
            this.player.x = newPos.x;
            this.player.y = newPos.y;
        }
        
        // Kolla om spelaren samlade en diamant
        this.collectDiamond();
    }
    
    updateGhosts() {
        this.ghosts.forEach(ghost => {
            // Enkel AI - rör sig i nuvarande riktning tills den träffar en vägg
            const newPos = this.getNextPosition(ghost.x, ghost.y, ghost.direction);
            
            if (!this.isValidPosition(newPos.x, newPos.y)) {
                // Vänd riktning
                const directions = ['up', 'down', 'left', 'right'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            } else {
                ghost.x = newPos.x;
                ghost.y = newPos.y;
            }
        });
    }
    
    getNextPosition(x, y, direction) {
        switch(direction) {
            case 'up': return { x, y: y - 1 };
            case 'down': return { x, y: y + 1 };
            case 'left': return { x: x - 1, y };
            case 'right': return { x: x + 1, y };
            default: return { x, y };
        }
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows && this.maze[y][x] !== 1;
    }
    
    shoot() {
        // Skapa en ny projektil i spelarens riktning (använd nextDirection om den finns, annars direction)
        const shootDirection = this.player.nextDirection || this.player.direction;
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            direction: shootDirection
        });
    }
    
    updateBullets() {
        // Uppdatera alla projektiler
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Flytta projektilen
            const newPos = this.getNextPosition(bullet.x, bullet.y, bullet.direction);
            
            // Kolla om projektilen träffar en vägg
            if (!this.isValidPosition(newPos.x, newPos.y)) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            bullet.x = newPos.x;
            bullet.y = newPos.y;
            
            // Kolla om projektilen träffar ett spöke
            const ghostIndex = this.ghosts.findIndex(ghost => 
                ghost.x === bullet.x && ghost.y === bullet.y
            );
            
            if (ghostIndex !== -1) {
                // Ta bort spöket och projektilen
                this.ghosts.splice(ghostIndex, 1);
                this.bullets.splice(i, 1);
                // Ge poäng för att döda spöke
                this.score += 50;
                document.getElementById('score').textContent = this.score;
            }
        }
    }
    
    collectDiamond() {
        const diamondIndex = this.diamonds.findIndex(d => d.x === this.player.x && d.y === this.player.y);
        if (diamondIndex !== -1) {
            this.diamonds.splice(diamondIndex, 1);
            this.score += 10;
            document.getElementById('score').textContent = this.score;
        }
    }
    
    checkCollisions() {
        // Kolla kollision med spöken (bara om spelaren inte är i samma position som en projektil just sköt)
        for (const ghost of this.ghosts) {
            if (ghost.x === this.player.x && ghost.y === this.player.y) {
                this.loseLife();
                break;
            }
        }
    }
    
    loseLife() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameRunning = false;
            this.showGameOver('Game Over! 💀');
        } else {
            // Återställ spelare position
            this.player.x = 1;
            this.player.y = 1;
        }
    }
    
    showGameOver(message) {
        alert(message);
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Fortsätt' : 'Pausa';
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameWon = false;
        this.gameOver = false;
        
        this.player.x = 1;
        this.player.y = 1;
        this.player.direction = 'right';
        this.player.nextDirection = 'right';
        
        // Återställ spöken
        this.ghosts = [
            { x: 9, y: 1, direction: 'left', color: '#FF0000' },
            { x: 1, y: 9, direction: 'right', color: '#FF69B4' },
            { x: 9, y: 9, direction: 'up', color: '#00FFFF' }
        ];
        
        // Rensa projektiler
        this.bullets = [];
        
        this.diamonds = this.createDiamonds();
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('pauseBtn').textContent = 'Pausa';
    }
    
    draw() {
        // Rensa canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rita labyrint
        this.drawMaze();
        
        // Rita diamanter
        this.drawDiamonds();
        
        // Rita projektiler
        this.drawBullets();
        
        // Rita spöken
        this.drawGhosts();
        
        // Rita spelare
        this.drawPlayer();
    }
    
    drawMaze() {
        this.ctx.fillStyle = '#0000FF';
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }
    }
    
    drawDiamonds() {
        this.ctx.fillStyle = '#FFD700';
        this.diamonds.forEach(diamond => {
            const x = diamond.x * this.gridSize + this.gridSize / 2;
            const y = diamond.y * this.gridSize + this.gridSize / 2;
            
            // Rita diamant som en romb
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 6);
            this.ctx.lineTo(x + 6, y);
            this.ctx.lineTo(x, y + 6);
            this.ctx.lineTo(x - 6, y);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            const centerX = bullet.x * this.gridSize + this.gridSize / 2;
            const centerY = bullet.y * this.gridSize + this.gridSize / 2;
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Bestäm riktning för dynamiten (större nu)
            let width, height;
            let fuseX = centerX;
            let fuseY = centerY;
            
            switch(bullet.direction) {
                case 'up':
                    width = 12;
                    height = 18;
                    fuseY = centerY - height/2;
                    break;
                case 'down':
                    width = 12;
                    height = 18;
                    fuseY = centerY + height/2;
                    break;
                case 'left':
                    width = 18;
                    height = 12;
                    fuseX = centerX - width/2;
                    break;
                case 'right':
                    width = 18;
                    height = 12;
                    fuseX = centerX + width/2;
                    break;
                default:
                    width = 14;
                    height = 14;
            }
            
            // Rita mörk kontur för bättre synlighet
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
            
            // Rita dynamit-röret (röd rektangel med mörkare röd)
            this.ctx.fillStyle = '#B22222'; // Mörkare röd för bättre kontrast
            this.ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
            
            // Rita gula band runt dynamiten (mörkare guld för bättre kontrast)
            this.ctx.fillStyle = '#FFA500'; // Orange/guld
            if (bullet.direction === 'up' || bullet.direction === 'down') {
                this.ctx.fillRect(centerX - width/2, centerY - 3, width, 3);
                this.ctx.fillRect(centerX - width/2, centerY + 2, width, 3);
            } else {
                this.ctx.fillRect(centerX - 3, centerY - height/2, 3, height);
                this.ctx.fillRect(centerX + 2, centerY - height/2, 3, height);
            }
            
            // Rita stubin (brun liten rektangel)
            this.ctx.fillStyle = '#654321'; // Mörkare brun
            if (bullet.direction === 'up' || bullet.direction === 'down') {
                this.ctx.fillRect(fuseX - 2, fuseY - 3, 4, 5);
            } else {
                this.ctx.fillRect(fuseX - 3, fuseY - 2, 5, 4);
            }
            
            // Rita brinnande stubin med glöd-effekt
            this.ctx.shadowColor = '#FF4500';
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = '#FF4500'; // Orange/röd
            this.ctx.beginPath();
            this.ctx.arc(fuseX, fuseY, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Inre ljusare låga
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#FFD700'; // Guld
            this.ctx.beginPath();
            this.ctx.arc(fuseX, fuseY, 2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        }
    }
    
    drawGhosts() {
        this.ghosts.forEach(ghost => {
            const x = ghost.x * this.gridSize + this.gridSize / 2;
            const y = ghost.y * this.gridSize + this.gridSize / 2;
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Glödande eld-effekt
            this.ctx.shadowColor = '#FF4500';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Rita eld-emoji
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillText('🔥', x, y);
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        });
    }
    
    drawPlayer() {
        const x = this.player.x * this.gridSize + this.gridSize / 2;
        const y = this.player.y * this.gridSize + this.gridSize / 2;
        
        // Hämta vald karaktär
        const selectedCharacter = localStorage.getItem('selectedCharacter') || 'chili';
        const characterImage = this.characterImages[selectedCharacter];
        
        if (characterImage) {
            // Rita transparent bild med glöd-effekt
            const size = this.gridSize; // Lämna lite marginal
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Glöd-effekt
         
            
            // Rita transparent bilden
            this.ctx.drawImage(
                characterImage, 
                x - size/2, 
                y - size/2, 
                size, 
                size
            );
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        } else {
            // Fallback till emoji om bilden inte laddats
            const emoji = selectedCharacter === 'chili' ? '🌶️' : 
                         selectedCharacter === 'ko' ? '🐄' :
                         selectedCharacter === 'robot' ? '🤖' :
                         selectedCharacter === 'potatis' ? '🥔' :
                         selectedCharacter === 'huggtand' ? '🦷' : '🎂';
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Skapa rund guldfärgad bakgrund
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.gridSize/2 - 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Glöd-effekt
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Rita emoji
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(emoji, x, y);
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        }
    }
}

// Starta spelet när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
    new DiamondPacman();
});
