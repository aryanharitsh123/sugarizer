define(['sugar-web/activity/activity', 'activity/Board', 'activity/vanilla-state', 'activity/patterns'], function (activity, Board, State, patterns) {
  require(['domReady!'], function (doc) {
    activity.setup()
    main(Board, State, patterns)
  })
})

function main(Board, State, patterns) {
  const state = new State({
    boardState: [],
    generation: 0,
    playPauseIcon: 'play',
    shouldPlay: false,
  })
  const [randomPattern, gliderPattern, noPattern, blankPattern] = patterns
  const target =  document.querySelector('.main canvas')
  const board = new Board( state.state.boardState,
    '#C02E70',
    '#FBF6F5',
    '#ED5B9D',
    '#EA3788',
    12,
    12,
    2,
    2,
    target
  )
  board.draw()
  const generateGeneration = () => {
    if (state.state.shouldPlay) {
      const nextGenerationBoard = state.state.boardState.map((row, y) => (
        row.map((cell, x) => (
          transformCellByRule(cell, findNeighbours(x, y))
        ))
      ))
      state.set(prev => ({
        boardState: nextGenerationBoard,
        generation: prev.generation + 1
      }))
      setTimeout(generateGeneration, 100)
    } else {
      return 0
    }
  }

  const transformCellByRule = (cell, neighbours)  => {
    const cellIsAlive = cell === 1 || cell === 2
    const aliveInNeighbour = neighbours.filter(cell => (cell === 1 || cell === 2 ))
    const numOfAliveNeighbours = aliveInNeighbour.length
    if (cellIsAlive) {
      if (numOfAliveNeighbours < 2) {
        return 0
      } else if (numOfAliveNeighbours === 2 || numOfAliveNeighbours === 3) {
        return 1
      } else {
        return 0
      }
    } else {
      if (numOfAliveNeighbours === 3) {
        return 2
      } else {
        return 0
      }
    }
  }

  const findNeighbours = (x, y) => {
    const leftX = (x - 1 === -1)
      ? 49
      : x - 1
    const rightX = (x + 1 === 50)
      ? 0
      : x + 1
    const topY = (y - 1 === -1)
      ? 29
      : y - 1
    const bottomY = (y + 1 === 30)
      ? 0
      : y + 1

    const left =  state.state.boardState[y][leftX]
    const right = state.state.boardState[y][rightX]
    const top = state.state.boardState[topY][x]
    const bottom = state.state.boardState[bottomY][x]
    const leftTop = state.state.boardState[topY][leftX]
    const leftBottom = state.state.boardState[bottomY][leftX]
    const rightTop = state.state.boardState[topY][rightX]
    const rightBottom = state.state.boardState[bottomY][rightX]

    return [left, right, top, bottom, leftTop, leftBottom, rightTop, rightBottom]
  }

  state.subscribe({
    boardState: [
      '.fake-selector',
      (fakeElem, value, prevValue) => {
        board.update(value)
      }
    ],

    generation: ['.generation-count', 'innerText'],

    playPauseIcon: [
      '#play-pause',
      (elem, value, prevValue) => {
        elem.className = `${value} toolbutton`
      }
    ],

    shouldPlay: [
      '.fake-selector',
      (fakeElem, value, prevValue) => {
        if (value) {
          generateGeneration()
        }
      }
    ]
  })

  state.set({
    boardState: randomPattern(),
  })

  document.querySelector('#play-pause')
    .addEventListener('click', () => {
      state.set(prev => {
        const iconToSet = (prev.playPauseIcon === 'play') ? 'pause' : 'play'
        const togglePlay = (prev.shouldPlay === true) ? false : true
        return {
          playPauseIcon: iconToSet,
          shouldPlay: togglePlay
        }
      })
    })
  document.querySelector('#random')
    .addEventListener('click', () => {
      // console.log(randomPattern())
      state.set({
        boardState: randomPattern(),
        generation: 0
      })
    })
  document.querySelector('#glider')
    .addEventListener('click', () => {
      // console.log(glider())
      state.set({
        boardState: glider(),
        generation: 0
      })
    })
  document.querySelector('#no')
    .addEventListener('click', () => {
      // console.log(no())
      state.set({
        boardState: no(),
        generation: 0
      })
    })
  document.querySelector('#clear')
    .addEventListener('click', () => {
      // console.log(no())
      state.set({
        boardState: blankPattern(),
        generation: 0
      })
    })
}
