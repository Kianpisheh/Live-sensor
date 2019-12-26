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
    let sensorName = Object.keys(data)[0];
    currentRequests.forEach(request => {
      if (request.sensor === sensorName) {
        Object.keys(data[sensorName]).forEach(dataEntry => {
          if (dataEntry in request.buffer) {
            request.buffer[dataEntry].push(data[sensorName][dataEntry]);
            request.buffer[dataEntry].shift();
          }
        });
      }
      updatedRequests.push(request);
    });

    return updatedRequests;
  }
}

export default DrawingRequestManager;
