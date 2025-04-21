const newGameButton = document.getElementById('newGameButton');
const newGameContainer = document.getElementById('newGameContainer');
const blurOverlay = document.getElementById('Blur');

newGameButton.onclick = () => {
  newGameContainer.style.display = 'flex';
  blurOverlay.style.display = 'block';
};

blurOverlay.onclick = () => {
  newGameContainer.style.display = 'none';
  blurOverlay.style.display = 'none';
};

const difficultyButtons = {
  Easy: 40,
  Medium: 49,
  Hard: 53,
  Expert: 60,
  Extreme: 68
};

let hiddenGrid = null;
let selectedInput = null;
let mistakes = 0;

function handleNewGame(difficulty) {
  location.reload();
  const { grid, hiddenGrid: generatedHiddenGrid } = makeGridNumbers();
  const userView = grid.map(row => [...row]);
  hideRandomBoxes(userView, difficultyButtons[difficulty]);
  hiddenGrid = generatedHiddenGrid;

  mistakes = 0;
  ShowSudoku(userView);
  document.getElementById('DifficultyP').textContent = difficulty;
  document.getElementById('MistakesP').textContent = `Mistakes: 0/3`;

  // Save to localStorage
  const gameState = {
    userView,
    hiddenGrid,
    difficulty,
    mistakes
  };
  localStorage.setItem('sudokuGameState', JSON.stringify(gameState));

  newGameContainer.style.display = 'none';
  blurOverlay.style.display = 'none';
}

Object.keys(difficultyButtons).forEach(difficulty => {
  document.getElementById(`newGame${difficulty}Button`).onclick = () => handleNewGame(difficulty);
});

function makeGridNumbers() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function isSafe(row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  }

  function fillGrid() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          let numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (let num of numbers) {
            if (isSafe(row, col, num)) {
              grid[row][col] = num;
              if (fillGrid()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillGrid();

  const hiddenGrid = grid.map(row => [...row]);

  return { grid, hiddenGrid };
}

function hideRandomBoxes(userView, count) {
  let hidden = 0;
  while (hidden < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (userView[row][col] !== 0) {
      userView[row][col] = 0;
      hidden++;
    }
  }
}

function ShowSudoku(userView) {
  updateNumberButtons(userView);
  const SudokuContainer = document.getElementById('SudokuContainer');
  SudokuContainer.innerHTML = '';

  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const block = document.createElement('div');
      block.className = 'sudoku-block';

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const actualRow = blockRow * 3 + row;
          const actualCol = blockCol * 3 + col;

          const num = userView[actualRow][actualCol];

          const numElement = document.createElement('p');
          numElement.textContent = num === 0 ? '' : num;
          numElement.className = 'sudoku-box';
          numElement.id = `${actualRow}_${actualCol}`;
          numElement.dataset.row = actualRow;
          numElement.dataset.col = actualCol;

          numElement.onclick = () => {
            document.querySelectorAll('.sudoku-box').forEach(el => {
              el.style.backgroundColor = 'var(--body-bg)';
            });

            selectedInput = numElement;

            for (let x = 0; x < 9; x++) {
              const colCell = document.getElementById(`${x}_${selectedInput.dataset.col}`);
              const rowCell = document.getElementById(`${selectedInput.dataset.row}_${x}`);
              if (colCell) colCell.style.backgroundColor = 'var(--sudoku-bg-hvr)';
              if (rowCell) rowCell.style.backgroundColor = 'var(--sudoku-bg-hvr)';
            }

            const startRow = selectedInput.dataset.row - selectedInput.dataset.row % 3;
            const startCol = selectedInput.dataset.col - selectedInput.dataset.col % 3;
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                const box = document.getElementById(`${parseInt(startRow) + i}_${parseInt(startCol) + j}`);
                if (box) box.style.backgroundColor = 'var(--sudoku-bg-hvr)';
              }
            }

            if (numElement.textContent) {
              Array.from(document.querySelectorAll('.sudoku-box')).filter(el => el.textContent === numElement.textContent).forEach(sameNumber => {
                sameNumber.style.backgroundColor = 'var(--sudoku-same-num-hvr)';
              });
            }

            numElement.style.background = 'var(--sudoku-box-hvr)';
          };


          for (let i = 1; i <= 9; i++) {
            const count = Array.from(document.querySelectorAll('.sudoku-box'))
              .filter(el => el.textContent === i.toString()).length;
          
            if (count === 9) {
              document.getElementById(`numberBTN${i}`).innerHTML = '✔';
            }
          }
          block.appendChild(numElement);
        }
      }

      SudokuContainer.appendChild(block);
    }
  }
  
  document.querySelectorAll('.number-bt').forEach(btn => {
    btn.onclick = () => {
      if (!selectedInput || selectedInput.innerHTML) return;

      const row = selectedInput.dataset.row;
      const col = selectedInput.dataset.col;
      const number = btn.querySelector('p').textContent;

      if (number == hiddenGrid[row][col]) {
        selectedInput.textContent = number;
        selectedInput.style.color = '#335baf';
        userView[row][col] = parseInt(number);
        updateNumberButtons(userView);
      } else {
        const errorSound = new Audio('error-5-199276.mp3');
        const gameOverSound = new Audio('negative_beeps-6008.mp3');
        mistakes++;
        if (mistakes === 3) {
          gameOverSound.play();
          gameOver();
          return;
        }
        errorSound.play();
        selectedInput.classList.add('error');
        setTimeout(() => selectedInput.classList.remove('error'), 500);
        document.getElementById('MistakesP').textContent = `Mistakes: ${mistakes}/3`;
      }

      // Save progress
      localStorage.setItem('sudokuGameState', JSON.stringify({
        userView,
        hiddenGrid,
        difficulty: document.getElementById('DifficultyP').textContent,
        mistakes
      }));
    };
  });
}

function gameOver() {
  newGameContainer.style.display = 'flex';
  blurOverlay.style.display = 'block';
}

// Load saved game on refresh
window.onload = () => {
  const savedState = localStorage.getItem('sudokuGameState');

  const gameState = savedState ? JSON.parse(savedState) : null;

  if (!gameState) {
    const { grid, hiddenGrid: generatedHiddenGrid } = makeGridNumbers();
    const userView = grid.map(row => [...row]);
    hideRandomBoxes(userView, 40);
    hiddenGrid = generatedHiddenGrid;
  
    mistakes = 0;
    ShowSudoku(userView);
    document.getElementById('DifficultyP').textContent = 'Easy';
  }

  if (savedState) {
    const { userView, hiddenGrid: savedHidden, difficulty, mistakes: savedMistakes } = JSON.parse(savedState);
    hiddenGrid = savedHidden;
    mistakes = savedMistakes;
    ShowSudoku(userView);
    document.getElementById('DifficultyP').textContent = difficulty;
    document.getElementById('MistakesP').textContent = `Mistakes: ${mistakes}/3`;
    newGameContainer.style.display = 'none';
    blurOverlay.style.display = 'none';
  }
};

function updateNumberButtons(userView) {
  const counts = Array(10).fill(0);

  userView.forEach(row => {
    row.forEach(num => {
      if (num >= 1 && num <= 9) counts[num]++;
    });
  });

  document.querySelectorAll('.number-bt').forEach(btn => {
    const number = parseInt(btn.querySelector('p').textContent);
    btn.disabled = counts[number] >= 9;
    btn.classList.toggle('disabled', counts[number] >= 9);
  });
}