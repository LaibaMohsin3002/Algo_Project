document.getElementById('start-btn').addEventListener('click', startVisualization);
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

let treeData = [];
let maxLevel = 0;
let animationStep = 0;
let animationDelay = 1500; // Delay for each level animation
let calculationsList = document.getElementById('calculations-list');
let resultContainer = document.getElementById('result');

let num1 = '';  // Store the first number globally
let num2 = '';  // Store the second number globally

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            const lines = content.split('\n').map(line => line.trim());

            if (lines.length >= 2) {
                num1 = lines[0];  // Store the first number
                num2 = lines[1];  // Store the second number

                document.getElementById('number1-display').textContent = `Number 1: ${num1}`;
                document.getElementById('number2-display').textContent = `Number 2: ${num2}`;
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
    if (!num1 || !num2) {
        alert("Please upload a file with two numbers.");
        return;  // Ensure the numbers are available before proceeding
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    treeData = [];
    maxLevel = 0;
    animationStep = 0;
    calculationsList.innerHTML = '';
    resultContainer.textContent = '-';

    canvas.width = Math.max(2500, maxLevel * 5000);
    canvas.height = Math.max(1500, maxLevel * 600);

    const horizontalOffset = 50; // Reduced offset for compact edges
    const finalResult = animateKaratsuba(
        num1,
        num2,
        canvas.width / 2 + horizontalOffset,
        50,
        0,
        canvas.width / 6, // Smaller initial offset
        null
    );

    // Animate the levels and display the final result
    animateLevels(() => {
        resultContainer.textContent = finalResult;
    });
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

    x = x.padStart(n, '0');
    y = y.padStart(n, '0');

    const a = x.slice(0, -m) || '0';
    const b = x.slice(-m) || '0';
    const c = y.slice(0, -m) || '0';
    const d = y.slice(-m) || '0';

    treeData.push({ x, y, xPos, yPos, level, type: 'internal', parent });

    const verticalSpacing = 100 * (level + 1);  // Dynamically adjust vertical spacing
    const left = animateKaratsuba(
        a,
        c,
        xPos - offset,
        yPos + verticalSpacing,
        level + 1,
        offset / 2, // Shrinking offset for shorter edges
        { xPos, yPos }
    );
    const right = animateKaratsuba(
        b,
        d,
        xPos + offset,
        yPos + verticalSpacing,
        level + 1,
        offset / 2,
        { xPos, yPos }
    );
    const middle = animateKaratsuba(
        addStrings(a, b),
        addStrings(c, d),
        xPos,
        yPos + 2 * verticalSpacing,
        level + 2,
        offset / 2,
        { xPos, yPos }
    );

    const result =
        Math.pow(10, 2 * m) * left +
        Math.pow(10, m) * (middle - left - right) +
        right;
    treeData.push({
        x: x,
        y: y,
        result: result,
        xPos: xPos,
        yPos: yPos + 3 * verticalSpacing,
        level: level + 3,
        type: 'combine',
        parent: parent
    });
    addCalculation(
        `Combine: 10^${2 * m} * ${left} + 10^${m} * (${middle} - ${left} - ${right}) + ${right} = ${result}`
    );
    return result;
}

function drawNode(node) {
    const { x, y, result, xPos, yPos, type, parent } = node;

    if (parent) {
        const parentRadius = 40; // Parent circle radius
        const childRadius = 20;  // Child circle radius
        const parentEdgeX = parent.xPos;
        const parentEdgeY = parent.yPos;

        // Calculate the angle for the edge line
        const angle = Math.atan2(yPos - parentEdgeY, xPos - parentEdgeX);
        ctx.beginPath();
        ctx.moveTo(
            parentEdgeX + Math.cos(angle) * parentRadius,
            parentEdgeY + Math.sin(angle) * parentRadius
        );
        ctx.lineTo(
            xPos - Math.cos(angle) * childRadius,
            yPos - Math.sin(angle) * childRadius
        );
        ctx.stroke();
    }

    const radius = 30;
    ctx.fillStyle =
        type === 'leaf' ? '#FF99BE' : type === 'combine' ? '#FFD966' : '#4E8BC4';
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(
        type === 'combine' ? result : `${x} × ${y}`,
        xPos,
        yPos + 5
    );
}

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
        }, animationDelay);
    } else if (callback) {
        callback();
    }
}

function addCalculation(text) {
    const li = document.createElement('li');
    li.textContent = text;
    calculationsList.appendChild(li);
}

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
