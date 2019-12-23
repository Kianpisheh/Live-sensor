import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://100.64.81.146:9000/web-app"
    };
    this.socket = new socketIOClient();
    this.num = 0;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header"></header>
      </div>
    );
  }

  componentDidMount() {
    const { endpoint } = this.state;
    //Very simply connect to the socket
    this.socket = socketIOClient(endpoint);
    //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
    this.socket.on("sensor_data_for_web_client", () => {
      this.num += 1;
      if (this.num % 100 === 0) {
        console.log(this.num);
      }
    });
  }
}

export default App;
