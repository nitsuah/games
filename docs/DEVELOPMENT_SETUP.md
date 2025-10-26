# 🛠️ Development Setup Guide

## Prerequisites

### Required Software
1. **Node.js (v18 or higher)** - JavaScript runtime
   - Download from: https://nodejs.org/
   - Includes npm package manager
   
2. **Git** - Version control
   - Windows: https://git-scm.com/download/win
   - Should already be installed if you're reading this

3. **VS Code** - Recommended IDE
   - Extensions: ES7+ React/Redux/React-Native snippets, Prettier, ESLint

## Quick Start

### 1. Install Dependencies
```powershell
cd c:\Users\ajhar\code\games\app
npm install
```

### 2. Start Development Server
```powershell
npm run dev
```
The games will be available at:
- Main menu: http://localhost:3000
- Asteroid game: http://localhost:3000/asteroid
- FPS Tank game: http://localhost:3000/fps

### 3. Build for Production
```powershell
npm run build
npm start
```

## Fixed Issues (Latest Session)

### ✅ Player Health System Fixed
**Problem**: Player wasn't losing health when colliding with targets in Asteroid game.

**Root Cause**: 
- `CollisionDetection` component was receiving an empty function `() => {}` instead of the actual `handlePlayerHit` function
- Parameter mismatch between collision detection and health handler

**Solution Applied**:
1. **GameCanvas.jsx**: Added `handlePlayerHit` to props and passed it to `CollisionDetection`
2. **Game.jsx**: Passed `handlePlayerHit` function to `GameCanvas`
3. **handlePlayerHit.js**: Updated to use `showFlash` function instead of `setShowRedFlash`
4. **CollisionDetection.jsx**: Added proper shield integration with `shieldActive` and `setShieldActive` props

**Files Modified**:
- `app/pages/asteroid/_comp/Game/GameCanvas.jsx`
- `app/pages/asteroid/_comp/Game/Game.jsx`
- `app/pages/asteroid/_comp/Game/handlePlayerHit.js`

## Development Workflow

### Testing Changes
```powershell
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000/asteroid

# Test collision damage:
# 1. Navigate around asteroids
# 2. Collide with green targets
# 3. Verify health decreases (shown in stats panel)
# 4. Verify red flash effect appears
# 5. Test shield power-ups
```

### Code Quality
```powershell
# Format code (when ESLint/Prettier are setup)
npm run lint
npm run format
```

## Next Priority Fixes

### 1. Power-Up System (Immediate)
- Shield effects not showing properly
- Rapid fire activation needs testing
- Visual indicators for active power-ups

### 2. Game Over Logic (Critical)
- Ensure game stops all actions when health reaches 0
- Test restart functionality resets all states
- Win condition when all targets are destroyed

### 3. Audio System (High)
- Verify sound effects play on collision
- Background music controls
- Volume settings

## Architecture Overview

```
app/
├── pages/
│   ├── asteroid/           # Asteroid game
│   │   └── _comp/
│   │       ├── Game/       # Main game logic
│   │       ├── Player/     # Player controls
│   │       ├── Target/     # Target/collision system
│   │       ├── UI/         # User interface
│   │       └── Weapons/    # Weapon systems
│   └── fps/               # FPS Tank game
└── _components/           # Shared components
    └── effects/           # Power-ups, explosions
```

## Debugging Tips

### Health System
```javascript
// Add to CollisionDetection.jsx for debugging
console.log('Player hit detected:', {
  targetId: target.id,
  targetSize: target.size,
  playerHealth: health,
  shieldActive: shieldActive
});
```

### Power-ups
```javascript
// Add to usePowerUps.js
console.log('Power-up collected:', {
  type: powerUpType,
  isActive: {
    shield: shieldActive,
    rapidFire: rapidFireActive,
    // ... other states
  }
});
```

## Common Issues

### 1. "npm not recognized"
- Install Node.js from nodejs.org
- Restart terminal/VS Code after installation

### 2. Port already in use
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### 3. Game not responding
- Check browser console for errors
- Verify all dependencies are installed
- Check if pointer lock is active (press ESC to release)

## Performance Monitoring

### 1. FPS Counter
- Add FPS display component
- Monitor Three.js render performance
- Check for memory leaks in long sessions

### 2. Asset Loading
- Optimize texture sizes
- Implement progressive loading
- Add loading indicators

## Deployment Options

### 1. Vercel (Recommended)
```powershell
npm install -g vercel
vercel
```

### 2. GitHub Pages
- Requires static export configuration
- See COPILOT_ROADMAP.md for detailed setup

### 3. Netlify
- Connect Git repository
- Build command: `npm run build`
- Publish directory: `out` (after static export setup)

---

*This guide will be updated as we implement more features and fix additional issues.*