const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let cols, rows;
let cellSize;
let grid = [];

let running = false;
let interval;


let rules = {
  survive: [2, 3], 
  birth: [3]       
};

const presets = {
  "Conway's Life": { survive: [2, 3], birth: [3] },
  "High Life": { survive: [2, 3], birth: [3, 6] },
  "Day & Night": { survive: [3, 4, 6, 7, 8], birth: [3, 6, 7, 8] },
  "Seeds": { survive: [], birth: [2] },
  "Replicator": { survive: [1, 3, 5, 7], birth: [1, 3, 5, 7] },
  "Maze": { survive: [1, 2, 3, 4, 5], birth: [3] },
  "Coral": { survive: [4, 5, 6, 7, 8], birth: [3] },
  "Amoeba": { survive: [1, 3, 5, 8], birth: [3, 5, 7] }
};

function resizeCanvas() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const size = Math.min(window.innerWidth * 0.85, 420);
    canvas.width = size;
    canvas.height = size*2;
    cols = 130;
    rows = 260;
  } else {
    const navHeight = 150; 
    const paddingHorizontal = 130; 
    const paddingVertical = 0;

    
    const availableWidth = window.innerWidth - (paddingHorizontal * 2);
    const availableHeight = window.innerHeight - navHeight - (paddingVertical * 2);
    
    canvas.width = availableWidth;
    canvas.height = availableHeight;
    
    cellSize = 3;
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
  }

  cellSize = canvas.width / cols;
  
  grid = createGrid();
  drawGrid();
}

window.addEventListener("resize", resizeCanvas);

function createGrid(random = true) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      random ? (Math.random() > 0.7 ? 1 : 0) : 0
    )
  );
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] > 0) {
        const age = grid[y][x];
        const hue = (age * 8) % 360;

        ctx.fillStyle = `hsl(${hue}, 70%, 75%)`;
        ctx.fillRect(
          x * cellSize,
          y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

function countNeighbors(x, y) {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        count += grid[ny][nx] > 0 ? 1 : 0;
      }
    }
  }
  return count;
}

function step() {
  const next = createGrid(false);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbors = countNeighbors(x, y);

      if (grid[y][x] > 0) {
        next[y][x] = rules.survive.includes(neighbors)
          ? grid[y][x] + 1
          : 0;
      } else {
        next[y][x] = rules.birth.includes(neighbors) ? 1 : 0;
      }
    }
  }

  grid = next;
  drawGrid();
}

function toggleRun() {
  running = !running;

  if (running) {
    interval = setInterval(step, 120);
  } else {
    clearInterval(interval);
  }
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  toggleRun();
});

const rulesToggle = document.getElementById("rulesToggle");
const rulesPanel = document.getElementById("rulesPanel");

rulesToggle.addEventListener("click", () => {
  rulesPanel.classList.toggle("open");
});

const presetSelect = document.getElementById("presetSelect");
presetSelect.addEventListener("change", (e) => {
  const presetName = e.target.value;
  if (presets[presetName]) {
    rules.survive = [...presets[presetName].survive];
    rules.birth = [...presets[presetName].birth];
    updateRuleCheckboxes();
    resetGrid();
  }
});

function updateRuleCheckboxes() {
  for (let i = 0; i <= 8; i++) {
    document.getElementById(`survive${i}`).checked = rules.survive.includes(i);
    document.getElementById(`birth${i}`).checked = rules.birth.includes(i);
  }
}

function setupRuleListeners() {
  for (let i = 0; i <= 8; i++) {
    document.getElementById(`survive${i}`).addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!rules.survive.includes(i)) rules.survive.push(i);
      } else {
        rules.survive = rules.survive.filter(n => n !== i);
      }
      rules.survive.sort((a, b) => a - b);
    });

    document.getElementById(`birth${i}`).addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!rules.birth.includes(i)) rules.birth.push(i);
      } else {
        rules.birth = rules.birth.filter(n => n !== i);
      }
      rules.birth.sort((a, b) => a - b);
    });
  }
}

function resetGrid() {
  if (running) {
    toggleRun();
  }
  grid = createGrid();
  drawGrid();
}

document.getElementById("resetBtn").addEventListener("click", resetGrid);

resizeCanvas();
drawGrid();
setupRuleListeners();
updateRuleCheckboxes();