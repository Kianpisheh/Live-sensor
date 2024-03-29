import React, { Component } from "react";
//import Select from "@material-ui/core/Select";
import LineChart from "./LineChart";

class ChartBox extends Component {
  chartReference = {};

  constructor(props) {
    super(props);
    this.lineOptions = {
      scales: {
        yAxes: [
          {
            ticks: {
              max: 50,
              min: -50,
              minRotation: 0,
              maxRotation: 0,
              sampleSize: 100
            }
          }
        ],
        xAxes: [{ ticks: { minRotation: 0, maxRotation: 50, sampleSize: 500 } }]
      },
      tooltips: { enabled: false },
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
      responsiveAnimationDuration: 0
    };
    this.chartData = {
      labels: props.labels,
      datasets: [
        {
          label: "Sensor Data",
          data: props.data,
          lineTension: 0.0,
          fill: false,
          borderColor: "rgba(0, 0, 0, 1)",
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  }

  render() {
    const { buffer, dataEntry } = this.props.drawingRequest;
    this.chartData.datasets[0].data = buffer[dataEntry];
    this.chartData.labels = this.props.labels;

    // this is the input for the canvas version
    const sensorValue = buffer[dataEntry][buffer[dataEntry].length - 1];
    const sampleNum = this.props.sampleNum;
    const data = { value: sensorValue, timestamp: sampleNum };

    return (
      <div style={{ position: "relative", width: 500, height: 300 }}>
        <DataSelector
          onSensorChanged={this.props.onSensorChanged}
          key={"selector_" + this.props.id}
          id={this.props.id}
          drawingRequest={this.props.drawingRequest}
        ></DataSelector>
        <LineChart data={data}></LineChart>
      </div>
    );
  }
}

export default ChartBox;

function DataSelector(props) {
  const dataToDraw = ["x axis", "y axis", "z axis"];
  const sensors = {
    acc: dataToDraw,
    gyro: dataToDraw,
    rot: dataToDraw,
    grav: dataToDraw
  };
  const { id, drawingRequest } = props;

  return (
    <div className={"sensor_selector"}>
      <select
        className="sensor_selectors"
        key={"sensor_selector_" + id}
        value={drawingRequest.sensor}
        onChange={event => {
          props.onSensorChanged(event.target.value, props.id, true);
        }}
      >
        {Object.keys(sensors).map(sensor => (
          <option key={sensor + props.id} id={props.id}>
            {sensor}
          </option>
        ))}
      </select>
      <select
        className="sensor_selectors"
        key={"sensor_data_selector_" + id}
        value={drawingRequest.dataToDraw}
        onChange={event => {
          props.onSensorChanged(event.target.value, id, false);
        }}
      >
        {sensors[drawingRequest.sensor].map(sensor => (
          <option key={sensor + id} id={id}>
            {sensor}
          </option>
        ))}
      </select>
    </div>
  );
}
