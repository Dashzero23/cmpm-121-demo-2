import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// Create a container for the canvas and the "Clear" button
const verticalContainer = document.createElement("div");
verticalContainer.style.textAlign = "center"; // Center the contents
app.append(verticalContainer);

// Create a canvas element
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.backgroundColor = "white";
canvas.style.border = "1px solid black";
canvas.style.borderRadius = "8px";
canvas.style.boxShadow = "4px 4px 6px rgba(0, 0, 0, 0.1)";
verticalContainer.append(canvas);

const ctx = canvas.getContext("2d");

// Variables to track drawing state
let isDrawing = false;
let currentMarkerThickness = 2;

// Array to store the user's drawing points
//const displayList: [number, number][][] = [];
//const drawingPoints: [number, number][] = [];
//const redoStack: [number, number][][] = [];

class MarkerLine {
  private points: { x: number; y: number }[] = [];
  private thickness: number;

  constructor(initialX: number, initialY: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = currentMarkerThickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 1) {
      ctx.strokeStyle = "black";
      ctx.lineJoin = "round";
      ctx.lineWidth = this.thickness;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }
  }
}

interface DrawingData {
  displayList: MarkerLine[];
  redoStack: MarkerLine[];
}

const drawingData: DrawingData = { displayList: [], redoStack: [] };
// Event listeners for mouse events to draw on the canvas
canvas.addEventListener("mousedown", (e: MouseEvent) => {
  if (ctx) {
    isDrawing = true;
    const currentLine = new MarkerLine(e.offsetX, e.offsetY);
    drawingData.displayList.push(currentLine);
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (ctx && isDrawing) {
    const currentPath =
      drawingData.displayList[drawingData.displayList.length - 1];
    currentPath.drag(e.offsetX, e.offsetY);
    redraw();
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
  }
});

canvas.addEventListener("mouseout", () => (isDrawing = false));

// Create a container for buttons arranged horizontally
const horizontalContainer = document.createElement("div");
horizontalContainer.style.display = "flex";
horizontalContainer.style.justifyContent = "center"; // Center buttons horizontally
verticalContainer.append(horizontalContainer);

// Create and add the "Clear" button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.id = "clearButton";
horizontalContainer.append(clearButton);

// Clear button functionality
clearButton.addEventListener("click", () => {
  if (ctx) {
    clearCanvas();
  }
});

// Create buttons for "thin" and "thick" markers
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerHTML = "Thin";
thinMarkerButton.id = "thinMarkerButton";
horizontalContainer.append(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerHTML = "Thick";
thickMarkerButton.id = "thickMarkerButton";
horizontalContainer.append(thickMarkerButton);

// Add event listeners to the marker tool buttons
thinMarkerButton.addEventListener("click", () => {
  currentMarkerThickness = 1; // Set to a thin marker (e.g., 1)
});

thickMarkerButton.addEventListener("click", () => {
  currentMarkerThickness = 5; // Set to a thick marker (e.g., 5)
});

// Create and add the "Undo" button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.id = "undoButton";
horizontalContainer.append(undoButton);

// Create and add the "Redo" button
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.id = "redoButton";
horizontalContainer.append(redoButton);

// Undo button functionality
undoButton.addEventListener("click", () => {
  if (ctx) {
    undo();
  }
});

// Redo button functionality
redoButton.addEventListener("click", () => {
  if (ctx) {
    redo();
  }
});

// Function to undo the last line
function undo() {
  if (drawingData.displayList.length > 0) {
    const line = drawingData.displayList.pop(); // Remove the last line from displayList

    if (line) {
      drawingData.redoStack.push(line); // Add the line to redoStack
      redraw();
    }
  }
}

// Function to redo the last undone line
function redo() {
  if (drawingData.redoStack.length > 0) {
    const line = drawingData.redoStack.pop(); // Remove the last line from redoStack
    if (line) {
      drawingData.displayList.push(line); // Add the line back to displayList
      redraw();
    }
  }
}

// Function to clear the canvas
function clearCanvas() {
  if (ctx) {
    drawingData.displayList = [];
    drawingData.redoStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Fixed
function redraw() {
  if (drawingData?.displayList && ctx) {
    const paths = drawingData.displayList;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const path of paths) {
      path.display(ctx);
    }
  }
}
