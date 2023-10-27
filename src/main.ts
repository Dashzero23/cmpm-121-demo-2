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
let sticker = "";
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

class ToolPreview {
  x: number;
  y: number;
  render: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.render = true;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.render) {
      return;
    }
    if (sticker != "") {
      ctx.fillText(sticker, this.x, this.y);
      return;
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = currentMarkerThickness / 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, ctx.lineWidth, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }
}

class Sticker {
  private x: number;
  private y: number;
  private text: string;

  constructor(x: number, y: number, text: string) {
    this.x = x;
    this.y = y;
    this.text = text;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.text, this.x, this.y);
  }
}

function setBrush(arg: number | string) {
  if (typeof arg === "number") {
    sticker = "";
    currentMarkerThickness = arg;
  } else if (typeof arg === "string") {
    sticker = arg;
    currentMarkerThickness = 0;
  }
}

const currentToolPreview: ToolPreview = new ToolPreview(0, 0);

interface DrawingData {
  displayList: Input[];
  redoStack: Input[];
}

interface Input {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}

const drawingData: DrawingData = { displayList: [], redoStack: [] };

// Event listeners for mouse events to draw on the canvas
canvas.addEventListener("mousedown", (e: MouseEvent) => {
  isDrawing = true;

  if (ctx) {
    if (sticker == "") {
      const currentLine = new MarkerLine(e.offsetX, e.offsetY);
      drawingData.displayList.push(currentLine);
    } else {
      const newSticker = new Sticker(e.offsetX, e.offsetY, sticker);
      drawingData.displayList.push(newSticker);
    }
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (isDrawing && ctx) {
    const currentPath =
      drawingData.displayList[drawingData.displayList.length - 1];
    currentPath.drag(e.offsetX, e.offsetY);
    redraw();
    return;
  }

  currentToolPreview.render = true;
  currentToolPreview.x = e.offsetX;
  currentToolPreview.y = e.offsetY;
  redraw();
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
  }
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
  currentToolPreview.render = false;
  redraw();
});

interface ButtonGroup {
  name: string;
  styles?: Record<string, string>;
}

function createButtonGroups(groups: ButtonGroup[]) {
  groups.forEach((group) => {
    const container = document.createElement("div");
    // Set a group-specific class name
    container.className = group.name;

    // Apply styles to the container if provided
    if (group.styles) {
      Object.assign(container.style, group.styles);
    }

    verticalContainer.append(container);
  });
}

// Button group details, including styles
const buttonGroupDetails = [
  {
    name: "commandButtons",
    styles: { display: "flex", justifyContent: "center" },
  },
  { name: "brushSize", styles: { display: "flex", justifyContent: "center" } },
  {
    name: "emojiButtons",
    styles: { display: "flex", justifyContent: "center" },
  },
];

// Call the function to create the button groups
createButtonGroups(buttonGroupDetails);

// Create and add the "Clear" button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.id = "clearButton";
document.querySelector(".commandButtons")?.append(clearButton);

// Clear button functionality
clearButton.addEventListener("click", () => {
  if (ctx) {
    clearCanvas();
  }
});

const brushText = document.createElement("div");
brushText.textContent = "Brush size:"; // Set the text content

// Style the text element to match the button's size
brushText.style.width = "100px"; // Adjust the width as needed
brushText.style.height = "30px"; // Adjust the height as needed
brushText.style.textAlign = "center";
brushText.style.lineHeight = "40px"; // Adjust the line height to vertically center the text
document.querySelector(".brushSize")?.append(brushText);

// Create buttons for "thin" and "thick" markers
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerHTML = "Thin";
thinMarkerButton.id = "thinMarkerButton";
document.querySelector(".brushSize")?.append(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerHTML = "Thick";
thickMarkerButton.id = "thickMarkerButton";
document.querySelector(".brushSize")?.append(thickMarkerButton);

// Add event listeners to the marker tool buttons
thinMarkerButton.addEventListener("click", () => {
  setBrush(1); // Set to a thin marker (e.g., 1)
});

thickMarkerButton.addEventListener("click", () => {
  setBrush(5); // Set to a thick marker (e.g., 5)
});

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Create Custom Sticker";
customStickerButton.id = "customStickerButton";
document.querySelector(".emojiButtons")?.append(customStickerButton);

// Function to create buttons for a group
function createEmoteButtons(buttons: { text: string; id: string }[]) {
  const groupContainer = document.querySelector(".emojiButtons");
  if (groupContainer) {
    buttons.forEach((button) => {
      const newButton = document.createElement("button");
      newButton.innerHTML = button.text;
      newButton.id = button.id;
      groupContainer.append(newButton);
      newButton.addEventListener("click", () => {
        setBrush(button.text);
      });
    });
  }
}

// Button details for the emojiButtons group
const emojiButtons = [
  { text: "😀", id: "emote1" },
  { text: "🎉", id: "emote2" },
  { text: "❤️", id: "emote3" },
];

interface NewSticker {
  text: string;
  id: string;
}

// Array to store user-created stickers
const customStickers: NewSticker[] = [];

// Click event listener for the "Create Custom Sticker" button
customStickerButton.addEventListener("click", () => {
  const stickerText = prompt("Enter your custom sticker (e.g., 😊):");
  if (stickerText) {
    const newCustomSticker: NewSticker = {
      text: stickerText,
      id: `custom${customStickers.length + 1}`,
    };
    customStickers.push(newCustomSticker);
    createEmoteButtons(customStickers);
  }
});

// Call the function to create emoji buttons
createEmoteButtons(emojiButtons);

// Create and add the "Undo" button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.id = "undoButton";
document.querySelector(".commandButtons")?.append(undoButton);

// Create and add the "Redo" button
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.id = "redoButton";
document.querySelector(".commandButtons")?.append(redoButton);

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

// Create and add the "Export" button
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.id = "exportButton";
document.querySelector(".commandButtons")?.append(exportButton);

// Export button functionality
exportButton.addEventListener("click", () => {
  // Create a new canvas with dimensions 1024x1024
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  // Get the context for the new canvas
  const exportCtx = exportCanvas.getContext("2d");

  if (exportCtx) {
    // Apply a scale transformation to fill the larger canvas
    const scaleFactor = 4;
    exportCtx.scale(scaleFactor, scaleFactor);

    // Execute all items from the display list on the new canvas
    drawingData.displayList.forEach((command) => {
      command.display(exportCtx);
    });

    // Convert the canvas to a data URL and trigger a download
    const dataURL = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "exported_canvas.png";
    a.click();
  }
});

// Function to clear the canvas
function clearCanvas() {
  if (ctx) {
    drawingData.displayList = [];
    drawingData.redoStack = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function redraw() {
  if (drawingData?.displayList && ctx) {
    const paths = drawingData.displayList;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const path of paths) {
      path.display(ctx);
    }

    currentToolPreview.display(ctx);
  }
}
