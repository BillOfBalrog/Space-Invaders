'use strict'

////////////////////////////////////////////////////////
// PLEASE READ:
// The entire project was completed with emojis only and no image files
// The last few hours before the deadline I decided to replace everything with images
// If I had more time to revisit or refactor then I would do it completely
// Different, and only store 'ALIEN' in model and that's it, there's no need for more.
// And instead of storing the <img> tag names we can just store the name of the file like 'rock'
// and then make a function to insert the rock.png etc etc

// const BOARD_SIZE = 14
const ROW_SIZE = 15
const COL_SIZE = 14

const GAME_OBJECTS = {
    HERO: '<img src="img/hero1.png">',
    HERO_SHIELD: '<img src="img/hero_shield1.png">',
    ALIEN1: '<img src="img/alien1.png">',
    ALIEN2: '<img src="img/alien2.png">',
    ALIEN3: '<img src="img/alien3.png">',
    ALIEN4: '<img src="img/alien4.png">',
    ALIEN5: '<img src="img/alien5.png">',
    LASER: '<img src="img/laser1.png">',
    LASER_SUPER: '<img src="img/laser_super1.png">',
    CANDY: '<img src="img/candy1.png">',
    ROCK: '<img src="img/rock1.png">'
}

// const GAME_OBJECTS = {
//     HERO: '♆',
//     HERO_SHIELD: '🌐',
//     ALIEN1: '👽',
//     ALIEN2: '👾',
//     ALIEN3: '🛸',
//     ALIEN4: '🤖',
//     ALIEN5: '👹',
//     LASER: '⤊',
//     LASER_SUPER: '^',
//     CANDY: '🪅',
//     ROCK: '🗿'
// }

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
    // explosion: '💥',
    // flames: '🔥'
    explosion: '<img src="img/explosion.png">',
    flames: '<img src="img/flames.png">',
    rip: `<img src="img/rip.png">`,
    heart: '💗',
    heartHit: '💔',
    shield: '🛡️',
    laser: '⚡',
}

const gSounds = {
    laser: 'laser1',
    laserSuper: 'laserSuper1',
    explosion: 'explosion1',
    shieldOn: 'shieldOn1',
    shieldOff: 'shieldOff1',
    bunkerHit: 'bunker1',
    superOn: 'superOn1',
    superOff: 'superOff1',
    dazed: 'rockHitHero1',
    rockDestroyed: 'hitRock1',
    heroDefeat: 'defeat1',
    heroVictory: 'victory1',
    candy: 'candy1',
	shieldedHit: 'shieldedHit1'
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
    isBunkers: true,
    isBorders: false
}
let gIntervalSpaceCandy
let gTimeoutSpaceCandy
let gTimeoutAliensFreeze
let gTheme = 1

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
    for (let i = 0; i < ROW_SIZE; i++) {
        board.push([])
        for (let j = 0; j < COL_SIZE; j++) {
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
    for (let i = 0; i < ROW_SIZE; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < COL_SIZE; j++) {
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
    gGame.isOn = false
    clearAllIntervals()    
    renderCell({...gHero.pos}, gameImages.rip)

    const msg1 = 'Game Over!'
    const msg2 = isHeroHit ? `Try to avoid those rocks!` : `Don't let the aliens reach the ground!`
    handleGameModal(msg1, msg2)
    playAudio(gSounds.heroDefeat)

    // if (isHeroHit) {
    //     alert('Game Over! The hero was hit by a rock and has run out of lives.')
    // } else {
    //     alert('Game Over! Aliens have reached the ground, defeating the hero.')
    // }
}

function handleSpaceCandyHit() {
    gGame.score += 50
    gIsAlienFreeze = true

    renderScore()
    renderFreeze()

    if (gTimeoutAliensFreeze) clearTimeout(gTimeoutAliensFreeze)
    gTimeoutAliensFreeze = setTimeout(() => {
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

function handleGameModal(msg1, msg2) {
    getEl('.win-modal-message1').innerText = msg1
    getEl('.win-modal-message2').innerText = msg2
    toggleModal()
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






