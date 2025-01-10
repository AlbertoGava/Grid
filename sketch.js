let img;
let cols = 10;
let rows = 6;
let newWidths = [];
let newHeights = [];
let expandedWidth, expandedHeight;
let cellIndexX, cellIndexY;
let showGrid = true;
let gui;

let guiParams = {
  cols: cols,
  rows: rows,
  showGrid: showGrid,
  saveCanvas: saveCanvas,
  reloadImage: reloadImage,
};

function preload() {
  img = loadImage('imgs/1.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  resizeCanvasToImage();
  calculateGrid();
  setupGUI();
}

function draw() {
  background(225);
  drawImageWithGrid();
  if (guiParams.showGrid) {
    drawGridLines();
    drawCanvasBorder();
  }
}

function windowResized() {
  resizeCanvasToImage();
  calculateGrid();
}

function resizeCanvasToImage() {
  let imgAspect = img.width / img.height;
  let winAspect = windowWidth / windowHeight;

  let canvasWidth, canvasHeight;

  if (imgAspect > winAspect) {
    canvasWidth = windowWidth;
    canvasHeight = windowWidth / imgAspect;
  } else {
    canvasHeight = windowHeight;
    canvasWidth = windowHeight * imgAspect;
  }

  resizeCanvas(canvasWidth, canvasHeight);
  img.resize(canvasWidth, canvasHeight);
}

function calculateGrid() {
  let minWidth = width * 0.05;
  let minHeight = height * 0.05;

  let expandAmountX = random(0, width * 0.3);
  let expandAmountY = random(0, height * 0.3);

  cellIndexX = floor(random(cols));
  cellIndexY = floor(random(rows));

  let regularWidth = width / cols;
  let regularHeight = height / rows;

  expandedWidth = max(minWidth, regularWidth + expandAmountX);
  expandedHeight = max(minHeight, regularHeight + expandAmountY);

  let remainingWidth = width - expandedWidth;
  let remainingHeight = height - expandedHeight;

  newWidths = [];
  newHeights = [];
  let totalWidthAllocated = 0;
  let totalHeightAllocated = 0;

  for (let i = 0; i < cols; i++) {
    if (i === cellIndexX) {
      newWidths.push(expandedWidth);
    } else if (i === cols - 1) {
      let w = max(minWidth, remainingWidth - totalWidthAllocated);
      newWidths.push(w);
    } else {
      let maxPossibleWidth = (remainingWidth - totalWidthAllocated) - (minWidth * (cols - i - 1));
      let w = random(minWidth, max(maxPossibleWidth, minWidth));
      newWidths.push(w);
      totalWidthAllocated += w;
    }
  }

  let widthCorrection = width - newWidths.reduce((a, b) => a + b, 0);
  newWidths[cols - 1] += widthCorrection;

  for (let i = 0; i < rows; i++) {
    if (i === cellIndexY) {
      newHeights.push(expandedHeight);
    } else if (i === rows - 1) {
      let h = max(minHeight, remainingHeight - totalHeightAllocated);
      newHeights.push(h);
    } else {
      let maxPossibleHeight = (remainingHeight - totalHeightAllocated) - (minHeight * (rows - i - 1));
      let h = random(minHeight, max(maxPossibleHeight, minHeight));
      newHeights.push(h);
      totalHeightAllocated += h;
    }
  }

  let heightCorrection = height - newHeights.reduce((a, b) => a + b, 0);
  newHeights[rows - 1] += heightCorrection;
}

function drawImageWithGrid() {
  let y = 0;
  let imgColWidth = img.width / cols;
  let imgRowHeight = img.height / rows;

  for (let i = 0; i < rows; i++) {
    let x = 0;
    let cellHeight = newHeights[i];
    for (let j = 0; j < cols; j++) {
      let cellWidth = newWidths[j];
      let imgX = j * imgColWidth;
      let imgY = i * imgRowHeight;

      let imgW = min(imgColWidth, img.width - imgX);
      let imgH = min(imgRowHeight, img.height - imgY);

      image(img, x, y, cellWidth, cellHeight, imgX, imgY, imgW, imgH);
      x += cellWidth;
    }
    y += cellHeight;
  }
}

function drawGridLines() {
  stroke(0, 255, 0);
  strokeWeight(3);
  noFill();

  let x = 0;
  for (let i = 0; i <= cols; i++) {
    line(x, 0, x, height);
    if (i < cols) {
      x += newWidths[i];
    }
  }

  let y = 0;
  for (let i = 0; i <= rows; i++) {
    line(0, y, width, y);
    if (i < rows) {
      y += newHeights[i];
    }
  }
}

function drawCanvasBorder() {
  let borderWeight = 6;
  stroke(0, 255, 0);
  strokeWeight(borderWeight);
  noFill();
  rect(borderWeight / 2, borderWeight / 2, width - borderWeight, height - borderWeight);
}

function updateGrid() {
  calculateGrid();
  redraw();
}

function setupGUI() {
  gui = new dat.GUI();
  gui.add(guiParams, 'reloadImage').name('UPLOAD IMAGE');

  gui.add(guiParams, 'cols', 1, 15).step(1).name('COLS').onChange(() => {
    cols = guiParams.cols;
    updateGrid();
  });
  gui.add(guiParams, 'rows', 1, 15).step(1).name('ROWS').onChange(() => {
    rows = guiParams.rows;
    updateGrid();
  });
  gui.add(guiParams, 'showGrid').name('GRID').onChange(() => {
    showGrid = guiParams.showGrid;
    redraw();
  });

  gui.add({ updateGrid }, 'updateGrid').name('UPDATE');

  gui.add(guiParams, 'saveCanvas').name('SAVE .PNG');
}

function saveCanvas() {
  saveCanvas('grid_image', 'png');
}

function reloadImage() {
  let input = createFileInput(file => {
    if (file.type.startsWith('image')) {
      img = loadImage(file.data, () => {
        resizeCanvasToImage();
        calculateGrid();
      });
    } else {
      console.error('Il file selezionato non è un\'immagine.');
    }
  });
  input.elt.click();
}
