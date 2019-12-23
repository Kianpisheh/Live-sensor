import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

import ChartBox from "./components/ChartBox";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://100.64.81.146:9000/web-app"
    };
    this.socket = new socketIOClient();

    // graph-related attributes
    this.data = new Array(100).fill(0);
    this.labels = [...this.data.keys()];
    this.newLabel = 101;
    this.d = 0;
  }

  render() {
    this.data.push(this.d);
    this.data.shift();
    return (
      <div className="App">
        <header className="App-header">
          <ChartBox
            newData={this.d}
            data={this.data}
            labels={this.labels}
            idx={this.newLabel}
          ></ChartBox>
        </header>
      </div>
    );
  }

  componentDidMount() {
    const { endpoint } = this.state;
    //Very simply connect to the socket
    this.socket = socketIOClient(endpoint);
    //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
    this.socket.on("sensor_data_for_web_client", data => {
      this.d = data;
      this.newLabel += 1;
      if (this.newLabel % 10 === 0) {
        this.forceUpdate();
      }
    });
  }
}

export default App;
