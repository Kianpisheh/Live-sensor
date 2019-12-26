import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import WebWorker from "./WebWorker";
import SocketThread from "./SocketThread";

import "./App.css";

import ChartBox from "./components/ChartBox";
import ConnectionTab from "./components/ConnectionTab";
import DrawingRequestManager from "./DrawingRequestManager";

class App extends Component {
  constructor() {
    super();
    const d_length = 500;
    this.drawingRequestManager = new DrawingRequestManager();
    let firstDrawingRequest = this.drawingRequestManager.initialize(
      "acc",
      ["x axis", "y axis", "z axis"],
      d_length
    );
    this.state = {
      address: "100.64.81.146",
      port: 9000,
      drawingRequests: [firstDrawingRequest],
      connected: false
    };

    // bind methods
    this.onSensorChanged = this.onSensorChanged.bind(this);
    this.onAddressChanged = this.onAddressChanged.bind(this);
    this.onConnectBtnClicked = this.onConnectBtnClicked.bind(this);
    this.getRequestMessage = this.getRequestMessage.bind(this);

    this.socketThread = new WebWorker(SocketThread);
    this.socket = new socketIOClient();

    // graph-related attributes
    this.labels = new Array(d_length).fill(1);
    this.newLabel = d_length + 1;
    this.d = 0;
  }

  render() {
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
              labels={this.labels}
              onSensorChanged={this.onSensorChanged}
            ></ChartBox>
          ))}
        </header>
      </div>
    );
  }

  // event handlers
  onSensorChanged(value, chartID, isSensor) {
    let drawingRequests = this.state.drawingRequests;
    drawingRequests.forEach(request => {
      if (request.id === chartID) {
        if (isSensor) {
          request.sensor = value;
        } else {
          request.dataEntry = value;
        }
      }
    });
    console.log(drawingRequests);
    // update and send the request to the server
    const requestMessage = this.getRequestMessage(drawingRequests);
    if (this.state.connected) {
      this.socket.emit("sensor_request_web_server", requestMessage);
    }
    this.setState({ drawingRequests });
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

      // listen for the data coming from the server
      this.socket.on("sensor_data_server_web_client", data => {
        this.newLabel += 1;
        if (this.newLabel % 8 === 0) {
          let updatedRequests = this.drawingRequestManager.updateBuffer(
            this.state.drawingRequests,
            data
          );
          this.setState({ drawingRequests: updatedRequests });
        }
      });

      this.socket.on("connect", () => {
        this.setState({ connected: true });
        console.log("connected");
        const requestMessage = this.getRequestMessage(
          this.state.drawingRequests
        );
        this.socket.emit("sensor_request_web_server", requestMessage);
      });

      this.socket.on("disconnect", () => {
        this.setState({ connected: false });
      });
    } else {
      this.socket.disconnect();
    }
  }

  getRequestMessage(drawingRequests) {
    let sensors = [];
    drawingRequests.forEach(request => {
      sensors.push(request.sensor);
    });
    return sensors;
  }
}

export default App;
