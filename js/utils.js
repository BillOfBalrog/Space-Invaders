'use strict'

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// I don't know how to organize functions properly yet
// At least I tried something

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// GAME STATE MANAGEMENT

function handleOnStartGame(elBtn = null) {
    if (!elBtn) elBtn = getEl('.start-btn')
    if (elBtn.classList.contains('disabled')) return
    
    elBtn.classList.add('disabled')
    startGame()
}

function handleOnRestartGame() {
    // reserved for future
    init()
}

function enableStartButton() {
    getEl('.start-btn').classList.remove('disabled')
}

function resetAliensConfig() {
    gAliensDirection = 1
    // gIsAlienFreeze = false
    gIsShiftingAliens = false
}

function setDifficultyLevel(difficulty) {
    gGame.difficulty = difficulty
    init()
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// RENDERING AND USER INTERFACE UPDATES

function renderScore() {
    getEl('.game-count').innerText = gGame.alienCount
}


function renderGameStats() {
    renderScore()
    renderLives()
    renderAliensCount()
    renderShields() 
    renderSuperLasers() 
}

function renderSuperLasers() {
    document.querySelector('.hero-super-lasers').innerText = gHero.superLaserCount
}

function renderScore() {
    document.querySelector('.game-score').innerText = gGame.score
}

function renderLives() {
    document.querySelector('.hero-lives').innerText = gHero.lives
}

function renderAliensCount() {
    document.querySelector('.aliens-count').innerText = gGame.alienCount
}

function renderShields() {
    document.querySelector('.hero-shields').innerText = gHero.shieldCount
}

function renderCell(pos, img) {
    getElCell(pos).innerHTML = img || ''
}

function renderFreeze() {
    const elFreezeSpan =  getEl('.freeze-btn span')
    elFreezeSpan.innerText = gIsAlienFreeze ? 'On' : 'Off'
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// INTERVAL MANAGEMENT

function clearAllTimeouts() {
    if (gTimeoutBlink) clearTimeout(gTimeoutBlink)
}

function clearAllIntervals() {
    if (gIntervalAliens) clearInterval(gIntervalAliens)
    if (gIntervalRock) clearInterval(gIntervalRock)
    if (gIntervalAliensShoot) clearInterval(gIntervalAliensShoot)
    if (gIntervalLaser) clearInterval(gIntervalLaser)
    if (gIntervalSpaceCandy) clearInterval(gIntervalSpaceCandy)
}

function clearAllIntervalsAndTimeouts() {
    clearAllIntervals()
    clearAllTimeouts()
}

function startSpaceCandyInterval() {
    gIntervalSpaceCandy = setInterval(addSpaceCandy, SPACE_CANDY_INTERVAL_FREQ)
}

function startAliensThrowingRocksInterval() {
    // Only throw rocks on normal and higher difficulties
    if (gGame.difficulty === 'easy') return

    gIntervalAliensShoot = setInterval(throwRock, INTERVAL_ROCK_FREQ)
}

function clearRockInterval() {
    // set null so can enter throwRock func again
    clearInterval(gIntervalRock)
    gIntervalRock = null
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// COLLISIONS AND POSITIONS CHECK

function isBoardGround(row) {
    return row === BOARD_SIZE - 1
}

function isBoardHeroGround(row) {
    return row === BOARD_SIZE - 2
}

function isAlien(pos) {
    // Not a good way to write it but I kept it simple
    // Since I'll probably change things in the game
    const { gameObject } = gBoard[pos.i][pos.j]
    return  gameObject === GAME_OBJECTS.ALIEN1 ||
            gameObject === GAME_OBJECTS.ALIEN2 ||
            gameObject === GAME_OBJECTS.ALIEN3 ||
            gameObject === GAME_OBJECTS.ALIEN4 ||
            gameObject === GAME_OBJECTS.ALIEN5 
}

function isEmpty(pos) {
    return gBoard[pos.i][pos.j].gameObject === null
}

function isLaser(pos) {
    return gBoard[pos.i][pos.j].gameObject === GAME_OBJECTS.LASER ||
           gBoard[pos.i][pos.j].gameObject === GAME_OBJECTS.LASER_SUPER
}

function isHero(pos) {
    const { gameObject } = gBoard[pos.i][pos.j]
    return gameObject === GAME_OBJECTS.HERO || 
           gameObject === GAME_OBJECTS.HERO_SHIELD
}

function isRock(pos) {
    return gBoard[pos.i][pos.j].gameObject === GAME_OBJECTS.ROCK
}

function isElLaser(pos) {
    const elCell = getElCell(pos)
    const cellContent = elCell.innerText
    return cellContent === GAME_OBJECTS.LASER || 
           cellContent === GAME_OBJECTS.LASER_SUPER
}

function isElRock(pos) {
    const elCell = getElCell(pos)
    const cellContent = elCell.innerText
    return cellContent === GAME_OBJECTS.ROCK
}

function isElAlien(pos) {
    const elCell = getElCell(pos)
    const cellContent = elCell.innerText
    return cellContent === GAME_OBJECTS.ALIEN1 ||
           cellContent === GAME_OBJECTS.ALIEN2 ||
           cellContent === GAME_OBJECTS.ALIEN3 ||
           cellContent === GAME_OBJECTS.ALIEN4 ||
           cellContent === GAME_OBJECTS.ALIEN5 
}

function isBunker(pos) {
    return gBoard[pos.i][pos.j].type === GAME_TYPES.BUNKER
}

function isSpaceCandy(pos) {
    return gBoard[pos.i][pos.j].gameObject === GAME_OBJECTS.CANDY
}

function isAliensShiftingRight() {
    return gAliensDirection === 1
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// PLAYER INTERACTION HANDLERS

function toggleSound() {
    const soundSpans = document.querySelectorAll('.sound-btn span')
    for (let i = 0; i < soundSpans.length; i++) {
        soundSpans[i].classList.toggle('hidden')
    }

    gGame.isAudioOn = !gGame.isAudioOn
}

function openInstructionsModal() {
          alert(`Modal under construction
                
                In the mean time:
                R - Reset (first reset the game)
                Enter - Start Game (only after a reset)
                F - Toggle Aliens freeze (don't cheat!)
                M - Toggle Sound (haven't added yet)
                
                Controls:
                Right Arrow - Step right
                Left Arrow - Step left
                Space: Shoot
                Z: Activate Shield
                X: Activate Super Laser
                N: Blow up Aliens nearby
                The player teleports from one end to the other

                Extras:
                Bunkers - Toggle Bunkers on board
                Theme - Toggle backgrounds`)
}

function handleOnAlienFreeze(elBtn = null) {
    if (!elBtn) {
        elBtn = document.querySelector('.freeze-btn')
    }
    const elBtnSpan = elBtn.querySelector('span')

    elBtn.blur()

    if (gIsAlienFreeze) {
        elBtnSpan.innerText = 'Off'
        gIsAlienFreeze = false
    } else {
        elBtnSpan.innerText = 'On'
        gIsAlienFreeze = true
    }
}

function toggleBunkers(elBtn =  null) {
    if (!elBtn) elBtn = getEl('.bunkers-btn')
    elBtn.classList.toggle('inactive-bunker')
    gGame.isBunkers = !gGame.isBunkers
    init()
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// GAME MECHANICS AND LOGIC

function setLaserSpeed() {
    gLaserSpeed = gHero.isSuper ? gLaserSpeeds.super : gLaserSpeeds.normal
}

function getLaserSpeed() {
    return gHero.isSuper ? gLaserSpeeds.super : gLaserSpeeds.normal
}

function getLaserGameObject() {
    return gHero.isSuper ? GAME_OBJECTS.LASER_SUPER : GAME_OBJECTS.LASER
    
}

function isHeroOutOfLives() {
    return gHero.lives === 0
}

function getLevelOptions() {
    return gDifficultyLevels[gGame.difficulty]
}

function getGameObject(pos) {
    return gBoard[pos.i][pos.j].gameObject
}

function getHeroGameObject() {
    return gHero.isShield ? GAME_OBJECTS.HERO_SHIELD : GAME_OBJECTS.HERO
}

function getHeroNextPosColumn(dir) {
    const nextJ = gHero.pos.j + dir
    if (nextJ === BOARD_SIZE) return 0
    else if (nextJ === -1) return BOARD_SIZE - 1
    return nextJ
}

function isAllAliensCleared() {
    return gGame.alienCount === 0
}

function createBunkers(board) {
    const bunker1 = [
        { i: 10, j: 1 }, { i: 10, j: 2 }, { i: 10, j: 3 },
        { i: 11, j: 1 }, { i: 11, j: 2 }, { i: 11, j: 3 }
    ]
    
    const bunker2 = [
        { i: 10, j: 6 }, { i: 10, j: 7 }, { i: 10, j: 8 },
        { i: 11, j: 6 }, { i: 11, j: 7 }, { i: 11, j: 8 }
    ]
    
    const bunker3 = [
        { i: 10, j: 11 }, { i: 10, j: 12 }, { i: 10, j: 13 },
        { i: 11, j: 11 }, { i: 11, j: 12 }, { i: 11, j: 13 }
    ]

    const bunkers = [...bunker1, ...bunker2, ...bunker3]

    for (let k = 0; k < bunkers.length; k++) {
        const { i, j } = bunkers[k]
        board[i][j].type = GAME_TYPES.BUNKER
    }
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// UTILITIES AND HELPERS

function getEl(elName) {
    return document.querySelector(`${elName}`)
}

function getRandomInt(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomIntInclusive(min, max) {
    if (max === undefined) {
        max = min
        min = 0
    }
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function deepCopyBoard(board) {
    return board.map(row => row.map(cell => ({ ...cell })))
}

function getClassName(i, j) {
    return `cell cell-${i}-${j} ${gBoard[i][j].type}`
}

function playAudio(audioFile) {
    if (!gGame.isAudioOn) return;

    const audio = new Audio(`sound/${audioFile}.mp3`)
    
    audio.play()
}

function getElCell(pos) {
    return document.querySelector(`[data-i='${pos.i}'][data-j='${pos.j}']`)
}

function getRndEmptyCandyPos() {
    let emptyCellPoses = []
    for (let col = 0; col < BOARD_SIZE; col++) {
        const pos = {i: 0, j: col}
        if (isEmpty({i: 0, j: col})) {
            emptyCellPoses.push(pos)
        }
    }
    if (!emptyCellPoses) return null
    return emptyCellPoses[getRandomInt(emptyCellPoses.length)]
}

function getAlienPosToThrowRock() {
    // find the most bottom aliens poses of every column
    // that way we don't have to worry about aliens throwing rocks on aliens
    const bottomOfColumnAliens = []

    // using transverse columns 
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = gAliensBottomRowIdx; row >= gAliensTopRowIdx; row--) {
            const pos = {i: row, j: col}
            if (isAlien(pos)) {
                bottomOfColumnAliens.push(pos)
                break
            }
        }
    }
    
    if (!bottomOfColumnAliens.length) return null
    return bottomOfColumnAliens[getRandomInt(bottomOfColumnAliens.length)]
}

///////////////////////////////
// Super laser stuff 
// To clear the correct interval 
// Especially after using Blow Up Neighbours, the interval needs to be cleared
// When Alien collides with laser or Rock collides with Laser
// Since you cannot just clear the global interval
// The correct interval needs to be found
//
// Also clear inactive intervals

function updateLaserPos(interval, newPos) {
    for (let i = 0; i < gLasers.length; i++) {
        if (gLasers[i].interval === interval) {
            gLasers[i].pos = newPos
            break
        }
    }
}

function getIntervalLaser(laserPos) {
    for (let i = 0; i < gLasers.length; i++) {
        const { interval, pos } = gIntervalLasers[i]
        if (pos.i === laserPos.i && pos.j === laserPos.j) {
            return interval
        }   
    }
}

function cleanUpLaserIntervals() {
    const activeIntervals = []
    for (let i = 0; i < gLasers.length; i++) {
        const interval = gLasers[i]
        if (interval) {
            activeIntervals.push(interval)
        }
    }
    gLasers = activeIntervals
}

function clearAllLaserIntervals() {
    for (let i = 0; i < gLasers.length; i++) {
        clearInterval(gLasers[i])
    }
    gLasers = []
}

function resetIntervalLasers() {
    clearAllLaserIntervals()
    gLasers = []
}
//////////////////////////////


////////////////////////////////////////////////////
////////////////////////////////////////////////////
// VARIOUS, NEW, NOT ORGANIZED YET

function getNegs(pos) {
    var neighbourPositions = []
    for (let i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= BOARD_SIZE) continue

        for (let j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i === pos.i && j === pos.j) continue
            if (j < 0 || j >= BOARD_SIZE) continue
            
            neighbourPositions.push({ i, j })
        } 
    }
    if (!neighbourPositions.length) return null
    return neighbourPositions
} 

function isElBlowUpImg(pos) {
    const elCellInnerHtml = getElCell(pos).innerHTML
    return elCellInnerHtml === gameImages.explosion ||
           elCellInnerHtml === gameImages.flames
}

function addEffectToAlienHit(pos) {
    const elAlien = getElCell(pos)
    elAlien.classList.add('hit') 
    setTimeout(() => elAlien.classList.remove('hit'), 500)
}