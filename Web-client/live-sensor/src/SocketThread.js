export default () => {
  onmessage = e => {
    // send the result into the main thread (OverviewLineChart.jsx)

    let { socket } = e.data;
    socket.on("sensor_data_for_web_client", data => {
      this.d = data;
      this.newLabel += 1;
      if (this.newLabel % 8 === 0) {
        this.forceUpdate();
      }
    });

    socket.on("connect", () => {
      this.setState({ connected: true });
      console.log("connected");
    });

    socket.on("disconnect", () => {
      this.setState({ connected: false });
    });
    console.log(socket);
    postMessage(socket);
  };
};
