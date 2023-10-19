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
let lastX = 0;
let lastY = 0;

// Event listeners for mouse events to draw on the canvas
canvas.addEventListener("mousedown", (e: MouseEvent) => {
  if (ctx) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (ctx) {
    draw(e);
  }
});

canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseout", () => (isDrawing = false));

function draw(e: MouseEvent) {
  if (ctx && isDrawing) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
}

// Create a container for buttons arranged horizontally
const buttonsContainer = document.createElement("div");
buttonsContainer.style.display = "flex";
buttonsContainer.style.justifyContent = "center"; // Center buttons horizontally
verticalContainer.append(buttonsContainer);

// Create and add the "Clear" button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.id = "clearButton";
buttonsContainer.append(clearButton);

// Clear button functionality
clearButton.addEventListener("click", () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});
