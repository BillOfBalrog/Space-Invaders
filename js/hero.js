// const LASER_SPEED = 30
const SHIELD_DURATION = 5000
const SUPER_LASER_DURATION = 3000

let gHero
let gIntervalLaser
let gTimeoutBlink
let gLasers = []
let gLaserPos


// Just testing for now. The point is that when a laser is shot
// The will indicate where the laser was already used for hitting for something
// After a hit it will turn true, and only after all the necessary actions will take plans
// it will turn false again
// This is to ensure that a single laser will not be able to kill 2 aliens at once
//
// Another possible method could be that whenever there's a hit then to set a timeout
// for the same duration as the laser speed to indicate that if an aliens steps on a laser
// then the laser is currently inactive the alien can step on it
let gIsLaserHit = false
let gIsRockHit = false
let gIsBlowingUp // cool down for blow up negs function
let gIntervalSuperLaser // used to clear the super laser interval of the laser when using blow up negs

const gLaserSpeeds = {
    normal: 80,
    super: 30
}

// creates the hero and place it on board
function createHero(board) {
    gHero = {
        pos: {
            i: BOARD_SIZE - 2, 
            j: BOARD_SIZE / 2
        }, 
        lives: 3,
        isShoot: false,
        isSuper: false,
        superLaserCount: 3,
        isShield: false,
        shieldCount: 3
    }
    board[gHero.pos.i][gHero.pos.j].gameObject = GAME_OBJECTS.HERO
}

// Handle game keys
function onKeyDown(ev) {
    // start the game only if game restarted and ready
    if (ev.code === 'Enter' && !gGame.isOn) {
        handleOnStartGame()
        return
    }

    // These can be accessed when game is off
    handleKeyShortcuts(ev.code)

    if (!gGame.isOn) return

    handleGameControls(ev.code) 
}

function handleKeyShortcuts(keyCode) {
    switch (keyCode) {
        case 'Digit1':
            setDifficultyLevel('easy')
            break
        case 'Digit2':
            setDifficultyLevel('normal')
            break
        case 'Digit3':
            setDifficultyLevel('hard')
            break
        case 'Digit4':
            setDifficultyLevel('extreme')
            break
        case 'KeyR':
            init()
            break;
        case 'KeyB':
            toggleBunkers()
            break;
        case 'KeyF':
            handleOnAlienFreeze()
            break;
        case 'KeyM':
            toggleSound()
            break;
    }
}

function handleGameControls(keyCode) {
    switch (keyCode) {
        case 'ArrowRight':
            moveHero(1)
            break
        case 'ArrowLeft':
            moveHero(-1)
            break
        case 'Space':
            onShoot()
            break
        case 'KeyN':
            blowUpNeighbours()
            break
        case 'KeyX':
            enableSuperLaser()
            break
        case 'KeyZ':
            enableHeroShield()
            break
    }
}

// Move the hero right (1) or left (-1)
function moveHero(dir) {
    if (!gGame.isOn) return

    updateAndRenderCell(gHero.pos)

    gHero.pos.j = getHeroNextPosColumn(dir)
    updateAndRenderCell(gHero.pos, getHeroGameObject())

    // need to add when hero steps on a rock and not just if it hits directly
}


function onShoot() {
    // Last update: Now that I think I finally have super laser working
    // so far without bugs (all lasers clear)
    // if I'll have time I'll incorporate superShoot() and shoot() back together
    // in one function
    gHero.isSuper ? superShoot() : shoot()
}

/////////////////////////////////////////////////////////////////////////
// Some important notes about shoot:
// I've spent countless hours upon hours returning to shoot and throwRock and move ghosts functions
// 'On paper' it sounds good to rely ONLY on the model, but when you have lots of intervals at once
// From my own experience of things being out of sync it's probably a good measure for some game objects
// to also check if they exist in DOM and not only the model
// I may be wrong about this but after spending a few days going crazy I'll just set it like this
// That's the reason why those checks seem unnecessary and redundant
// And yes I'm aware that a lot of this 'onLaserHit' function can be combined together
// But after re-arranging dozens of times for "clean code" vs "debugging", I prefer them like they are now
// 
// Sets an interval for shutting (blinking) the laser up towards aliens
function shoot() {
    if (!gGame.isOn || gHero.isShoot) return

    const laserPos = { i: gHero.pos.i - 1, j: gHero.pos.j }

    gIntervalLaser = setInterval(() => {
        // if you place it before the function, and try to blow up very quickly after shooting
        // it will blow up in the previous gLaserPos
        gHero.isShoot = true 

        if (laserPos.i < 0) {
            onLaserOutOfRange()
            return
        }

        if (isElAlien(laserPos) || isAlien(laserPos)) {
            onLaserHitAlien(laserPos)
            return
        }

        if (isBunker(laserPos)) {
            onLaserHitBunker(laserPos)
        } else if (isElRock(laserPos) || isRock(laserPos)) {
            onLaserHitRock()
        } else if (isSpaceCandy(laserPos)) {
            onLaserHitSpaceCandy()
        }
        
        gLaserPos = {...laserPos}
        blinkLaser({...laserPos})
        laserPos.i--
    }, getLaserSpeed())
}

// renders a LASER at specific cell for short time and removes it
function blinkLaser(pos) {
    if (!isEmpty(pos) && !isSpaceCandy(pos)) {
        console.log('Trying to place laser an occupied cell', gBoard[pos.i][pos.j].gameObject)
        return
    }

    updateAndRenderCell(pos, getLaserGameObject())
    
    gTimeoutBlink = setTimeout(() => {
        if (isLaser(pos)) updateAndRenderCell(pos)
    }, getLaserSpeed())
}

//////////////////////////////////////////////////////
// For all these helper functions related to shoot
// the reason I'm not creating a clear interval and enable shooting again function
// is because I'd like to clear the interval immediately, perform the actions needed
// and only then enable shooting again

function onLaserHitAlien(pos) {
    clearInterval(gIntervalLaser)
    // comments about gIsLaserHit are at the top 
    // where it's declared
    if (gIsLaserHit) {
        gHero.isShoot = false
        return
    }

    gIsLaserHit = true
    console.log('Laser hit an alien')
    handleAlienHit(pos)
    gHero.isShoot = false
    gIsLaserHit = false
}

function onLaserHitBunker(pos) {
    clearInterval(gIntervalLaser)
    console.log('Laser hit a bunker')
    handleBunkerHit(pos)
    gHero.isShoot = false
}

function onLaserHitRock() {
    clearInterval(gIntervalLaser)
    console.log('Laser hit rock')
    clearRockInterval()
    gHero.isShoot = false
}

function onLaserHitSpaceCandy() {
    clearInterval(gIntervalLaser)
    console.log('Laser hit a space candy')
    handleSpaceCandyHit()
    gHero.isShoot = false
}

function onLaserOutOfRange() {
    clearInterval(gIntervalLaser)
    gHero.isShoot = false
}
 
function blowUpNeighbours() {
    if (!gGame.isOn || !gHero.isShoot || gIsBlowingUp) return

    if (gHero.isSuper) clearInterval(gIntervalSuperLaser)
    clearInterval(gIntervalLaser)
    gIsBlowingUp = true // blow up cooldown
    setTimeout(() => {  
        gIsBlowingUp = false
    },1000)

    if (isElAlien(gLaserPos) || isAlien(gLaserPos)) {
        console.log('Note: Should not be happening')
    }

    const negs = getNegs(gLaserPos)
    for (let i = 0; i < negs.length; i++) {
        handleBlowUpNeighbour(negs[i])
    }
    blowUpNeighbour(gLaserPos, true)
    gHero.isShoot = false
}

function handleBlowUpNeighbour(pos) {
    if (isElAlien(pos) || isAlien(pos)) {
        handleAlienHit(pos)
        blowUpNeighbour(pos)
    } else if (isElRock(pos) || isRock(pos)) {
        clearRockInterval()
        updateCell(pos)
        blowUpNeighbour(pos)
    } else if (isSpaceCandy(pos)) {
        // when candy is shot by laser, the blinkLaser timeout   clears the candy cell
        // but this time it needs to be cleared manually
        updateCell(pos) 
        handleSpaceCandyHit()
        blowUpNeighbour(pos)
    }
}

function blowUpNeighbour(pos, isExplode = null) {
    const img = isExplode ? gameImages.explosion : gameImages.flames
    renderCell(pos, img)

    setTimeout(() => {
        // const cellContent = getElCell(pos).innerHTML.trim()
        if (isElBlowUpImg(pos)) renderCell(pos)
    },3000)
}

/////////////////////////////////////////////////////
// I already previously implemented the super laser 
// inside the shoot function
// it worked perfectly as long as the ghosts did not move
// when the aliens move the laser sometimes has clearing issues
// this is because if a ghost hits (not laser hits a ghost)
// the ghost now has to clear the laser and find it in the intervals array
// therefore you need to attach an identifier like position to each interval
// and update the position with the interval
// i did all that....... and it still didn't clear all the time
// i wasted way too many hours that i could have used on 
// improving the looks of the project 
// but coding is always more fun than improving the looks
//
// Update: It's now WORKING! Although there is a caveat.
// if you allow the alien to die if it steps onto a laser then it's not fun
// trying to find the correct interval to clear
// if i have more time i will attempt it 
function superShoot() {
    if (!gGame.isOn || !gHero.isSuper || !gHero.superLaserCount) return

    const laserPos = { i: gHero.pos.i - 1, j: gHero.pos.j }

    const laser = setInterval(() => {
        // semi okay solution to stop super lasers after using blow up negs
        // if (gIsBlowingUp) clearInterval(laser)
        gHero.isShoot = true
        updateLaserPos(laser, {...laserPos})

        if (laserPos.i < 0) {
            clearInterval(laser)
            gHero.isShoot = false 
            return
        }

        if (isElAlien(laserPos) || isAlien(laserPos)) { 
            clearInterval(laser)
            handleAlienHit({...laserPos})
            gHero.isShoot = false
            return
        }
        
        if (isBunker(laserPos)) {
            clearInterval(laser)
            handleBunkerHit(laserPos)
            gHero.isShoot = false
        } else if (isElRock(laserPos) || isRock(laserPos)) {
            clearInterval(laser)
            clearRockInterval()
            gHero.isShoot = false
        } else if (isSpaceCandy(laserPos)) {
            clearInterval(laser)
            handleSpaceCandyHit()
            gHero.isShoot = false
        }

        gIntervalSuperLaser = laser
        gLaserPos = {...laserPos}
        blinkLaser({...laserPos})
        laserPos.i--
    }, getLaserSpeed())
    gLasers.push({ interval: laser, pos: {...laserPos}})
}

////////////////////////////////////////
// HERO SHIElD

function enableHeroShield() {
    if (!gGame.isOn || gHero.isShield || !gHero.shieldCount) return

    gHero.isShield = true
    gHero.shieldCount--
    renderShields()

    updateAndRenderCell(gHero.pos, getHeroGameObject())

    setTimeout(() => {
        gHero.isShield = false
        updateAndRenderCell(gHero.pos, GAME_OBJECTS.HERO)
    }, SHIELD_DURATION)
}

////////////////////////////////////////
// SUPER LASER

function enableSuperLaser() {
    if (!gGame.isOn || gHero.isSuper || !gHero.superLaserCount) return

    clearAllLaserIntervals()

    gHero.isSuper = true
    gHero.isShoot = false
    gHero.superLaserCount--
    renderSuperLasers()
    
    setTimeout(() => {
        clearAllLaserIntervals()

        gHero.isSuper = false
        gHero.isShoot = false // for safety
    }, SUPER_LASER_DURATION)
}

////////////////////////////////////////
// HERO LIVES

function handleHeroHit() {
    gHero.lives--
    renderLives()

    if (isHeroOutOfLives()) {
        gameOver(true)
        return
    }
    
    phaseOutHero()
}

function phaseOutHero() {
    // absolute shenanigans
    gGame.isOn = false
    renderCell(gHero.pos)
    const emojis = ['💥', '😵‍💫', '😢', '💥', '😱', '🤯', '🤕', '🌿', '💉', '💪', '🌈', '🌟', '🔋']

    for (let i = 0; i < emojis.length; i++) {
        const emoji = emojis[i]
        setTimeout((idx) => {
            renderCell(gHero.pos, emoji) 
        },i * 200,i)
    }

    setTimeout(() => {
        renderCell(gHero.pos, GAME_OBJECTS.HERO)
        gGame.isOn = true
    },emojis.length * 200 + 20)

    // renderCell(gHero.pos, GAME_OBJECTS.HERO)
    // setTimeout(() => renderCell(gHero.pos, GAME_OBJECTS.HERO), 2500)
}

function handlePlayerVictory() {
    clearAllIntervals()
    gGame.isOn = false
    alert('Victory! All aliens cleared!')
}
