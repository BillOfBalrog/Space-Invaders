'use strict'

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
let gIsBlowingUp // cool down for blow up negs function

const gLaserSpeeds = {
    normal: 80,
    super: 60
}

function createHero(board) {
    gHero = {
        pos: {
            i: ROW_SIZE - 2, 
            j: Math.floor(COL_SIZE / 2)
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
        case 'KeyT':
            toggleTheme()
            break;
        case 'KeyQ':
            toggleBorders()
            break;
        case 'KeyI':
            toggleInstructions()
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
            shoot()
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

/////////////////////////////////////////////////////
//  I came back to this function 20 times and wasted 
// over a day on it instead of doing CSS for the project
// I tweaked and tuned it so many times I won't be surprised anymore
// if I set to not work properly at all  
//
// The reason for both DOM and Model check is simply because 
// all these intervals together can be buggy and 
// as programmers say 
// "it doesn't work i don't understand why", "it works i don't understand why"
// perhaps over the week i will come back to this and try and
// use Model only without DOM at all
//
// My biggest dillema here was whether to still let the laser blink after it hit something
// or return right away
// because if you blink laser it's dangerous because a ghost can collide with it but that laser
// is essentially already used up and should be gone
// perhaps in the future what i will do is when a laser hits something,
// instead of blinking with updating the model, it will only blink with a render
//
// *** Players can 'cheat' if hey hold down the space key
// Needs further checking into or setting a small delay after a shot
function shoot() {
    if (!gGame.isOn || gHero.isShoot && !gHero.isSuper) return
    
    gLaserPos = null
    
    const laserPos = { i: gHero.pos.i - 1, j: gHero.pos.j }
    const laser = setInterval(() => {
        gHero.isShoot = true 
        if (laserPos.i < 0) {
            clearInterval(laser)
            onLaserOutOfRange()
            return
        }

        if (checkAndHandleLaserHits(laser,{...laserPos})) return
   
        gIntervalLaser = laser
        gLaserPos = {...laserPos}
        blinkLaser({...laserPos})
        laserPos.i--
    }, getLaserSpeed())
    if (gHero.isSuper) gLasers.push(laser)
}

function checkAndHandleLaserHits(laser, laserPos) {
        if (isElLaser(laserPos) || isLaser(laserPos)) {
            clearInterval(laser)
            onLaserHitLaser()
            return true
        }

        if (isElAlien(laserPos) || isAlien(laserPos)) {
            clearInterval(laser)
            onLaserHitAlien(laserPos)
            return true
        }

        if (isBunker(laserPos)) {
            clearInterval(laser)
            onLaserHitBunker(laserPos)
        } else if (isElRock(laserPos) || isRock(laserPos)) {
            clearInterval(laser)
            onLaserHitRock()
        } else if (isSpaceCandy(laserPos)) {
            clearInterval(laser)
            onLaserHitSpaceCandy()
        }
}

// I want to add in the future a blink laser that only renders without updating the model
// this sounds like a great idea to still display the object after it hit something for a while more
// but not update the model of the game
// renders a LASER at specific cell for short time and removes it
function blinkLaser(pos) {
    if (!isEmpty(pos) && !isSpaceCandy(pos)) {
        console.log('Trying to place laser an occupied cell', gBoard[pos.i][pos.j].gameObject)
        return
    }

    updateAndRenderCell(pos, getLaserGameObject())
    
    gTimeoutBlink = setTimeout(() => {
        if (isElBlowUpImg(pos)) updateCell(pos)
        else if (isLaser(pos)) updateAndRenderCell(pos)
    }, getLaserSpeed())
}

function onLaserHitAlien(pos) {
    // comments about gIsLaserHit are at the top 
    // where it's declared
    if (gIsLaserHit) {
        gHero.isShoot = false
        return
    }
    gHero.isSuper ?  playAudio(gSounds.laserSuper) : playAudio(gSounds.laser)
    gIsLaserHit = true
    console.log('Laser hit an alien')
    handleAlienHit(pos)
    gHero.isShoot = false
    gIsLaserHit = false
}

function onLaserHitBunker(pos) {
    console.log('Laser hit a bunker')
    handleBunkerHit(pos)
    playAudio(gSounds.bunkerHit)
    gHero.isShoot = false
}

function onLaserHitLaser() {
    console.log('Laser colliding with another laser')
    gHero.isShoot = false
}

function onLaserHitRock() {
    console.log('Laser hit rock')
    clearRockInterval()
    playAudio(gSounds.rockDestroyed)
    gHero.isShoot = false
}

function onLaserHitSpaceCandy() {
    console.log('Laser hit a space candy')
    handleSpaceCandyHit()
    playAudio(gSounds.candy)
    gHero.isShoot = false
}

function onLaserOutOfRange() {
    gHero.isShoot = false
}

//////////////////////////////////////////////////////
// For all these helper functions related to shoot
// the reason I'm not creating a clear interval and enable shooting again function
// is because I'd like to clear the interval immediately, perform the actions needed
// and only then enable shooting again
 
function blowUpNeighbours() {
    if (!gGame.isOn || !gLaserPos || !gHero.isShoot || gIsBlowingUp) return

    clearInterval(gIntervalLaser)
    gIsBlowingUp = true // blow up cooldown
    setTimeout(() => {  
        gIsBlowingUp = false
    },100)

    if (isElAlien(gLaserPos) || isAlien(gLaserPos)) {
        console.log('Note: Should not be happening')
    }

    const negs = getNegs(gLaserPos)
    for (let i = 0; i < negs.length; i++) {
        handleBlowUpNeighbour(negs[i])
    }
    blowUpNeighbour(gLaserPos, true)
    playAudio(gSounds.explosion)
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

////////////////////////////////////////
// HERO SHIElD

function enableHeroShield() {
    if (!gGame.isOn || gHero.isShield || !gHero.shieldCount) return

    gHero.isShield = true
    gHero.shieldCount--
    renderShields()
    updateAndRenderCell(gHero.pos, getHeroGameObject())
    playAudio(gSounds.shieldOn)

    setTimeout(() => {
		if (!gGame.isOn) return
		
        gHero.isShield = false
        updateAndRenderCell(gHero.pos, GAME_OBJECTS.HERO)
        playAudio(gSounds.shieldOff)
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
    playAudio(gSounds.superOn)
    renderSuperLasers()
    
    
    setTimeout(() => {
        // clearInterval(gIntervalLaser)
        gHero.isSuper = false
        gHero.isShoot = false
        clearAllLaserIntervals()
        playAudio(gSounds.superOff)
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

    const msg1 = 'Victory!'
    const msg2 = 'All aliens cleared!\n' + 'Make sure to try all difficulties!'
    handleGameModal(msg1, msg2)
    playAudio(gSounds.heroVictory)
}

