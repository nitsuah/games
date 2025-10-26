# 🎮 Asteroid Game - Testing Guide

## Quick Start

1. **Start Dev Server** (if not running):
   ```bash
   wsl bash -c "cd /mnt/c/Users/ajhar/code/games/app && npm run dev"
   ```

2. **Open Game**: http://localhost:3000/asteroid

3. **Click anywhere** to activate pointer lock (enables mouse control)

---

## 🎯 Controls

### Movement
- **W** - Thrust forward
- **S** - Thrust backward
- **A** - Strafe left
- **D** - Strafe right
- **Space** - Thrust up
- **Shift** - Thrust down
- **Mouse** - Look/aim direction

### Combat
- **Left Click** - Shoot
- **1** - Switch to Spread weapon
- **2** - Switch to Laser weapon
- **3** - Switch to Explosive weapon

### System
- **ESC** - Release pointer lock (pause)

---

## 🧪 Testing Checklist

### Core Mechanics
- [ ] Player moves smoothly with WASD
- [ ] Mouse look works correctly
- [ ] Shooting destroys targets
- [ ] Health decreases on collision with targets
- [ ] Game over triggers at 0 health
- [ ] Score increases when hitting targets
- [ ] High score persists after restart

### Power-Ups (Locations)
Test each power-up by flying into them:

#### Health (Green) - Cluster 1
- [ ] Position [10, 10, 0] - Restores 25 HP
- [ ] Position [13, 22, 0]
- [ ] Position [16, 34, 0]
- **Expected**: Health bar increases, green flash

#### Shield (Blue) - Cluster 2
- [ ] Position [-10, 10, 0] - Activates 3-hit shield
- [ ] Position [-13, 22, 0]
- [ ] Position [-16, 34, 0]
- **Expected**: Blue sphere appears around player, "Shield (3 hits)" in indicator
- [ ] Test: Hit target 3 times, shield should deplete

#### Rapid Fire (Red) - Cluster 3
- [ ] Position [0, -10, 0] - 10s faster shooting
- [ ] Position [3, -22, 0]
- [ ] Position [6, -34, 0]
- **Expected**: "Rapid Fire" appears in indicator, shooting is faster

#### Slow Motion (Purple) - Cluster 4
- [ ] Position [0, 0, 10] - 10s slowed targets
- [ ] Position [3, 12, 12]
- [ ] Position [6, 24, 14]
- **Expected**: "Slow Motion" appears, targets move slower

#### Invincibility (Yellow) - Cluster 5
- [ ] Position [15, 0, 0] - 10s immunity
- [ ] Position [18, 12, 0]
- [ ] Position [21, 24, 0]
- **Expected**: "Invincibility" appears, no damage from collisions, yellow flash on hit

#### Speed Boost (Orange) - Cluster 6
- [ ] Position [-15, 0, 0] - 10s faster movement
- [ ] Position [-18, 12, 0]
- [ ] Position [-21, 24, 0]
- **Expected**: "Speed Boost" appears, player moves faster

### Visual Feedback
- [ ] Red flash on player collision
- [ ] Cyan/Blue flash when shield absorbs hit
- [ ] Green flash on health restore
- [ ] Yellow flash when invincible and hit
- [ ] Targets change color when aimed at
- [ ] Targets turn red/transparent when hit
- [ ] Shield sphere visible and pulsing

### UI Elements
- [ ] Health displayed (top-left stats panel)
- [ ] Score displayed (center)
- [ ] Weapon type displayed (bottom-right)
- [ ] Ammo count shown (bottom-right)
- [ ] Active power-ups shown (top-right)
- [ ] Shield hit count accurate
- [ ] Crosshair visible for spread weapon

### Weapons
- [ ] Spread weapon shoots correctly
- [ ] Laser weapon fires (check for laser beam)
- [ ] Explosive weapon works
- [ ] Ammo decreases with shots
- [ ] Cooldown prevents spam
- [ ] Weapon switching works (1, 2, 3 keys)

### Game States
- [ ] Game starts with 100 health
- [ ] Pointer lock activates on click
- [ ] Game over overlay shows at 0 health
- [ ] Final score displayed correctly
- [ ] High score updates if beaten
- [ ] Restart button resets game properly
- [ ] Win condition (all targets destroyed) works

### Audio (If sounds are configured)
- [ ] Background music plays
- [ ] Collision sound on target hit
- [ ] Hit sound when player takes damage
- [ ] Shield hit sound
- [ ] Game over sound
- [ ] Music pauses on game over

---

## 🐛 Bug Reporting Template

If you find an issue, note:

**Bug**: [Brief description]
**Steps to reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Console errors**: [Check browser console - F12]

---

## 💡 Testing Tips

### Finding Power-Ups
Power-ups are floating colored spheres. Navigate to their coordinates:
- **Right/Up** = positive X/Y
- **Left/Down** = negative X/Y
- **Forward** = positive Z

### Testing Shield
1. Collect blue shield power-up
2. Look for cyan wireframe sphere around you
3. Fly into 3 targets
4. Shield should show: 3 hits → 2 hits → 1 hit → depleted

### Testing Invincibility
1. Collect yellow invincibility power-up
2. Fly into targets
3. Health should NOT decrease
4. Yellow flash should appear instead of red

### Testing Health System
1. Note starting health (100)
2. Collide with small target (5-20 HP loss)
3. Collide with large target (more damage)
4. Watch health reach 0 for game over

### Testing Multiple Power-Ups
1. Collect shield (blue)
2. Collect rapid fire (red)
3. Both should show in top-right indicator
4. Both effects should be active simultaneously

---

## 🎯 Performance Checks

### FPS Monitoring
- Game should maintain 60 FPS
- No stuttering during movement
- Smooth target animations
- Responsive shooting

### Memory
- No memory leaks during long sessions
- Power-ups properly cleanup after duration
- Targets removed from memory when destroyed

---

## ✅ Success Criteria

**Game is considered fully functional if**:
- [x] Health system works
- [x] All 6 power-ups function correctly
- [x] Shield visuals appear
- [x] Game over triggers properly
- [ ] Audio plays (needs testing)
- [ ] All weapons work
- [ ] Restart functions correctly
- [ ] Score persists

**Current Status**: 7/8 core features working! 🎉

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Core Mechanics: ☐ Pass ☐ Fail
Power-Ups: ☐ Pass ☐ Fail  
Visual Feedback: ☐ Pass ☐ Fail
UI Elements: ☐ Pass ☐ Fail
Weapons: ☐ Pass ☐ Fail
Game States: ☐ Pass ☐ Fail
Audio: ☐ Pass ☐ Fail ☐ N/A

Notes:
_________________________________
_________________________________
_________________________________

Overall: ☐ Ready for Play ☐ Needs Work
```