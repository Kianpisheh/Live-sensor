class DrawingRequestManager {
  constructor() {
    this.initialize = this.initialize.bind(this);
    this.updateBuffer = this.updateBuffer.bind(this);
  }

  initialize(sensor, dataList, d_length) {
    let buffer = {};
    dataList.forEach(element => {
      buffer[element] = new Array(d_length).fill(0);
    });
    return {
      id: 0,
      sensor: sensor,
      dataEntry: "x axis",
      buffer: buffer
    };
  }

  updateBuffer(currentRequests, data) {
    let updatedRequests = [];
    let sensorName = data["sensor"];
    currentRequests.forEach(request => {
      console.log(data);
      if (request.sensor === sensorName) {
        Object.keys(data).forEach(dataEntry => {
          if (dataEntry !== "sensor") {
            if (dataEntry in request.buffer) {
              console.log("push");
              request.buffer[dataEntry].push(data[sensorName][dataEntry]);
              request.buffer[dataEntry].shift();
            }
          }
        });
      }
      updatedRequests.push(request);
    });

    return updatedRequests;
  }
}

export default DrawingRequestManager;
