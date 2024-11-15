// let svg = d3.select("svg");
// const duration = 1000; // Duration for animations

// document.getElementById('run').addEventListener('click', run);
// document.getElementById('clear').addEventListener('click', clearVisualization);

// function run() {
//     const num1 = document.getElementById('input1').value;
//     const num2 = document.getElementById('input2').value;
//     if (!num1 || !num2 || isNaN(num1) || isNaN(num2)) {
//         alert("Please enter valid numbers.");
//         return;
//     }

//     clearVisualization();
//     performMultiplication(num1, num2);
// }

// function clearVisualization() {
//     svg.selectAll("*").remove();
// }

// function performMultiplication(num1, num2) {
//     visualizeKaratsuba(num1, num2);
// }

// async function visualizeKaratsuba(x, y, depth = 0, xOffset = 0, yOffset = 50) {
//     // Base case: single-digit multiplication
//     if (x.length === 1 || y.length === 1) {
//         const product = (parseInt(x) * parseInt(y)).toString();
//         drawText(`${x} * ${y} = ${product}`, xOffset, yOffset);
//         await delay(duration);
//         return product;
//     }

//     const n = Math.max(x.length, y.length);
//     const halfN = Math.ceil(n / 2);

//     // Splitting the numbers
//     const x1 = x.slice(0, -halfN) || '0';
//     const x0 = x.slice(-halfN);
//     const y1 = y.slice(0, -halfN) || '0';
//     const y0 = y.slice(-halfN);

//     drawText(`Dividing ${x} into ${x1} and ${x0}`, 400 + xOffset, yOffset); // Centered around 400
//     drawText(`Dividing ${y} into ${y1} and ${y0}`, 400 + xOffset, yOffset + 30); // Adjust y-offset for spacing
//     await delay(duration);

//     // Recursively compute products
//     const z2 = await visualizeKaratsuba(x1, y1, depth + 1, xOffset + 80, yOffset + 80);
//     const z0 = await visualizeKaratsuba(x0, y0, depth + 1, xOffset - 80, yOffset + 80);
//     const z1 = await visualizeKaratsuba(
//         (BigInt(x1) + BigInt(x0)).toString(),
//         (BigInt(y1) + BigInt(y0)).toString(),
//         depth + 1,
//         xOffset,
//         yOffset + 160
//     );

//     const product = BigInt(z2) * BigInt(10 ** (2 * halfN)) +
//                     (BigInt(z1) - BigInt(z2) - BigInt(z0)) * BigInt(10 ** halfN) +
//                     BigInt(z0);

//     drawText(`Combining results: ${x1} * ${y1} + (${x1}+${x0})*(${y1}+${y0}) - ${x0}*${y0} = ${product}`, 400 + xOffset, yOffset + 240);
//     await delay(duration);

//     return product.toString();
// }

// function drawText(text, x, y) {
//     svg.append("text")
//         .attr("x", Math.min(Math.max(x, 20), 780)) // Ensures text is within bounds of 800-width SVG
//         .attr("y", y)
//         .attr("text-anchor", "middle") // Centers the text horizontally around the x coordinate
//         .attr("class", "text-label")
//         .text(text);
// }

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


let svg = d3.select("svg");
const duration = 1000; // Duration for animations

document.getElementById('run').addEventListener('click', run);
document.getElementById('clear').addEventListener('click', clearVisualization);

function run() {
    const num1 = document.getElementById('input1').value;
    const num2 = document.getElementById('input2').value;
    if (!num1 || !num2 || isNaN(num1) || isNaN(num2)) {
        alert("Please enter valid numbers.");
        return;
    }

    clearVisualization();
    performMultiplication(num1, num2);
}

function clearVisualization() {
    svg.selectAll("*").remove();
}

function performMultiplication(num1, num2) {
    visualizeKaratsuba(num1, num2, 0, 400, 50); // Start at the center of the SVG with vertical spacing
}

async function visualizeKaratsuba(x, y, depth, xOffset, yOffset) {
    // Base case: single-digit multiplication
    if (x.length === 1 || y.length === 1) {
        const product = (parseInt(x) * parseInt(y)).toString();
        drawText(`${x} * ${y} = ${product}`, xOffset, yOffset);
        await delay(duration);
        return product;
    }

    const n = Math.max(x.length, y.length);
    const halfN = Math.ceil(n / 2);

    // Splitting the numbers
    const x1 = x.slice(0, -halfN) || '0';
    const x0 = x.slice(-halfN);
    const y1 = y.slice(0, -halfN) || '0';
    const y0 = y.slice(-halfN);

    // Visualize the division of x and y
    drawText(`Dividing ${x} into ${x1} and ${x0}`, xOffset, yOffset);
    drawText(`Dividing ${y} into ${y1} and ${y0}`, xOffset, yOffset + 30);
    await delay(duration);

    // Calculate subproblems recursively and adjust the horizontal offsets for a "tree" structure
    const z2 = await visualizeKaratsuba(x1, y1, depth + 1, xOffset - 150, yOffset + 80);
    const z0 = await visualizeKaratsuba(x0, y0, depth + 1, xOffset + 150, yOffset + 80);
    const z1 = await visualizeKaratsuba(
        (BigInt(x1) + BigInt(x0)).toString(),
        (BigInt(y1) + BigInt(y0)).toString(),
        depth + 1,
        xOffset,
        yOffset + 160
    );

    const product = BigInt(z2) * BigInt(10 ** (2 * halfN)) +
                    (BigInt(z1) - BigInt(z2) - BigInt(z0)) * BigInt(10 ** halfN) +
                    BigInt(z0);

    // Visualize the combination of results
    drawText(`Combining: ${x1} * ${y1} + (${x1}+${x0})*(${y1}+${y0}) - ${x0}*${y0} = ${product}`, xOffset, yOffset + 240);
    await delay(duration);

    return product.toString();
}

function drawText(text, x, y) {
    svg.append("text")
        .attr("x", Math.min(Math.max(x, 20), 780)) // Ensures text is within bounds of 800-width SVG
        .attr("y", y)
        .attr("text-anchor", "middle") // Centers the text horizontally around the x coordinate
        .attr("class", "text-label")
        .text(text);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
