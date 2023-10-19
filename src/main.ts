import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// Create a container for the canvas
const canvasContainer = document.createElement("div");
canvasContainer.style.display = "flex";
canvasContainer.style.flexDirection = "column"; // Align items vertically
app.append(canvasContainer);

// Create a canvas element
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.backgroundColor = "white";
canvas.style.border = "1px solid black";
canvas.style.borderRadius = "8px";
canvas.style.boxShadow = "4px 4px 6px rgba(0, 0, 0, 0.1)";
canvasContainer.append(canvas);
