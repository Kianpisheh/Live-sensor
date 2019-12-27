import React, { Component } from "react";
//import * as d3 from "d3";
//import AppContext from "../AppContext";

const width = 500;
const height = 250;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

class LineChart extends Component {
  //static contextType = AppContext;

  constructor(props, context) {
    super(props);
    this.sampleNum = 500;
    this.canvas = null;
    this.canvasContext = null;
    this.prevPoint = null;
    this.sample_num = 1;
    this.data = null;
    this.dataRange = [-50, 50];
    this.valueTickSize = this.getValueTickSize(this.dataRange);
    // tick size
    this.xTicksNum = 20;
    this.xTicksSize = this.sampleNum / this.xTicksNum;
    this.yTicksNum = 10;
    this.yTicksSize = (this.dataRange[1] - this.dataRange[0]) / this.yTicksNum;

    // method binding :(
    this.getCoordinates = this.getCoordinates.bind(this);
    this.drawLine = this.drawLine.bind(this);
    this.drawTimeAxis = this.drawTimeAxis.bind(this);
    this.drawValueAxis = this.drawValueAxis.bind(this);
    this.drawGrids = this.drawGrids.bind(this);
    this.drawTick = this.drawTick.bind(this);
    this.yScale2 = this.yScale2.bind(this);
    this.xScale = this.xScale.bind(this);
    this.yScaleInv = this.yScaleInv.bind(this);
    this.getRange = this.getRange.bind(this);
    this.getValueTickSize = this.getValueTickSize.bind(this);
  }

  getValueTickSize(dataRange) {
    let tickSize = 5;
    if (dataRange[0] !== dataRange[1]) {
      tickSize = Math.floor((height - margin.top - margin.bottom) / 10);
    }
    return tickSize;
  }

  getRange(dataRange) {
    let range = [];
    if (dataRange[0] === dataRange[1]) {
      range = [dataRange[0] - 1, dataRange[0] + 1];
    } else {
      range = dataRange;
    }
    return range;
  }

  yScale2(y) {
    return Math.floor(
      height -
        margin.bottom -
        ((y - this.dataRange[0]) / (this.dataRange[1] - this.dataRange[0])) *
          (height - margin.top - margin.bottom)
    );
  }

  xScale(x) {
    return Math.floor(
      margin.left +
        (x / (this.sampleNum - 1)) * (width - margin.left - margin.right)
    );
  }

  yScaleInv(p) {
    return (
      this.dataRange[0] +
      (this.dataRange[1] - this.dataRange[0]) *
        ((height - margin.bottom - p) / (height - margin.top - margin.bottom))
    );
  }

  render() {
    if (this.props.data) {
      this.data = this.props.data;
    }
    if (this.data) {
      // acquire and scale the data point
      const point = this.getCoordinates(this.data);
      if (this.axesContext && this.canvasContext) {
        this.drawTimeAxis(point[0]);
        this.drawValueAxis();
        this.drawGrids();
        this.drawLine(point);
      }
      this.prevPoint = point;
    }

    return (
      <div id="linechart_canvases">
        <canvas
          id="layer1"
          ref={"axesAndGridCanvas"}
          width={width}
          height={height}
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            zIndex: 0
          }}
        ></canvas>
        <canvas
          id="layer2"
          ref={"canvas"}
          width={width}
          height={height}
          style={{
            backgroundColor: "transparent",
            zIndex: 1
          }}
        ></canvas>
      </div>
    );
  }

  // darwing methods
  drawLine(point) {
    // find the shift step
    let step =
      Math.round(this.xScale(this.sample_num)) -
      Math.round(this.xScale(this.sample_num - 1));

    // get the remaining data
    let oldData = this.canvasContext.getImageData(
      margin.left + step,
      margin.top,
      width - margin.right - margin.left - step,
      height - margin.top - margin.bottom
    );

    this.sample_num += 1;

    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // shift and re-draw the old data
    this.canvasContext.putImageData(oldData, margin.left, margin.top);

    // draw the new data
    if (this.prevPoint === null) {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(width - margin.right, height - margin.bottom);
      this.canvasContext.stroke();
      this.canvasContext.closePath();
    } else {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(
        width - margin.right - step,
        Math.round(this.yScale2(this.prevPoint[1]))
      );
      this.canvasContext.lineTo(
        width - margin.right,
        Math.round(this.yScale2(point[1]))
      );
      this.canvasContext.stroke();
      this.canvasContext.closePath();
    }
  }

  drawValueAxis() {
    // draw the horizontaal line
    this.axesContext.beginPath();
    this.axesContext.strokeStyle = "#000000";
    this.axesContext.lineWidth = 2;
    this.axesContext.moveTo(Math.round(this.xScale(0)), margin.top);
    this.axesContext.lineTo(Math.round(this.xScale(0)), height - margin.bottom);
    this.axesContext.stroke();
    this.axesContext.closePath();
  }

  drawGrids() {
    this.axesContext.beginPath();
    this.axesContext.strokeStyle = "#E1E1E1";
    this.axesContext.lineWidth = 1;

    // virtical grids
    for (let i = 1; i < this.xTicksNum; i++) {
      const tickLocation = this.xScale(i * this.xTicksSize);
      this.axesContext.moveTo(tickLocation, height - margin.bottom);
      this.axesContext.lineTo(tickLocation, margin.bottom);
    }

    // horizontal grids
    let y = height - margin.bottom;
    const step =
      this.yScale2(2 * this.yTicksNum) - this.yScale2(this.yTicksNum);
    for (let i = 0; i < this.yTicksNum; i++) {
      this.axesContext.moveTo(margin.left, y);
      this.axesContext.lineTo(width - margin.right, y);
      y += step;
    }

    this.axesContext.stroke();
    this.axesContext.closePath();

    // draw horizontal ticks
    this.axesContext.beginPath();
    this.axesContext.strokeStyle = "#000000";
    this.axesContext.lineWidth = 2;

    y = height - margin.bottom;
    for (let i = 0; i < this.yTicksNum; i++) {
      this.drawTick(y, "horizontal");
      this.axesContext.fillText(
        this.dataRange[0] + i * this.yTicksSize,
        margin.left - 20,
        y
      );
      y += step;
    }
    this.axesContext.stroke();
    this.axesContext.closePath();
  }

  drawTimeAxis(time) {
    // draw the horizontaal line
    this.axesContext.clearRect(0, 0, width, height);
    this.axesContext.beginPath();
    this.axesContext.moveTo(this.xScale(0), height - margin.bottom);
    this.axesContext.lineTo(
      this.xScale(this.sampleNum),
      height - margin.bottom
    );

    // draw the ticks
    for (let i = 0; i < this.xTicksNum; i++) {
      const tickLocation = this.xScale(i * this.xTicksSize);
      this.drawTick(tickLocation, "vertical");
      this.axesContext.fillText(
        i * this.xTicksSize,
        tickLocation - 6,
        height - margin.bottom + 13
      );
    }
    this.axesContext.stroke();
    this.axesContext.closePath();
  }

  drawTick(p, direction) {
    if (direction === "vertical") {
      this.axesContext.moveTo(p, height - margin.bottom);
      this.axesContext.lineTo(p, height - margin.bottom - 3);
    } else if (direction === "horizontal") {
      this.axesContext.moveTo(margin.left, p);
      this.axesContext.lineTo(margin.left + 5, p);
    }
  }

  getCoordinates(data) {
    const { value, timestamp } = data;
    return [timestamp, value];
  }

  componentDidUpdate() {
    if (this.dataRange !== this.props.dataRange) {
      this.valueTickSize = this.getValueTickSize(this.dataRange);
    }
  }

  componentDidMount() {
    this.canvas = this.refs.canvas;
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.lineWidth = 2;
    this.axesCanvas = this.refs.axesAndGridCanvas;
    this.axesContext = this.axesCanvas.getContext("2d");
    this.axesContext.lineWidth = 2;

    //
    this.lastTick = this.context.timeWindow;
    this.lastTime = 0;
  }
}

export default LineChart;
