'use strict'

const BOARD_SIZE = 14
const ALIEN_ROW_LENGTH = 8
const ALIEN_ROW_COUNT = 3
// const HERO = '♆'
const HERO = `<img src="img/hero.png">`
const ALIEN = '👽'
const LASER = '⤊'
// const LASER = '⚡'
const CANDY = '🍬'
const SKY = 'SKY'
const GROUND = 'GROUND'
const HERO_GROUND = 'HERO_GROUND'
const EMPTY = ''
const EXPLOSION1 = '💥'
const EXPLOSION2 = '🔥'
// const ROCK = '🪨'
const ROCK = 'R'

// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN}
var gBoard
var gGame = {
    isOn: false,
    alienCount: 0,
    lives: 3
}
var gScore
var gIntervalCandy

function onInit() {
    gGame.isOn = false
    gHero.isShoot = false
    clearIntervalsAndTimeouts()

    gBoard = createBoard()
    renderBoard(gBoard)
    
    gAliensDirection = 1
    updateScore(0)
    updateAliensCount()
}

function onStartGame() {
    gGame.isOn = true
    gIntervalAliens = setInterval(moveAliens, ALIEN_SPEED)
    gIntervalCandy = setInterval(addSpaceCandy, 10000)
    gIntervalAliensShoot = setInterval(throwRock, 3000)
}

// Create and returns the board with aliens on top, ground at bottom
// use the functions: createCell, createHero, createAliens
function createBoard() {
    var board = []
    for (var i = 0; i < BOARD_SIZE; i++) {
        board[i] = []
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = createCell()

            if (i === BOARD_SIZE - 2) {
                board[i][j].type = HERO_GROUND
            } else if (i === BOARD_SIZE - 1) {
                board[i][j].type = GROUND
            }
        }
    }
    createHero(board)
    createAliens(board)
    return board
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < BOARD_SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < BOARD_SIZE; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j} ${cell.type}`

            strHTML += `<td data-i="${i}" data-j="${j}" class="${className}">${cell.gameObject}</td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(gameObject = EMPTY) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}

// position such as: {i: 2, j: 7}
function updateCell(pos, gameObject = EMPTY) {
    gBoard[pos.i][pos.j].gameObject = gameObject
    const elCell = getElCell(pos)
    elCell.innerHTML = gameObject
}

function renderCell(pos, gameObject = EMPTY) {
    // gBoard[pos.i][pos.j].gameObject = gameObject
    const elCell = getElCell(pos)
    elCell.innerHTML = gameObject
}

function onHandleAlienFreeze(elBtn = null) {
    if (!elBtn) elBtn = document.querySelector('.freeze-btn')
    elBtn.blur()
    elBtn.innerText = 'Alien Freeze: ' 

    if (gIsAlienFreeze) {
        elBtn.innerText += 'OFF'
        gIsAlienFreeze = false
    } else {
        elBtn.innerText += 'ON'
        gIsAlienFreeze = true
    }
}

function onRestart(elBtn) {
    elBtn.classList.add('hint-glow')
    elBtn.blur()
    
    if (gGame.isOn) {
        elBtn.innerText = 'Start'
        onInit()
    } else {
        elBtn.innerText = 'Restart'
        onStartGame()
    }
}

function clearIntervalsAndTimeouts() {
    clearInterval(gIntervalAliens)
    clearInterval(gIntervalCandy)
}

function addSpaceCandy() {
    const cellPos = getRndEmptyCandyPos()
    if (!cellPos) return

    updateCell(cellPos, CANDY)
    setTimeout(() => removeSuperCandy(cellPos), 5000)
}

function removeSuperCandy(candyPos) {
    if (isHero(candyPos)) return
    
    updateCell(candyPos, EMPTY)
}

function enableSpaceCandy() {
    onHandleAlienFreeze()
    updateScore(50)

    setTimeout(() => {
        onHandleAlienFreeze()
    }, 5000)
}

function updateScore(diff) {
    if (!diff) {
        gScore = 0
    } else {
        gScore += diff
    }
    document.querySelector('.score').innerHTML = gScore
}

function updateAliensCount(diff) {
    if (diff) {
        gGame.alienCount += diff
    }
    document.querySelector('.aliens-count').innerHTML = gGame.alienCount
}