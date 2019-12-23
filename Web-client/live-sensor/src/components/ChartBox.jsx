import React, { Component } from "react";

import { Line } from "react-chartjs-2";

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
              min: -50
            }
          }
        ]
      },
      tooltips: { enabled: false },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0 // animation duration after a resize};
    };
    this.chartData = {
      labels: props.labels,
      datasets: [
        {
          label: "Sensor Data",
          data: props.data,
          lineTension: 0.2,
          fill: false,
          borderColor: "rgba(0, 0, 0, 1)",
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  }

  render() {
    this.chartData.datasets[0].data = this.props.data;
    this.chartData.labels = this.props.labels;
    return (
      <div style={{ position: "relative", width: 500, height: 300 }}>
        <h6>Line Chart</h6>
        <Line
          ref={reference => (this.chartReference = reference)}
          data={this.chartData}
          options={this.lineOptions}
        ></Line>
      </div>
    );
  }

  componentDidUpdate() {
    let lineChart = this.chartReference.chartInstance;
    lineChart.update();
  }

  componentDidMount() {
    console.log(this.chartReference); // returns a Chart.js instance reference
  }
}

export default ChartBox;
