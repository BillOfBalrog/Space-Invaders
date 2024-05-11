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

function renderGameStats() {
    renderScore()
    renderLives()
    renderAliensCount()
    renderShields() 
    renderSuperLasers() 
}

function renderAliensCount() {
    document.querySelector('.aliens-count').innerText = gGame.alienCount
}

function renderScore() {
    getEl('.game-count').innerText = gGame.alienCount
}

function renderScore() {
    document.querySelector('.game-score').innerText = gGame.score
}

function renderLives() {
    renderHeroStat('lives')

    // const elLives = document.querySelector('.hero-lives')
    // let strHTML = ''
    // for (let i = 0; i < gHero.lives; i++) {
    //     strHTML += '❤️'
    // }
    // if (gHero.lives < 3) {
    //     strHTML += `<span class="inactive-img">`
    //     for (let i = gHero.lives; i < 3; i++) {
    //         strHTML += '❤️'
    //     }
    //     strHTML += `</span>`
    // }
    // elLives.innerHTML = strHTML
}

function renderSuperLasers() {
    renderHeroStat('superLaserCount')
    // document.querySelector('.hero-super-lasers').innerText = gHero.superLaserCount
}

function renderShields() {
    renderHeroStat('shieldCount')
    // getEl('.hero-shields').innerText = gHero.shieldCount
}

function renderHeroStat(selector) { 
    const { elSelector, img, imgInactive, count } = getHeroStat(selector)
    if (!elSelector) return

    let strHTML = ''
    for (let i = 0; i < count; i++) {
        strHTML += img
    }
    if (count < 3) {
        strHTML += `<span class="inactive-img">`
        for (let i = count; i < 3; i++) {
            strHTML += imgInactive ? imgInactive : img
        }
        strHTML += `</span>`
    }
    elSelector.innerHTML = strHTML
}

function getHeroStat(selector) {
    let elSelector
    let img
    let imgInactive = null
    const count = gHero[selector] 

    switch (selector) {
        case 'lives':
            elSelector = getEl('.hero-lives')
            img = gameImages.heart
            imgInactive = gameImages.heartHit
            break
        case 'shieldCount':
            elSelector = getEl('.hero-shields')
            img = gameImages.shield
            break
        case 'superLaserCount':
            elSelector = getEl('.hero-super-lasers')
            img = gameImages.laser
            break
        default:
            return {} 
    }

    return { elSelector, img, imgInactive, count }
}

function renderCell(pos, img) {
    getElCell(pos).innerHTML = img || ''
}

function renderFreeze() {
    const elFreeze =  getEl('.freeze-btn')
    if (gIsAlienFreeze) elFreeze.classList.remove('inactive')
    else  elFreeze.classList.add('inactive')
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
    gIntervalRock = null
    clearAllLaserIntervals()
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
    return row === ROW_SIZE - 1
}

function isBoardHeroGround(row) {
    return row === ROW_SIZE - 2
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
    // const elCell = getElCell(pos)
    // const cellContent = elCell.innerText
    // return cellContent === GAME_OBJECTS.ALIEN1 ||
    //        cellContent === GAME_OBJECTS.ALIEN2 ||
    //        cellContent === GAME_OBJECTS.ALIEN3 ||
    //        cellContent === GAME_OBJECTS.ALIEN4 ||
    //        cellContent === GAME_OBJECTS.ALIEN5 

    const elCellInnerHtml = getElCell(pos).innerHTML
    return elCellInnerHtml.includes('alien')
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
    // eventually didn't add sound because it's too annoying hear laser effect non stop

    const soundSpans = document.querySelectorAll('.sound-btn span')
    for (let i = 0; i < soundSpans.length; i++) {
        soundSpans[i].classList.toggle('hidden')
    }

    gGame.isAudioOn = !gGame.isAudioOn
}

function openInstructionsModal() {
    getEl('.instructions-modal').classList.toggle('hidden')


    // const elModal = getEl('.instructions-modal')
    const elMsg = getEl('.instructions-message')
    elMsg.textContent = msg
    toggleInstructions()


        //   alert(`Modal under construction
                
        //         In the mean time:
        //         R - Reset (first reset the game)
        //         Enter - Start Game (only after a reset)
        //         F - Toggle Aliens freeze (don't cheat!)
        //         M - Toggle Sound (haven't added yet)
                
        //         Controls:
        //         Right Arrow - Step right
        //         Left Arrow - Step left
        //         Space: Shoot
        //         Z: Activate Shield
        //         X: Activate Super Laser
        //         N: Blow up Aliens nearby
        //         The player teleports from one end to the other

        //         Extras:
        //         Bunkers - Toggle Bunkers on board
        //         Theme - Toggle backgrounds`)
}

function handleOnAlienFreeze(elBtn = null) {
    if (!elBtn) {
        elBtn = document.querySelector('.freeze-btn')
    }
    // const elBtnSpan = elBtn.querySelector('span')
    elBtn.blur()

    if (gIsAlienFreeze) {
        // elBtnSpan.innerText = 'Off'
        gIsAlienFreeze = false
        elBtn.classList.add('inactive')
    } else {
        // elBtnSpan.innerText = 'On'
        gIsAlienFreeze = true
        elBtn.classList.remove('inactive')
    }
}

function toggleBunkers(elBtn =  null) {
    if (!elBtn) elBtn = getEl('.bunkers-btn')
    elBtn.classList.toggle('inactive')
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
    if (nextJ === COL_SIZE) return 0
    else if (nextJ === -1) return COL_SIZE - 1
    return nextJ
}

function isAllAliensCleared() {
    return gGame.alienCount === 0
}

function createBunkers(board) {
    const rowIdx1 = ROW_SIZE - 4
    const rowIdx2 = ROW_SIZE - 3

    const bunker1 = [
        { i: rowIdx1, j: 1 }, { i: rowIdx1, j: 2 }, { i: rowIdx1, j: 3 },
        { i: rowIdx2, j: 1 }, { i: rowIdx2, j: 3 }
    ]
    
    const bunker2 = [
        { i: rowIdx1, j: 6 }, { i: rowIdx1, j: 7 }, { i: rowIdx1, j: 8 },
        { i: rowIdx2, j: 6 }, { i: rowIdx2, j: 8 }
    ]
    
    const bunker3 = [
        { i: rowIdx1, j: 11 }, { i: rowIdx1, j: 12 }, { i: rowIdx1, j: 13 },
        { i: rowIdx2, j: 11 }, { i: rowIdx2, j: 13 }
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

function getType(pos) {
    return gBoard[pos.i][pos.j].type
}

function getClassName(i, j) {
    let strClass = `cell cell-${i}-${j}`
    if (isBunker({i, j})) strClass += ` ${GAME_TYPES.BUNKER}${gTheme}`
    if (gGame.isBorders) strClass += ` borders ${gBoard[i][j].type}`
  
    return strClass

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
    for (let col = 0; col < COL_SIZE; col++) {
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
    for (let col = 0; col < COL_SIZE; col++) {
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
        if (i < 0 || i >= ROW_SIZE) continue

        for (let j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i === pos.i && j === pos.j) continue
            if (j < 0 || j >= COL_SIZE) continue
            
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

function toggleTheme() {
    // Need to refactor for a better implementation
    gTheme++
    if (gTheme > 3) gTheme = 1
    setBackground(gTheme)
    
    let count = 1
    for (const [key, val] of Object.entries(GAME_OBJECTS)) {
        if (key.startsWith('ALIEN')) {
            console.log('hola')
            const imgId = ((gTheme - 1) * 5) + count
            GAME_OBJECTS[key] = `<img src="img/alien${imgId}.png">`
            count++
        }
    }
    init()
}

function setBackground(imgId){
    document.body.style.backgroundImage = `url('img/bg${imgId}.png')`
}

function toggleModal() {
    const elModal = getEl('.win-modal-overlay')
    elModal.classList.toggle('hidden')
}

function toggleInstructions() {
    const elModal = getEl('.instructions-modal')
    elModal.classList.toggle('hidden')
}

function getAllElements(elName) {
    return document.querySelectorAll(elName)
}

function toggleBorders(elBtn = null) {
    if (!elBtn) elBtn = getEl('.borders-btn')
    gGame.isBorders = !gGame.isBorders
    elBtn.classList.toggle('inactive')

    for (let i = 0; i < ROW_SIZE; i++) {
        for (let j = 0; j < COL_SIZE; j++) {
            const elCell = getElCell({i, j})
            elCell.classList.toggle('borders')

            if (i === ROW_SIZE - 2) {
                elCell.classList.toggle('HERO_GROUND')
            } else if (i === ROW_SIZE - 1) {
                elCell.classList.toggle('GROUND')
            }
        }
    }
}
