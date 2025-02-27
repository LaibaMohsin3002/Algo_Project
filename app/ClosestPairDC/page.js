"use client";
import { useRef, useState } from "react";
import "./ClosestPair.css";
import * as d3 from "d3";

const duration = 1600;

export default function Home() {
  const [points, setPoints] = useState([]);
  const svgRef = useRef(null);
  const cancelRef = useRef(false);
  const [minDistance, setMinDistance] = useState(null);
  const [closePair, setClosePair] = useState([]);

  const svgWidth = 800;
  const svgHeight = 600;
  const margin = { top: 20, right: 40, bottom: 20, left: 40 };

  let xScale;
  let yScale;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsedPoints = content
        .trim()
        .split("\n")
        .map((line) => {
          const [x, y] = line.split(",").map(Number);
          return { x, y };
        });
      setPoints(parsedPoints);
      drawCoordinates(parsedPoints);
    };
    reader.readAsText(file);
  };

  const clearButton = () => {
    setPoints([]);
    setMinDistance(null);
    cancelRef.current = true;
    d3.select(svgRef.current).selectAll("*").remove();
  };

  const drawCoordinates = (points) => {
    const svg = d3.select(svgRef.current);

    svg.append("g").attr("id", "axes");

    // Get min and max values for x and y
    const xExtent = d3.extent(points, (d) => d.x);
    const yExtent = d3.extent(points, (d) => d.y);

    // Defining scales
    xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 10, xExtent[1] + 10]) // Add padding to prevent points from sitting on edges or axes of svg
      .range([margin.left, svgWidth - margin.right]);

    yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 10, yExtent[1] + 10])
      .range([svgHeight - margin.bottom, margin.top]);

    // Drawing axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg
      .select("#axes")
      .append("g")
      .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
      .call(xAxis);

    svg
      .select("#axes")
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // Plot points according to scaling applied
    svg
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3)
      .attr("class", "point")
      .attr("data-x", (d) => d.x)
      .attr("data-y", (d) => d.y)
      .on("mouseover", function (event, d) {
        showTooltip(event, d);
      })
      .on("mouseout", hideTooltip);
  };

  const showTooltip = (event, point) => {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(`(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`)
      .style("left", `${event.pageX + 5}px`)
      .style("top", `${event.pageY + 5}px`);
  };

  const hideTooltip = () => {
    d3.select("#tooltip").transition().duration(200).style("opacity", 0);
  };

  const runButton = async () => {
    cancelRef.current = false; // Reset cancel flag
    d3.select(svgRef.current).selectAll(".distance-line").remove();
    d3.select(svgRef.current).selectAll(".midpoint-line").remove();
    const pointsX = points.slice().sort((a, b) => a.x - b.x);
    const pointsY = points.slice().sort((a, b) => a.y - b.y);
    try {
      const [finalPair, finalLine] = await ClosestPairRecursive(
        pointsX,
        pointsY,
        null,
        null
      );
      if (!cancelRef.current && finalPair) {
        setMinDistance(distance(finalPair[0], finalPair[1]).toFixed(2));
        setClosePair(finalPair);
      }
    } catch (error) {}
  };

  const distance = (p1, p2) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  const drawMidpoint = (x) => {
    const xExtent = d3.extent(points, (d) => d.x);
    const yExtent = d3.extent(points, (d) => d.y);

    xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 10, xExtent[1] + 10])
      .range([margin.left, svgWidth - margin.right]);

    yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 10, yExtent[1] + 10])
      .range([svgHeight - margin.bottom, margin.top]);

    // Apply the scale to the x value to get the pixel position
    const xScaled = xScale(x);

    return d3
      .select(svgRef.current)
      .append("line")
      .attr("x1", xScaled)
      .attr("y1", 0)
      .attr("x2", xScaled)
      .attr("y2", svgHeight)
      .attr("class", "midpoint-line")
      .attr("stroke", "gray");
  };

  // Function to draw a pair of points with distance line
  const findDistance = (pair) => {
    const xExtent = d3.extent(points, (d) => d.x);
    const yExtent = d3.extent(points, (d) => d.y);

    xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 10, xExtent[1] + 10])
      .range([margin.left, svgWidth - margin.right]);

    yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 10, yExtent[1] + 10])
      .range([svgHeight - margin.bottom, margin.top]);

    // Scale the coordinates of the points using xScale and yScale
    const x1 = xScale(pair[0].x); // Map x1 to pixel value
    const y1 = yScale(pair[0].y); // Map y1 to pixel value
    const x2 = xScale(pair[1].x);
    const y2 = yScale(pair[1].y); 

    // Distance between the two points
    const dist = Math.sqrt(
      (pair[0].x - pair[1].x) ** 2 + (pair[0].y - pair[1].y) ** 2
    ).toFixed(2);

    const group = d3
      .select(svgRef.current)
      .append("g")
      .attr("class", "pair-group");

    // Append the line element between points
    group
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("class", "distance-line")
      .attr("stroke-width", 2);

    // Calculate midpoint for the distance label (the text Dist that shows distance)
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Append the distance label
    group
      .append("text")
      .attr("x", midX)
      .attr("y", midY - 5) // Position slightly above the midpoint
      .attr("class", "distance-label")
      .attr("text-anchor", "middle")
      .attr("stroke", "red")
      .text(`Dist: ${dist}`);

    return group;
  };

  // Function to highlight a subproblem area
  const showSubproblem = (xStart, xEnd, className) => {
    const xExtent = d3.extent(points, (d) => d.x);
    const yExtent = d3.extent(points, (d) => d.y);
    
    xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 10, xExtent[1] + 10]) 
      .range([margin.left, svgWidth - margin.right]);

    yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 10, yExtent[1] + 10])
      .range([svgHeight - margin.bottom, margin.top]);
    const xStartScaled = xScale(xStart); 
    const xEndScaled = xScale(xEnd);

    return d3
      .select(svgRef.current)
      .append("rect")
      .attr("x", xStartScaled)
      .attr("y", 0)
      .attr("width", Math.max(0, xEndScaled - xStartScaled))
      .attr("height", svgHeight)
      .attr("class", className);
  };

  const bruteForce = (points) => {
    let minDistance = Infinity;
    let closestPair = [];
    for (let i = 0; i < points.length; ++i) {
      for (let j = i + 1; j < points.length; ++j) {
        let dist = distance(points[i], points[j]);
        if (dist < minDistance) {
          minDistance = dist;
          closestPair = [points[i], points[j]];
        }
      }
    }
    return closestPair;
  };

  const ClosestPairRecursive = async (
    pointsX,
    pointsY,
    leftLimit,
    rightLimit
  ) => {
    if (cancelRef.current) return [null, null];
    const subproblem = showSubproblem(leftLimit, rightLimit, "subproblem");
    await delay(duration);

    if (cancelRef.current) {
      subproblem.remove();
      return [null, null];
    }

    if (pointsX.length <= 3) {
      const closestPair = bruteForce(pointsX);
      const pair = findDistance(closestPair);
      await delay(duration);
      if (cancelRef.current) {
        subproblem.remove();
        return [null, null];
      }
      subproblem.remove();
      return [closestPair, pair];
    }

    const midIdx = Math.floor(pointsX.length / 2);
    const midPoint = pointsX[midIdx];
    const midPointX = pointsX[midIdx].x;
    const dividingLine = drawMidpoint(midPointX);
    await delay(duration);
    if (cancelRef.current) {
      subproblem.remove();
      dividingLine.remove();
      return [null, null];
    }

    subproblem.remove();

    const leftSubproblemrightLimit = midPointX;
    const leftSubproblemleftLimit =
      leftLimit !== null ? leftLimit : pointsX[0].x;

    const [leftPair, leftLine] = await ClosestPairRecursive(
      pointsX.slice(0, midIdx),
      pointsY.filter((p) => p.x < midPointX),
      leftSubproblemleftLimit,
      leftSubproblemrightLimit
    );

    const rightSubproblemleftLimit = midPointX;
    const rightSubproblemrightLimit =
      rightLimit !== null ? rightLimit : pointsX[pointsX.length - 1].x;

    if (cancelRef.current) {
      subproblem.remove();
      dividingLine.remove();
      return [null, null];
    }

    const [rightPair, rightLine] = await ClosestPairRecursive(
      pointsX.slice(midIdx),
      pointsY.filter((p) => p.x >= midPointX),
      rightSubproblemleftLimit,
      rightSubproblemrightLimit
    );

    const leftBlock = showSubproblem(
      leftSubproblemleftLimit,
      leftSubproblemrightLimit,
      "left-right-combined"
    );
    const rightBlock = showSubproblem(
      rightSubproblemleftLimit,
      rightSubproblemrightLimit,
      "left-right-combined"
    );

    let closestPair = leftPair;
    let bestPairDistance = leftLine;
    let notbestPairDistance = rightLine;
    let minDistance = distance(leftPair[0], leftPair[1]);

    if (minDistance > distance(rightPair[0], rightPair[1])) {
      minDistance = distance(rightPair[0], rightPair[1]);
      closestPair = rightPair;
      bestPairDistance = rightLine;
      notbestPairDistance = leftLine;
    }
    await delay(duration);

    notbestPairDistance.remove();
    await delay(duration);

    const stripLeftLimit = midPoint.x - minDistance;
    const stripRightLimit = midPoint.x + minDistance;

    const highlightStrip = showSubproblem(stripLeftLimit, stripRightLimit, "strip");

    await delay(duration);

    let isPairUpdated = false;
    const strip = pointsY
      .filter((p) => Math.abs(p.x - midPoint.x) < minDistance)
      .sort((a, b) => a.y - b.y);
    for (let i = 0; i < strip.length; ++i) {
      for (
        let j = i + 1;
        j < strip.length && strip[j].y - strip[i].y < minDistance;
        ++j
      ) {
        if (distance(strip[i], strip[j]) < minDistance) {
          minDistance = distance(strip[i], strip[j]);
          closestPair = [strip[i], strip[j]];
          isPairUpdated = true;
        }
      }
    }

    if (isPairUpdated) {
      leftLine.remove();
      rightLine.remove();
      bestPairDistance = findDistance(closestPair);
      await delay(duration);
    }

    leftBlock.remove();
    rightBlock.remove();
    dividingLine.remove();
    highlightStrip.remove();
    await delay(duration);
    return [closestPair, bestPairDistance];
  };

  return (
    <div id="_container">
      <h1>CLOSEST PAIR OF POINTS VISUALIZATION</h1>
      <div className="main-container">
        <div className="input-container">
          <label htmlFor="fileInput">Upload File with Sample Inputs:</label>
          <input
            type="file"
            id="fileInput"
            accept=".txt"
            onChange={handleFileUpload}
          />
          <button id="btn" onClick={runButton}>
            Start Visualization
          </button>
          <button id="btn" onClick={clearButton}>
            Clear Visualization
          </button>
          {minDistance !== null && (
            <div id="result-container">
              <p>Minimum Distance: {minDistance}</p>
              <p>Final Pair: {JSON.stringify(closePair)}</p>
            </div>
          )}
        </div>

        <div
          id="tooltip"
          style={{
            position: "absolute",
            background: "gray",
            padding: "5px",
            opacity: 0,
          }}
        ></div>
        <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
      </div>
    </div>
  );
}
