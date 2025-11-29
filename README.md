# 💎 Diamond Pacman 💎

Ett Pacman-spel byggt med Express.js där du samlar diamanter istället för prickar!

## 🎮 Funktioner

- **5 olika karaktärer** att välja mellan:
  - 😊 Klassisk Pacman
  - 👻 Blå Spöke  
  - 🤖 Robot
  - 🐱 Katt
  - 👽 Utomjording

- **Diamantsamling** istället för prickar
- **2D-spelupplevelse** med canvas
- **Spöke-AI** som jagar dig
- **Poängsystem** och liv
- **Responsiv design** för olika skärmstorlekar

## 🚀 Installation och körning

1. **Installera dependencies:**
   ```bash
   npm install
   ```

2. **Starta servern:**
   ```bash
   npm start
   ```

3. **Öppna spelet:**
   Gå till `http://localhost:3000` i din webbläsare

## 🎯 Hur man spelar

1. **Välj karaktär** på startsidan
2. **Använd piltangenterna** för att röra dig
3. **Samla alla diamanter** för att vinna
4. **Undvik spökena** - de tar dina liv!
5. **Få poäng** för varje diamant du samlar

## 🎨 Anpassning

### Byt ut karaktärsbilder

Du kan enkelt byta ut karaktärsbilderna genom att:

1. Ersätt emoji-symbolerna i `public/character-selection.html`
2. Eller lägg till riktiga bilder i `public/images/` mappen
3. Uppdatera CSS:en i `public/styles.css` för nya stilar

### Ändra labyrinten

Redigera `createMaze()` funktionen i `public/game.js` för att skapa din egen labyrint.

### Lägg till fler spöken

Lägg till fler spöken i `ghosts` arrayen i `public/game.js`.

## 📁 Projektstruktur

```
Diamond/
├── server.js              # Express server
├── package.json           # Dependencies
├── public/
│   ├── character-selection.html  # Karaktärsval
│   ├── game.html          # Spelsida
│   ├── game.js            # Spellogik
│   ├── styles.css         # Styling
│   └── images/            # Karaktärsbilder (tom för nu)
└── README.md
```

## 🛠️ Teknologier

- **Backend:** Express.js
- **Frontend:** HTML5, CSS3, JavaScript
- **Grafik:** HTML5 Canvas
- **Styling:** CSS Grid, Flexbox, Gradients

## 🎮 Kontroller

- **Piltangenter:** Röra spelaren
- **Pausa-knapp:** Pausa/fortsätt spelet
- **Starta om-knapp:** Starta om spelet
- **Tillbaka-knapp:** Gå tillbaka till karaktärsval

Ha så kul med att spela Diamond Pacman! 💎🎮
