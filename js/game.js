'use strict'

const BOARD_SIZE = 14

const GAME_OBJECTS = {
    HERO: '♆',
    HERO_SHIELD: '🌐',
    ALIEN1: '👽',
    ALIEN2: '👾',
    ALIEN3: '🛸',
    ALIEN4: '🤖',
    ALIEN5: '👹',
    LASER: '⤊',
    LASER_SUPER: '^',
    CANDY: '🪅',
    ROCK: '🗿'
}

const GAME_TYPES = {
    SKY: 'SKY',
    BUNKER: 'BUNKER',
    GROUND: 'GROUND',
    HERO_GROUND: 'HERO_GROUND'
}

const gDifficultyLevels = {
    easy: { rowLength: 8, rowCount: 3, speed: 500 },
    normal: { rowLength: 8, rowCount: 4, speed: 450 },
    hard: { rowLength: 10, rowCount: 5, speed: 400 },
    extreme: { rowLength: 12, rowCount: 5, speed: 400 }
}

// just some extra emojis that aren't used in the model
// but only for rendering
const gameImages = {
    explosion: '💥',
    flames: '🔥'
}

const SPACE_CANDY_DURATION = 5000
const SPACE_CANDY_INTERVAL_FREQ = 10000
const FREEZE_ALIENS_DURATION = 5000

// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN}
let gBoard
let gGame = {
    isOn: false,
    alienCount: 0,
    score: 0,
    isAudioOn: true,
    difficulty: 'normal',
    isBunkers: true
}
let gIntervalSpaceCandy
let gTimeoutSpaceCandy
// let gTimeoutAliensFreeze

// Called when game loads
function init() {
    gGame.isOn = false
    clearAllIntervals()
    resetAliensConfig()
    gGame.score = 0
    gIsLaserHit = false
    
    gBoard = createBoard()
    renderBoard(gBoard)
    enableStartButton()
    renderGameStats()
}

function startGame() {
    gGame.isOn = true
    startAlienMovement()
    startSpaceCandyInterval()
    startAliensThrowingRocksInterval()
}

// Create and returns the board with aliens on top, ground at bottom
// use the functions: createCell, createHero, createAliens
function createBoard() {
    const board = []
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push([])
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (isBoardHeroGround(i)) {
                board[i][j] = createCell(GAME_TYPES.HERO_GROUND)
            } else if (isBoardGround(i)) {
                board[i][j] = createCell(GAME_TYPES.GROUND)
            } else board[i][j] = createCell()
        }
    }
    if (gGame.isBunkers) createBunkers(board)
    createHero(board)
    createAliens(board)
    return board
}

// Render the board as a <table> to the page
function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    let strHTML = ''
    for (let i = 0; i < BOARD_SIZE; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = board[i][j]
            const cellContent = cell.gameObject ? cell.gameObject : ''
            const className = getClassName(i, j)
            strHTML += `<td 
                            data-i="${i}" data-j="${j}"
                            class="${className}">
                            ${cellContent}
                        </td>`
        }
        strHTML += '</tr>'
    }
    elBoard.innerHTML = strHTML
}

function gameOver(isHeroHit = false) {
    // Need to add a modal later
    // generate different msg depend if hero got hit by rock or aliens reached ground
    gGame.isOn = false
    clearAllIntervals()    
    renderCell({...gHero.pos}, '⚰️')

    if (isHeroHit) {
        alert('Game Over! The hero was hit by a rock and has run out of lives.')
    } else {
        alert('Game Over! Aliens have reached the ground, defeating the hero.')
    }
}

function handleSpaceCandyHit() {
    gGame.score += 50
    gIsAlienFreeze = true

    renderScore()
    renderFreeze()

    setTimeout(() => {
        gIsAlienFreeze = false
        renderFreeze()
    },FREEZE_ALIENS_DURATION)
}

function addSpaceCandy() {
    if (!gGame.isOn) return
    
    const cellPos = getRndEmptyCandyPos()
    if (!cellPos) return

    updateAndRenderCell(cellPos, GAME_OBJECTS.CANDY)

    gTimeoutSpaceCandy = setTimeout(() => removeSpaceCandy(cellPos), SPACE_CANDY_DURATION)
}

function removeSpaceCandy(pos) {
    if (!isSpaceCandy(pos) || !gGame.isOn) return

    updateAndRenderCell(pos)
}

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(type = GAME_TYPES.SKY, gameObject = null) {
    return {
        type,
        gameObject
    }
}

// position such as: {i: 2, j: 7}
function updateAndRenderCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject
    const elCell = getElCell(pos)
    elCell.innerHTML = gameObject || ''
}

function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject
}

function updateType(pos, type = GAME_TYPES.SKY) {
    gBoard[pos.i][pos.j].type = type
}






