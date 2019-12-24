import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import WebWorker from "./WebWorker";
import SocketThread from "./SocketThread";

import "./App.css";

import ChartBox from "./components/ChartBox";
import ConnectionTab from "./components/ConnectionTab";

class App extends Component {
  constructor() {
    super();
    this.state = {
      address: "100.64.81.146",
      port: 9000,
      drawingRequests: [{ id: 0, sensor: "acc", dataToDraw: "x axis" }],
      connected: false
    };

    // bind methods
    this.onSensorChanged = this.onSensorChanged.bind(this);
    this.onAddressChanged = this.onAddressChanged.bind(this);
    this.onConnectBtnClicked = this.onConnectBtnClicked.bind(this);

    this.socketThread = new WebWorker(SocketThread);
    this.socket = new socketIOClient();

    // graph-related attributes
    const d_length = 500;
    this.data = new Array(d_length).fill(0);
    this.labels = [...this.data.keys()];
    this.newLabel = d_length + 1;
    this.d = 0;
  }

  render() {
    this.data.push(this.d);
    this.data.shift();
    return (
      <div className="App">
        <header className="App-header">
          <ConnectionTab
            onAddressChanged={this.onAddressChanged}
            connected={this.state.connected}
            onConnectBtnClicked={this.onConnectBtnClicked}
          ></ConnectionTab>
          {this.state.drawingRequests.map(request => (
            <ChartBox
              key={request.id}
              id={request.id}
              drawingRequest={request}
              newData={this.d}
              data={this.data}
              labels={this.labels}
              idx={this.newLabel}
              onSensorChanged={this.onSensorChanged}
            ></ChartBox>
          ))}
        </header>
      </div>
    );
  }

  // event handlers
  onSensorChanged(value, chartID, isSensor) {
    let drawingRequest = this.state.drawingRequests;
    drawingRequest.forEach(request => {
      if (request.id === chartID) {
        if (isSensor) {
          request.sensor = value;
        } else {
          request.dataToDraw = value;
        }
      }
    });
    this.setState({ drawingRequest });
  }

  onAddressChanged(value, isAddress) {
    if (isAddress) {
      this.setState({ address: value });
    } else {
      this.setState({ port: parseInt(value) });
    }
  }

  onConnectBtnClicked() {
    if (!this.state.connected) {
      const { address, port } = this.state;
      this.socket = socketIOClient(
        "http://" + address + ":" + port + "/web-app"
      );

      // var socketThread = new WebWorker(SocketThread);
      // socketThread.postMessage({
      //   socket: this.socket
      // });

      // socketThread.onmessage = e => {
      //   console.log("asjhgkahjs");
      // };

      // //Listen for data on the "outgoing data" namespace and supply a '
      // //callback for what to do when we get one. In this case, we set a state variable
      this.socket.on("sensor_data_for_web_client", data => {
        this.d = data;
        this.newLabel += 1;
        if (this.newLabel % 8 === 0) {
          this.forceUpdate();
        }
      });

      this.socket.on("connect", () => {
        this.setState({ connected: true });
        console.log("connected");
      });

      this.socket.on("disconnect", () => {
        this.setState({ connected: false });
      });
    } else {
      this.socket.disconnect();
    }
  }
}

export default App;
