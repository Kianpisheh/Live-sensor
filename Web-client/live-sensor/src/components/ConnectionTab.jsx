import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const ConnectionTab = props => {
  let connectBtnColor = "#2E7D32";
  let connectBtnLabel = "Connect";
  if (props.connected) {
    connectBtnColor = "#C70039";
    connectBtnLabel = "Stop";
  }

  return (
    <div className={"connection_tab_container"}>
      <TextField
        className={"connection-tab-items"}
        label="address"
        variant="outlined"
        size="small"
        style={{ width: 150, marginRight: 10 }}
        onChange={event => props.onAddressChanged(event.target.value, true)}
      />
      <TextField
        className={"connection-tab-items"}
        label="port"
        variant="outlined"
        size="small"
        style={{ width: 100, marginRight: 10 }}
        onChange={event => props.onAddressChanged(event.target.value, false)}
      />
      <Button
        size="small"
        variant="outlined"
        style={{ color: connectBtnColor }}
        onClick={props.onConnectBtnClicked}
      >
        {connectBtnLabel}
      </Button>
    </div>
  );
};

export default ConnectionTab;
