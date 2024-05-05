'use strict'

const LASER_SPEED = 300
var gLaserPos
var gHero = {
    pos: {
        i:12, 
        j: 6
    }, 
    isShoot: false
}
var gIntervalShoot
var gBlinkTimeout

// creates the hero and place it on board
function createHero(board) {
    gHero.pos = { i: 12, j: 6 }
    gHero.isShoot = false
    board[gHero.pos.i][gHero.pos.j].gameObject = HERO
}

// Handle game keys
function onKeyDown(ev) {
    if (!gGame.isOn) return

    switch (ev.keyCode) {
        case 37:
            moveHero(-1)
            break
        case 39:
            moveHero(1)
            break
        case 78:
            blowUpNegs()
            break
        case 32:
            shoot()
            break
    }
}

// Move the hero right (1) or left (-1)
function moveHero(dir) {    
    updateCell(gHero.pos, EMPTY) 
    setHeroColumnPosition(dir)
    
    if (gBoard[gHero.pos.i][gHero.pos.j].gameObject === CANDY) {
        enableSpaceCandy()
    }
    
    updateCell(gHero.pos, HERO)
}

function setHeroColumnPosition(dir) {
    var newPosJ = gHero.pos.j + dir

    if (newPosJ >= BOARD_SIZE) newPosJ =  0
    else if (newPosJ < 0) newPosJ =  BOARD_SIZE - 1
    
    gHero.pos.j = newPosJ
}

function shoot() {
    if (gHero.isShoot) return

    var laserPos = { i: gHero.pos.i - 1, j: gHero.pos.j }
    
    gIntervalShoot = setInterval(() => {
        const elCellInner = getElCell({...laserPos}).innerHTML
        if (isElAlien(elCellInner)) {
            handleShootAlien({...laserPos})
            return
        } else if (laserPos.i <= 0) {
            handleOutOfRangeShot()
            return
        }
        
        gLaserPos = {...laserPos}
        blinkLaser({ ...laserPos})
        laserPos.i--
    }, LASER_SPEED)
    gHero.isShoot = true
    console.log('hello')
}

function blinkLaser(pos) {
    var elCellInner = getElCell({...pos}).innerHTML
    if (!isElAlien(elCellInner)) renderCell(pos, LASER)

    gBlinkTimeout = setTimeout(() => {
        var elCellInner = getElCell({...pos}).innerHTML
        if (!isElAlien(elCellInner)) renderCell(pos, EMPTY)
    },LASER_SPEED - 20)
}

function handleShootAlien(pos) {
    // gAlienCount--
    pos = updateAlienShotPos(pos)
    updateAliensCount(-1)
    gHero.isShoot = false

    clearInterval(gBlinkTimeout)
    clearInterval(gIntervalShoot)
    updateCell(pos, EMPTY)
    
    if (gGame.alienCount === 0) alert('yoohoo')
}

function updateAlienShotPos(pos) {
    for (var i = gAliensBottomRowIdx; i > pos.i ; i--) {
        const newPos = { i, j: pos.j } 
        if (isAlien(newPos)) return newPos
    }
    return pos
}

function handleOutOfRangeShot() {
    clearInterval(gIntervalShoot)
    gHero.isShoot = false
}

// function blowUpNegs() {
//     if (!gHero.isShoot) return

//     clearInterval(gShootInterval)
//     clearTimeout(gBlinkTimeout)
    
//     renderCellBlowup({...gLaserPos}, EXPLOSION1)

//     const negs = getAlienNegs(gLaserPos.i, gLaserPos.j)
//     for (var i = 0; i < negs.length; i++) {
//         const currPos = negs[i]
//         gBoard[currPos.i][currPos.j].gameObject = EMPTY
//         updateAliensCount(-1)
//         renderCellBlowup(negs[i], EXPLOSION2)
//     }
//     gHero.isShoot = false
// }

// function getAlienNegs(cellI, cellJ) {
//     const neighbourAlienPoses = []
//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= BOARD_SIZE) continue
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j >= BOARD_SIZE) continue
//             if (i === cellI && j === cellJ) continue    

//             // const cell = gBoard[i][j]
//             if (isAlien({i, j})) neighbourAlienPoses.push({i, j})
//         }
//     }
//     if (!neighbourAlienPoses) return null
//     return neighbourAlienPoses
// }

// function renderCellBlowup(pos, explosion) {
//     const elCell = getElCell(pos)
//     elCell.innerHTML = explosion
//     setTimeout(() => {
//         if (isElAlien(elCell.innerHTML)) return
//         elCell.innerHTML = EMPTY
//     },4000)
// }


function blowUpNegs() {
    if (!gHero.isShoot || !gLaserPos) return
    clearInterval(gIntervalShoot)
    clearTimeout(gBlinkTimeout)
    renderCellBlowup({...gLaserPos}, EXPLOSION1)

    const negs = getAlienNegs(gLaserPos.i, gLaserPos.j)
    for (var i = 0; i < negs.length; i++) {
        const currPos = negs[i]
        gBoard[currPos.i][currPos.j].gameObject = EMPTY
        updateAliensCount(-1)
        renderCellBlowup(negs[i], EXPLOSION2)
    }
    gLaserPos = null
    gHero.isShoot = false
}

function getAlienNegs(cellI, cellJ) {
    const neighbourAlienPoses = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= BOARD_SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= BOARD_SIZE) continue
            if (i === cellI && j === cellJ) continue    

            const elCellInner = getElCell({i, j}).innerHTML
            if (isElAlien(elCellInner)) neighbourAlienPoses.push({i, j})
        }
    }
    if (!neighbourAlienPoses) return null
    return neighbourAlienPoses
}

function renderCellBlowup(pos, explosion) {
    const elCell = getElCell(pos)
    elCell.innerHTML = explosion
    setTimeout(() => {
        if (isElAlien(elCell.innerHTML)) return
        elCell.innerHTML = EMPTY
    },4000)
}















// Sets an interval for shutting (blinking) the laser up towards aliens
// function shoot() {
//     if (gHero.isShoot) return
//     gHero.isShoot = true
//     const laserPos = { i: gHero.pos.i - 1, j: gHero.pos.j }

//     // if (gBoard[laserPos.i - 1][laserPos.j].gameObject !== EMPTY) {
//     //     console.log('next cell laser shot is not empty')
//     //     return
//     // } else laserPos.i--

//     gIntervalShoot = setInterval(() => {
//         // const cell = gBoard[laserPos.i][laserPos.j].gameObject
//         // console.log('laser:',laserPos.i,laserPos.j, cell)
//         const i = laserPos.i
//         const j = laserPos.j

//         if (isAlien(laserPos)) {

//             // console.log('hola')
//             clearInterval(gIntervalShoot)
//             updateCell({...laserPos})
//             updateAliensCount(-1)
//             updateScore(10)
//             gHero.isShoot = false
//             return
//             // return
//         }

//         if (laserPos.i < gAliensBottomRowIdx) {
//             if (gBoard[laserPos.i + 1][laserPos.j].gameObject === ALIEN)  {
//                 gHero.isShoot = false
//                 clearInterval(gIntervalShoot)
//                 return
//             }
//         }

//         blinkLaser({ ...laserPos})

//         laserPos.i--
//         if (laserPos.i < 0) {
//             clearInterval(gIntervalShoot)
//             gHero.isShoot = false
//             return
//         }
//     },LASER_SPEED)
// }

// renders a LASER at specific cell for short time and removes it
// function blinkLaser(pos) {
//     const i = {...pos}
//     const j = {...pos}
//     if (isAlien(i)) return 
//     renderCell(i, LASER)

//     setTimeout(() => {
//         if (isAlien(i)) return 
//         renderCell(j, EMPTY)
//     },LASER_SPEED - 30)
// }
