'use strict'

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}

function getElCell(pos) {
    return document.querySelector(`[data-i='${pos.i}'][data-j='${pos.j}']`)
}

function getRndEmptyCandyPos() {
    var emptyCellPoses = []
    for (var col = 0; col < BOARD_SIZE; col++) {
        if (gBoard[0][col].gameObject === EMPTY) {
            emptyCellPoses.push({i: 0, j: col})
        }
    }
    if (!emptyCellPoses) return null
    return emptyCellPoses[getRandomInt(emptyCellPoses.length)]
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

function isSuperCandy(pos) {
    return gBoard[pos.i][pos.j].gameObject === CANDY
}

function isHero(pos) {
    return gBoard[pos.i][pos.j].gameObject === HERO
}

function isAlien(pos) {
    if (pos.i < 0 || pos.i >= gBoard.length || !gBoard[pos.i]) return false
    for (var i = 0; i < ALIENS.length; i++) {
        if (gBoard[pos.i][pos.j].gameObject === ALIENS[i]) return true
    }
    return false
}

function isElAlien(val) {
    for (var i = 0; i < ALIENS.length; i++) {
        if (ALIENS[i] === val) return true
    }
    return false
}

function getElCellByPos(pos) {
    return document.querySelector(`.cell-${pos.i}-${pos.j}`)
}