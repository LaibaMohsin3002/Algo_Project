document.getElementById('start-btn').addEventListener('click', startVisualization);
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8; // Adjust canvas width
canvas.height = 10000;

let treeData = [];
let maxLevel = 0;
let animationStep = 0;
let animationDelay = 500;
let calculationsList = document.getElementById('calculations-list');
let resultContainer = document.getElementById('result');

// Handle file input
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const numbers = content.split('\n').map(line => line.trim());
            if (numbers.length === 2) {
                document.getElementById('number1').value = numbers[0];
                document.getElementById('number2').value = numbers[1];
            }
        };
        reader.readAsText(file);
    }
}

// Start visualization with file input
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
                const finalResult = animateKaratsuba(num1, num2, canvas.width / 2, 50, 0, canvas.width / 4, null);

                animateLevels(() => {
                    resultContainer.textContent = finalResult;
                });
            }
        };
        reader.readAsText(file);
    }
}

// Karatsuba algorithm visualization with improvements
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

    treeData.push({ x, y, xPos, yPos, level, type: 'internal', parent });

    // Recursive calls
    const left = animateKaratsuba(a, c, xPos - offset, yPos + 150, level + 1, offset / 2, { xPos, yPos });
    const right = animateKaratsuba(b, d, xPos + offset, yPos + 150, level + 1, offset / 2, { xPos, yPos });
    const middle = animateKaratsuba(addStrings(a, b), addStrings(c, d), xPos, yPos + 300, level + 2, offset / 2, { xPos, yPos });

    const result = Math.pow(10, 2 * m) * left + Math.pow(10, m) * (middle - left - right) + right;
    addCalculation(`Combine: 10^${2 * m} * ${left} + 10^${m} * (${middle} - ${left} - ${right}) + ${right} = ${result}`);
    return result;
}

// Animate the levels
function animateLevels(callback) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    treeData.forEach(node => {
        if (node.level <= animationStep) {
            drawNode(node);
        }
    });

    if (animationStep <= maxLevel) {
        animationStep++;
        requestAnimationFrame(() => animateLevels(callback)); // Smooth animation
    } else if (callback) {
        callback();
    }
}

// Draw a node with more spacing between child nodes
function drawNode(node) {
    const { x, y, xPos, yPos, type, parent } = node;

    if (parent) {
        ctx.beginPath();
        ctx.moveTo(parent.xPos, parent.yPos);
        ctx.lineTo(xPos, yPos);
        ctx.stroke();
    }

    const radius = 30;
    ctx.fillStyle = type === 'leaf' ? '#FF6347' : '#4682B4';
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${x} × ${y}`, xPos, yPos + 5);
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
