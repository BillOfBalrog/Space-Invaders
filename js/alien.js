'use strict'

const ALIEN_SPEED = 1000
const ROCK_SPEED = 300
var gIntervalAliens
var gIntervalAliensShoot
var gIntervalThrowRock
var gTimeoutBlinkRock
var gAliensDirection = 1
// const ALIENS = [
//     '👽',
//     '🤖',
//     '👾',
//     '🛸'
// ]
const ALIENS = [
    '👽',
    '🤖',
    '👾',
    '🛸'
]

// The following two variables represent the part of the matrix (some rows)
// that we should shift (left, right, and bottom)
// We need to update those when:
// (1) shifting down and (2) last alien was cleared from row
var gAliensTopRowIdx
var gAliensBottomRowIdx
var gIsAlienFreeze = false

function createAliens(board) {
    gGame.alienCount = 0
    gAliensTopRowIdx = 0
    gAliensBottomRowIdx = ALIEN_ROW_COUNT - 1
    const offsetJ = (BOARD_SIZE - ALIEN_ROW_LENGTH) / 2

    for (var i = 0; i < ALIEN_ROW_COUNT; i++) {
        for (var j = offsetJ; j < BOARD_SIZE - offsetJ; j++) {
            board[i][j].gameObject = ALIENS[i]
            gGame.alienCount ++
        }
    }
}

function handleAlienHit(pos) {
    updateAliensCount(-1)
    if (gGame.alienCount === 0) alert('yoohoo')
}

function shiftBoardRight() {
    const newBoard = deepCopyBoard(gBoard)
    for (var i = gAliensBottomRowIdx; i >= gAliensTopRowIdx; i--) {
        for (var j = BOARD_SIZE - 1; j > 0; j--) {
            if (isAlien({ i, j: j - 1 })) {
                newBoard[i][j].gameObject = newBoard[i][j - 1].gameObject
                newBoard[i][j - 1].gameObject = EMPTY
            }
        }
    }
    return newBoard
    // renderBoard(gBoard)
}

function shiftBoardLeft() {
    const newBoard = deepCopyBoard(gBoard)
    for (var i = gAliensBottomRowIdx; i >= gAliensTopRowIdx; i--) {
        for (var j = 0; j < BOARD_SIZE - 1; j++) {
            if (isAlien({ i, j: j + 1 })) {
                newBoard[i][j].gameObject = newBoard[i][j + 1].gameObject
                newBoard[i][j + 1].gameObject = EMPTY
            }
        }
    }
    return newBoard
    // renderBoard(gBoard)
}

function shiftBoardDown() {
    const newBoard = deepCopyBoard(gBoard)
    for (var i = gAliensBottomRowIdx + 1; i >= gAliensTopRowIdx + 1; i--) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            if (isAlien({ i: i - 1, j })) {
                newBoard[i][j].gameObject = newBoard[i - 1][j].gameObject
                newBoard[i - 1][j].gameObject = EMPTY
            }
        }
    }
    gAliensBottomRowIdx++
    gAliensTopRowIdx++
    return newBoard
    renderBoard(gBoard)
}
`blah.innerHtml =  <asd`
// runs the interval for moving aliens side to side and down
// it re-renders the board every time
// when the aliens are reaching the hero row - interval stops
function moveAliens() {
    if (gIsAlienFreeze) return
    gIsAlienFreeze = true

    if (isEdgeReached()) {
        gBoard = shiftBoardDown()
        gAliensDirection *= - 1
    } else if (gAliensDirection === 1) {
         gBoard = shiftBoardRight()
    } else {
        gBoard = shiftBoardLeft()
    }

    renderBoard(gBoard)
    gIsAlienFreeze = false
}


function revealMines() {
    for (var i = 0; i < mineLocations.length; i++) {
        const pos = mineLocations[i]
        const cell = gBoard[pos.i][pos.j]
        if (cell.isShown) continue

        console.log('reaveal mine at:', pos)
        const elCell = getElCell(pos)
        elCell.innerHTML = MINE_IMG
        elCell.classList.add('reveal-mine')
    }
}

function getUnreveleadMines() {
    const unreveleadMines = []
    for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE; j++) {
            const cell = gBoard[i][j]
            if (!cell.isShown && cell.isMine) {
                unreveleadMines.push({i, j})
            }
        }
    }
    if (!unreveleadMines) return null
    return unreveleadMines
}


function isEdgeReached() {
    const edgeColumn = gAliensDirection === 1 ? BOARD_SIZE - 1 : 0
    for (var i = 0; i < BOARD_SIZE - 1; i++) {
        if (gBoard[i][edgeColumn].gameObject === ALIEN) {
            return true
        }
    }
}

function throwRock() {
    if (!gGame.isOn || gIntervalThrowRock) return

    const rockPos = getRndEmptyRockPos()
    if (!rockPos) return

    gIntervalThrowRock = setInterval(() => {
        rockPos.i++
        blinkRock({...rockPos})

        if (rockPos.i >= BOARD_SIZE - 1) {
            clearInterval(gIntervalThrowRock)
            gIntervalThrowRock = null
        }
    }, ROCK_SPEED)
}

function blinkRock(pos) {
    updateCell(pos, ROCK)
    setTimeout(() => {
        updateCell(pos, EMPTY)
    }, ROCK_SPEED / 2)
}

for (var i = 0; i < SIZE; i++) {
    for (var j = 0; j < SIZE; j++) {
        const cell = gBoard[i][j]
        if (!cell.isShown && cell.isMine) {
            const elCell = getElCell({i, j})
            elCell.classList.add('reveal-mine')
        }
    }
}



function getRndEmptyRockPos() {
    const rockPoses = []
    for (var i = gAliensTopRowIdx; i <= gAliensBottomRowIdx; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            if (isAlien({i, j}) && !isAlien({i: i + 1, j})) {
                rockPoses.push({i, j})
            }
        }
    }
    if (!rockPoses) return null
    return rockPoses[getRandomInt(rockPoses.length)]
}