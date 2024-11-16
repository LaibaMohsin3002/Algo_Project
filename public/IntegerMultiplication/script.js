document.getElementById('start-btn').addEventListener('click', startVisualization);
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
// canvas.width = window.innerWidth * 1.0; // Adjust canvas width
// canvas.height = 1000;

let treeData = [];
let maxLevel = 0;
let animationStep = 0;
let animationDelay = 1500; // Delay for each level animation
let calculationsList = document.getElementById('calculations-list');
let resultContainer = document.getElementById('result');

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.split('\n').map(line => line.trim());

            // Check if there are at least 2 numbers in the file
            if (lines.length >= 2) {
                const number1 = lines[0];  // First number
                const number2 = lines[1];  // Second number

                // Display the numbers in the read-only section
                document.getElementById('number1-display').textContent = `Number 1: ${number1}`;
                document.getElementById('number2-display').textContent = `Number 2: ${number2}`;

                // You can optionally populate the input fields for editing (if needed)
                document.getElementById('number1').value = number1;
                document.getElementById('number2').value = number2;
            } else {
                alert('The file does not contain two numbers.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('No file selected.');
    }
}


function startVisualization() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    treeData = [];
    maxLevel = 0;
    animationStep = 0;
    calculationsList.innerHTML = '';
    resultContainer.textContent = '-';

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const numbers = content.split('\n').map(line => line.trim());
            if (numbers.length === 2) {
                const num1 = numbers[0];
                const num2 = numbers[1];

                // Dynamically calculate canvas width and height
                //canvas.width = window.innerWidth * 0.9; 
                const canvasWidth = Math.max(2500, maxLevel * 5000);  // Set width dynamically
                canvas.width = canvasWidth;
                canvas.height = Math.max(1500, maxLevel * 600);  // 300px per level, adjust if needed

                const horizontalOffset = 100; // Adjust this value as needed
                const finalResult = animateKaratsuba(num1, num2, canvas.width / 2 + horizontalOffset, 50, 0, canvas.width / 4, null);

                //const finalResult = animateKaratsuba(num1, num2, canvas.width / 2, 50, 0, canvas.width / 4, null);

                animateLevels(() => {
                    resultContainer.textContent = finalResult;
                });
            }
        };
        reader.readAsText(file);
    }
}

function animateKaratsuba(x, y, xPos, yPos, level, offset, parent) {
    maxLevel = Math.max(maxLevel, level);

    if (x.length === 1 || y.length === 1) {
        const result = parseInt(x) * parseInt(y);
        treeData.push({ x, y, result, xPos, yPos, level, type: 'leaf', parent });
        addCalculation(`${x} × ${y} = ${result}`);
        return result;
    }

    const n = Math.max(x.length, y.length);
    const m = Math.floor(n / 2);

    const a = x.slice(0, -m) || "0";
    const b = x.slice(-m) || "0";
    const c = y.slice(0, -m) || "0";
    const d = y.slice(-m) || "0";

    const nodeType = level % 2 === 0 ? 'leaf' : 'internal';  // Alternate between node types/colors
    treeData.push({ x, y, xPos, yPos, level, type: nodeType, parent });

    // Adjust spacing between child nodes with different angles for different node types
    const verticalSpacing = 200;
    const angleModifier = nodeType === 'leaf' ? 1.3 : 0.9;  // Different modifier based on node type

    const left = animateKaratsuba(a, c, xPos - offset * angleModifier, yPos + verticalSpacing, level + 1, offset / 2, { xPos, yPos });
    const right = animateKaratsuba(b, d, xPos + offset * angleModifier, yPos + verticalSpacing, level + 1, offset / 2, { xPos, yPos });
    const middle = animateKaratsuba(addStrings(a, b), addStrings(c, d), xPos, yPos + 2 * verticalSpacing, level + 2, offset / 2, { xPos, yPos });

    const result = Math.pow(10, 2 * m) * left + Math.pow(10, m) * (middle - left - right) + right;
    addCalculation(`Combine: 10^${2 * m} * ${left} + 10^${m} * (${middle} - ${left} - ${right}) + ${right} = ${result}`);
    return result;
}

function drawNode(node) {
    const { x, y, xPos, yPos, type, parent } = node;

    if (parent) {
        // Draw edges cleaner by connecting to the edge of the node
        const parentRadius = 40;
        const childRadius = 40;
        const parentEdgeX = parent.xPos;
        const parentEdgeY = parent.yPos;

        const angle = Math.atan2(yPos - parentEdgeY, xPos - parentEdgeX);
        const distance = Math.sqrt(Math.pow(yPos - parentEdgeY, 2) + Math.pow(xPos - parentEdgeX, 2));

        // Adjust the line to start from the node's edge
        ctx.beginPath();
        ctx.moveTo(parentEdgeX + Math.cos(angle) * parentRadius, parentEdgeY + Math.sin(angle) * parentRadius);
        ctx.lineTo(xPos + Math.cos(angle) * childRadius, yPos + Math.sin(angle) * childRadius);
        ctx.stroke();
    }

    const radius = 40;
    ctx.fillStyle = type === 'leaf' ? '#FF99BE' : '#4E8BC4';
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${x} × ${y}`, xPos, yPos + 5);
}

// Animate the levels with delay
function animateLevels(callback) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    treeData.forEach(node => {
        if (node.level <= animationStep) {
            drawNode(node);
        }
    });

    if (animationStep <= maxLevel) {
        setTimeout(() => {
            animationStep++;
            animateLevels(callback);
        }, animationDelay); // Delay between each level animation
    } else if (callback) {
        callback();
    }
}

// Add a calculation to the list
function addCalculation(text) {
    const li = document.createElement('li');
    li.textContent = text;
    calculationsList.appendChild(li);
}

// Helper to add strings
function addStrings(a, b) {
    let maxLength = Math.max(a.length, b.length);
    a = a.padStart(maxLength, '0');
    b = b.padStart(maxLength, '0');

    let carry = 0;
    let result = '';
    for (let i = maxLength - 1; i >= 0; i--) {
        const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
        carry = Math.floor(sum / 10);
        result = (sum % 10) + result;
    }
    if (carry > 0) {
        result = carry + result;
    }
    return result;
}
