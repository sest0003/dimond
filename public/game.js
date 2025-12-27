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
        this.level = 1;
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
            character: '😊',
            lastX: 8,
            lastY: 13
        };
        
        // Fireballs
        this.ghosts = [
            { x: 9, y: 1, direction: 'left', color: '#FF0000' },
            { x: 1, y: 9, direction: 'right', color: '#FF69B4' },
            { x: 9, y: 9, direction: 'up', color: '#00FFFF' }
        ];
        
        // Spawner (skapar fireballs)
        this.spawners = [
            { x: 5, y: 5, direction: 'right', lastSpawnTime: Date.now(), hp: 4 }
        ];
        
        // Hunters (nya fiender)
        this.hunters = [];
        
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
            'huggtand': 'huggtand_transparant.png',
            'pumpa': 'clean_transparent_pumpkin.png',
            'alien': 'Alien.png',
            'hollow': 'Hollow.png',
            'krabban': 'krabban.png',
            'tjuven': 'Osynliga tjuven.png',
            'anden': 'anden.png',
            'red_monster': 'red_monster.png',
            'banana': 'banana.png',
            'cowboy-gamer': 'cowboy-gamer.png'
        };
        
        // Ladda karaktärsbilder
        this.characterImages = {};
        this.loadCharacterImages();
        
        // Ladda spawner-bild
        this.spawnerImage = null;
        this.loadSpawnerImage();
        
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
    
    loadSpawnerImage() {
        const img = new Image();
        img.src = 'images/Frågetecknet.png';
        
        img.onload = () => {
            this.spawnerImage = img;
        };
        
        img.onerror = () => {
            console.warn('Kunde inte ladda spawner-bild');
        };
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
        document.getElementById('level').textContent = this.level;
        
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
            window.location.href = 'character-selection.html';
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
    
    createMazeLevel2() {
        // Skapa en ny labyrint för level 2
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
        
        // Level 2 labyrint mönster (svårare med öppningar)
        // Centralt område - U-formad struktur med öppningar
        maze[6][6] = 1;
        maze[6][7] = 1;
      
        maze[6][9] = 1;
        maze[7][6] = 1;
        // maze[7][7] och maze[7][8] är öppna (0) - öppning uppåt
        maze[7][9] = 1;
        maze[8][6] = 1;
        // maze[8][7] och maze[8][8] är öppna (0) - öppning uppåt
        maze[8][9] = 1;
        maze[9][6] = 1;
        maze[9][7] = 1;
        maze[9][8] = 1;
        maze[9][9] = 1;
        
        // Vänster sida - med öppningar
        maze[2][3] = 1;
        maze[3][3] = 1;
        // maze[4][3] är öppen (0) - öppning
        maze[5][3] = 1;
        maze[3][4] = 1;
        // maze[4][4] är öppen (0) - öppning
        maze[3][5] = 1;
        
        // Höger sida - med öppningar
        maze[2][13] = 1;
        maze[3][13] = 1;
        // maze[4][13] är öppen (0) - öppning
        maze[5][13] = 1;
        maze[3][12] = 1;
        // maze[4][12] är öppen (0) - öppning
        maze[3][11] = 1;
        
        // Övre del - med öppningar
        maze[3][7] = 1;
        // maze[3][8] är öppen (0) - öppning
        maze[3][9] = 1;
        maze[4][7] = 1;
        // maze[4][8] är öppen (0) - öppning
        maze[4][9] = 1;
        
        // Nedre del - med öppningar
        maze[11][7] = 1;
        // maze[11][8] är öppen (0) - öppning
        maze[11][9] = 1;
        // maze[10][7] är öppen (0) - öppning till centralt område (inte satt till 1)
        // maze[10][8] är öppen (0) - öppning till centralt område (inte satt till 1)
        maze[10][9] = 1;
        
        // Öppning från övre till centralt område
        // maze[5][7] och maze[5][8] är öppna (0) - inte satt till 1
        
        // Ytterligare väggar - med öppningar för att koppla ihop områden
        maze[7][3] = 1;
        // maze[7][4] är öppen (0) - kopplar vänster till mitten
        maze[8][3] = 1;
        // maze[8][4] är öppen (0) - kopplar vänster till mitten
        maze[7][13] = 1;
        // maze[7][12] är öppen (0) - kopplar höger till mitten
        maze[8][13] = 1;
        // maze[8][12] är öppen (0) - kopplar höger till mitten
        
        maze[12][5] = 1;
        // maze[11][5] är öppen (0) - kopplar nedre del
        maze[12][6] = 1;
        // maze[11][6] är öppen (0) - kopplar nedre del
        maze[12][10] = 1;
        // maze[11][10] är öppen (0) - kopplar nedre del
        maze[12][11] = 1;
        // maze[11][11] är öppen (0) - kopplar nedre del
        
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
            
            // Uppdatera spawners
            this.updateSpawners();
            
            // Uppdatera hunters
            this.updateHunters();
            
            // Kolla om level ska ökas
            this.checkLevelUp();
            
            // Kolla kollisioner
            this.checkCollisions();
            
            // Kolla om spelet är vunnet
            if (this.diamonds.length === 0 && this.ghosts.length === 0 && this.spawners.length === 0 && this.hunters.length === 0) {
                this.gameWon = true;
                this.gameRunning = false;
                this.showGameOver('Du vann! 🎉');
            }
            
            this.lastMoveTime = currentTime;
        }
    }
    
    updatePlayer() {
        // Spara tidigare position
        this.player.lastX = this.player.x;
        this.player.lastY = this.player.y;
        
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
    
    updateSpawners() {
        const currentTime = Date.now();
        // Level 1: 2 minuter, Level 2: 1 minut
        const spawnInterval = this.level === 1 ? 120000 : 60000;    
        
        this.spawners.forEach(spawner => {
            // Rör sig slumpmässigt
            const newPos = this.getNextPosition(spawner.x, spawner.y, spawner.direction);
            
            if (!this.isValidPosition(newPos.x, newPos.y)) {
                // Välj ny slumpmässig riktning
                const directions = ['up', 'down', 'left', 'right'];
                spawner.direction = directions[Math.floor(Math.random() * directions.length)];
            } else {
                // Flytta spawner
                spawner.x = newPos.x;
                spawner.y = newPos.y;
            }
            
            // Kolla om det är dags att skapa en fireball
            if (currentTime - spawner.lastSpawnTime >= spawnInterval) {
                this.spawnFireball(spawner.x, spawner.y);
                spawner.lastSpawnTime = currentTime;
            }
        });
    }
    
    spawnFireball(x, y) {
        // Skapa en ny fireball (ghost) vid spawner-positionen
        const directions = ['up', 'down', 'left', 'right'];
        const colors = ['#FF0000', '#FF69B4', '#00FFFF', '#FFA500', '#FF1493'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.ghosts.push({
            x: x,
            y: y,
            direction: randomDirection,
            color: randomColor
        });
    }
    
    checkLevelUp() {
        if (this.level === 1 && this.score >= 1500) {
            this.level = 2;
            document.getElementById('level').textContent = this.level;
            this.loadLevel(2);
        }
    }
    
    loadLevel(level) {
        // Återställ spelare position
        this.player.x = 1;
        this.player.y = 1;
        this.player.lastX = 1;
        this.player.lastY = 1;
        this.player.direction = 'right';
        this.player.nextDirection = 'right';
        
        // Rensa projektiler
        this.bullets = [];
        
        if (level === 1) {
            // Level 1 setup
            this.maze = this.createMaze();
            this.diamonds = this.createDiamonds();
            this.ghosts = [
                { x: 9, y: 1, direction: 'left', color: '#FF0000' },
                { x: 1, y: 9, direction: 'right', color: '#FF69B4' },
                { x: 9, y: 9, direction: 'up', color: '#00FFFF' }
            ];
            this.spawners = [
                { x: 5, y: 5, direction: 'right', lastSpawnTime: Date.now(), hp: 4 }
            ];
            this.hunters = [];
        } else if (level === 2) {
            // Level 2 setup
            this.maze = this.createMazeLevel2();
            this.diamonds = this.createDiamonds();
            this.ghosts = [
                { x: 10, y: 2, direction: 'left', color: '#FF0000' },
                { x: 2, y: 10, direction: 'right', color: '#FF69B4' },
                { x: 10, y: 10, direction: 'up', color: '#00FFFF' }
            ];
            this.spawners = [
                { x: 7, y: 7, direction: 'right', lastSpawnTime: Date.now(), hp: 4 }
            ];
            this.hunters = [
                { x: 5, y: 5, direction: 'down', speed: 1 }
            ];
        }
    }
    
    updateHunters() {
        this.hunters.forEach(hunter => {
            // Hunter jagar spelaren - rör sig mot spelaren
            const dx = this.player.x - hunter.x;
            const dy = this.player.y - hunter.y;
            
            // Välj riktning baserat på vilken axel som är längst bort
            let newDirection = hunter.direction;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Rör sig horisontellt
                newDirection = dx > 0 ? 'right' : 'left';
            } else {
                // Rör sig vertikalt
                newDirection = dy > 0 ? 'down' : 'up';
            }
            
            // Försök röra sig i den nya riktningen
            const newPos = this.getNextPosition(hunter.x, hunter.y, newDirection);
            if (this.isValidPosition(newPos.x, newPos.y)) {
                hunter.x = newPos.x;
                hunter.y = newPos.y;
                hunter.direction = newDirection;
            } else {
                // Om den nya riktningen inte fungerar, försök den andra axeln
                const altDirection = Math.abs(dx) > Math.abs(dy) 
                    ? (dy > 0 ? 'down' : 'up')
                    : (dx > 0 ? 'right' : 'left');
                const altPos = this.getNextPosition(hunter.x, hunter.y, altDirection);
                if (this.isValidPosition(altPos.x, altPos.y)) {
                    hunter.x = altPos.x;
                    hunter.y = altPos.y;
                    hunter.direction = altDirection;
                } else {
                    // Om ingen riktning fungerar, välj slumpmässig
                    const directions = ['up', 'down', 'left', 'right'];
                    hunter.direction = directions[Math.floor(Math.random() * directions.length)];
                }
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
        // Kolla om spelaren står still (samma position som förra gången)
        const isStandingStill = this.player.x === this.player.lastX && this.player.y === this.player.lastY;
        
        let shootDirection;
        
        if (isStandingStill && this.player.nextDirection) {
            // Om spelaren står still och försöker gå mot en vägg, skjut i motsatt riktning
            const nextPos = this.getNextPosition(this.player.x, this.player.y, this.player.nextDirection);
            const isBlocked = !this.isValidPosition(nextPos.x, nextPos.y);
            
            if (isBlocked) {
                // Spelaren står emot en vägg, skjut i motsatt riktning
                switch(this.player.nextDirection) {
                    case 'up': shootDirection = 'down'; break;
                    case 'down': shootDirection = 'up'; break;
                    case 'left': shootDirection = 'right'; break;
                    case 'right': shootDirection = 'left'; break;
                    default: shootDirection = this.player.direction;
                }
            } else {
                // Spelaren står still men vägen är öppen, använd nextDirection
                shootDirection = this.player.nextDirection;
            }
        } else {
            // Normal skjutning - använd nextDirection om den finns, annars direction
            shootDirection = this.player.nextDirection || this.player.direction;
        }
        
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
                this.checkLevelUp();
            }
            
            // Kolla om projektilen träffar en spawner
            const spawnerIndex = this.spawners.findIndex(spawner => 
                spawner.x === bullet.x && spawner.y === bullet.y
            );
            
            if (spawnerIndex !== -1) {
                const spawner = this.spawners[spawnerIndex];
                // Ta bort projektilen
                this.bullets.splice(i, 1);
                // Minska spawner HP
                spawner.hp -= 1;
                
                // Om spawnern är död
                if (spawner.hp <= 0) {
                    // Ta bort spawnern
                    this.spawners.splice(spawnerIndex, 1);
                    // Ge poäng för att döda spawner
                    this.score += 50;
                    document.getElementById('score').textContent = this.score;
                    this.checkLevelUp();
                }
            }
            
            // Kolla om projektilen träffar en hunter
            const hunterIndex = this.hunters.findIndex(hunter => 
                hunter.x === bullet.x && hunter.y === bullet.y
            );
            
            if (hunterIndex !== -1) {
                // Ta bort huntern och projektilen
                this.hunters.splice(hunterIndex, 1);
                this.bullets.splice(i, 1);
                // Ge poäng för att döda hunter
                this.score += 150;
                document.getElementById('score').textContent = this.score;
                this.checkLevelUp();
            }
        }
    }
    
    collectDiamond() {
        const diamondIndex = this.diamonds.findIndex(d => d.x === this.player.x && d.y === this.player.y);
        if (diamondIndex !== -1) {
            this.diamonds.splice(diamondIndex, 1);
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.checkLevelUp();
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
        
        // Kolla kollision med spawners
        for (const spawner of this.spawners) {
            if (spawner.x === this.player.x && spawner.y === this.player.y) {
                this.loseLife();
                break;
            }
        }
        
        // Kolla kollision med hunters
        for (const hunter of this.hunters) {
            if (hunter.x === this.player.x && hunter.y === this.player.y) {
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
            this.player.lastX = 1;
            this.player.lastY = 1;
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
        this.level = 1;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameWon = false;
        this.gameOver = false;
        
        // Ladda level 1
        this.loadLevel(1);
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('pauseBtn').textContent = 'Pausa';
    }
    
    draw() {
        // Rensa canvas med blå bakgrund
        this.ctx.fillStyle = '#1E3A8A'; // Mörkblå bakgrund
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rita labyrint
        this.drawMaze();
        
        // Rita diamanter
        this.drawDiamonds();
        
        // Rita projektiler
        this.drawBullets();
        
        // Rita spöken
        this.drawGhosts();
        
        // Rita spawners
        this.drawSpawners();
        
        // Rita hunters
        this.drawHunters();
        
        // Rita spelare
        this.drawPlayer();
    }
    
    drawMaze() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 1) {
                    const wallX = x * this.gridSize;
                    const wallY = y * this.gridSize;
                    
                    // Spara canvas-tillstånd
                    this.ctx.save();
                    
                    // Skapa gradient för sten/berg-effekt
                    const gradient = this.ctx.createLinearGradient(
                        wallX, wallY,
                        wallX + this.gridSize, wallY + this.gridSize
                    );
                    
                    // Gråa färger för sten/berg
                    gradient.addColorStop(0, '#6B7280'); // Ljusare grå
                    gradient.addColorStop(0.3, '#4B5563'); // Mörkare grå
                    gradient.addColorStop(0.7, '#374151'); // Ännu mörkare
                    gradient.addColorStop(1, '#1F2937'); // Mörkast
                    
                    // Rita väggen med gradient
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(wallX, wallY, this.gridSize, this.gridSize);
                    
                    // Lägg till skugga för djup
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowOffsetX = 2;
                    this.ctx.shadowOffsetY = 2;
                    
                    // Rita en ljusare kant för 3D-effekt
                    this.ctx.strokeStyle = '#9CA3AF';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(wallX + 1, wallY + 1, this.gridSize - 2, this.gridSize - 2);
                    
                    // Lägg till textur med små rektanglar för sten-effekt
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const offsetX = wallX + (i * this.gridSize / 3) + 2;
                            const offsetY = wallY + (j * this.gridSize / 3) + 2;
                            this.ctx.fillRect(offsetX, offsetY, this.gridSize / 4, this.gridSize / 4);
                        }
                    }
                    
                    // Återställ canvas-tillstånd
                    this.ctx.restore();
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
            
            // Bestäm riktning och storlek för vattenstrålen (större)
            let width, height;
            
            switch(bullet.direction) {
                case 'up':
                    width = 20;
                    height = 30;
                    break;
                case 'down':
                    width = 20;
                    height = 30;
                    break;
                case 'left':
                    width = 30;
                    height = 20;
                    break;
                case 'right':
                    width = 30;
                    height = 20;
                    break;
                default:
                    width = 24;
                    height = 24;
            }
            
            // Skapa gradient för vattenstråle-effekt
            let gradient;
            if (bullet.direction === 'up' || bullet.direction === 'down') {
                gradient = this.ctx.createLinearGradient(
                    centerX - width/2, centerY - height/2,
                    centerX - width/2, centerY + height/2
                );
            } else {
                gradient = this.ctx.createLinearGradient(
                    centerX - width/2, centerY - height/2,
                    centerX + width/2, centerY - height/2
                );
            }
            
            // Gradient från ljusare blå till mörkare blå
            gradient.addColorStop(0, '#87CEEB'); // Himmelblå
            gradient.addColorStop(0.5, '#4682B4'); // Stålblå
            gradient.addColorStop(1, '#1E90FF'); // Dodgerblå
            
            // Glöd-effekt för vattenstrålen
            this.ctx.shadowColor = '#00BFFF';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Rita vattenstrålen med rundade hörn
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            
            // Skapa rundade rektangel för vattenstrålen
            const radius = Math.min(width, height) / 4;
            const x = centerX - width/2;
            const y = centerY - height/2;
            
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + width - radius, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.ctx.lineTo(x + width, y + height - radius);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.ctx.lineTo(x + radius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.ctx.lineTo(x, y + radius);
            this.ctx.quadraticCurveTo(x, y, x + radius, y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Lägg till ljusare mittpunkt för djup
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Halvtransparent vit
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, width/3, height/3, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Lägg till ljusare kanter för glans
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
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
            
            // Rita eld-emoji (större)
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillText('🔥', x, y);
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        });
    }
    
    drawSpawners() {
        this.spawners.forEach(spawner => {
            const x = spawner.x * this.gridSize + this.gridSize / 2;
            const y = spawner.y * this.gridSize + this.gridSize / 2;
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            if (this.spawnerImage) {
                // Rita spawner-bild (större)
                const size = this.gridSize * 1.2;
                
                // Glödande lila effekt för spawner
                this.ctx.shadowColor = '#9D00FF';
                this.ctx.shadowBlur = 25;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
                
                // Rita bilden
                this.ctx.drawImage(
                    this.spawnerImage,
                    x - size/2,
                    y - size/2,
                    size,
                    size
                );
            } else {
                // Fallback om bilden inte laddats
                // Glödande lila/lila effekt för spawner
                this.ctx.shadowColor = '#9D00FF';
                this.ctx.shadowBlur = 25;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
                
                // Rita spawner som en lila cirkel med symbol (större)
                this.ctx.fillStyle = '#9D00FF';
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.gridSize / 2 * 1.2, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Rita symbol (⚡ eller ⚙️)
                this.ctx.font = '36px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText('⚙️', x, y);
            }
            
            // Rita HP-indikator
            this.ctx.shadowBlur = 0;
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(`HP: ${spawner.hp}`, x, y + this.gridSize / 2 + 10);
            this.ctx.fillText(`HP: ${spawner.hp}`, x, y + this.gridSize / 2 + 10);
            
            // Återställ canvas-tillstånd
            this.ctx.restore();
        });
    }
    
    drawHunters() {
        this.hunters.forEach(hunter => {
            const x = hunter.x * this.gridSize + this.gridSize / 2;
            const y = hunter.y * this.gridSize + this.gridSize / 2;
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Glödande röd/orange effekt för hunter
            this.ctx.shadowColor = '#FF4500';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Rita hunter som en röd/orange cirkel (större)
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.gridSize / 2 * 1.2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Rita symbol (👁️ eller 🎯)
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText('👁️', x, y);
            
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
            // Rita transparent bild med glöd-effekt (större)
            const size = this.gridSize * 1.2; // 20% större
            
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
                         selectedCharacter === 'huggtand' ? '🦷' :
                         selectedCharacter === 'pumpa' ? '🎃' :
                         selectedCharacter === 'alien' ? '👽' :
                         selectedCharacter === 'hollow' ? '💀' :
                         selectedCharacter === 'krabban' ? '🦀' :
                         selectedCharacter === 'tjuven' ? '🥷' :
                         selectedCharacter === 'anden' ? '🦆' :
                         selectedCharacter === 'red_monster' ? '👹' :
                         selectedCharacter === 'banana' ? '🍌' :
                         selectedCharacter === 'cowboy-gamer' ? '🤠' : '🎂';
            
            // Spara canvas-tillstånd
            this.ctx.save();
            
            // Skapa rund guldfärgad bakgrund (större)
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.gridSize/2 * 1.2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Glöd-effekt
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Rita emoji (större)
            this.ctx.font = '48px Arial';
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
