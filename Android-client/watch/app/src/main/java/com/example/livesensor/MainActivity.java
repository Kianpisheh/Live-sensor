package com.example.livesensor;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.wearable.activity.WearableActivity;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;

public class MainActivity extends WearableActivity {

    final static private String TAG = "";

    private int serverPort = 9000;
    private String serverAddress = "192.168.0.24";

    private SocketThread socketThread;
    private MainHandler mainHandler = new MainHandler();


    // layout elements
    private EditText portTextEdit, addressTextEdit;
    private Switch connectSwitch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Enables Always-on
        setAmbientEnabled();

        // the server and port ip address
        addressTextEdit = findViewById(R.id.address_edit_text);
        addressTextEdit.setText("192.168.0.24");
        portTextEdit = findViewById(R.id.port_edit_text);
        portTextEdit.setText("9000");

        // connect switch
        connectSwitch = findViewById(R.id.connection_sw);
        connectSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton compoundButton, boolean isChecked) {
                if (isChecked) {
                    serverAddress =  addressTextEdit.getText().toString();
                    serverPort = Integer.parseInt(portTextEdit.getText().toString());
                    socketThread = new SocketThread(getApplicationContext(), mainHandler, serverAddress, serverPort);
                    socketThread.start();
                } else {
                    if (socketThread != null) {
                        socketThread.stopThread();
                    }
                }
            }
        });


//        // connection status text view
//        connectionStatus = findViewById(R.id.conn_status_tv);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (socketThread != null) {
            socketThread.stopThread();
        }
    }


    private class MainHandler extends Handler {
        public static final int CONN_STATUS_CHANGED = 1;

        @Override
        public void handleMessage(Message msg) {
            if (msg.what == CONN_STATUS_CHANGED) {
                if (socketThread == null) {
                    //connectionStatus.setText(R.string.disconnected);
                    connectSwitch.setChecked(false);
                } else {
                    if (socketThread.mSocket == null) {
                        //connectionStatus.setText(R.string.disconnected);
                        connectSwitch.setChecked(false);

                    } else {
                        if (socketThread.mSocket.connected()) {
                            //connectionStatus.setText(R.string.connected);
                            connectSwitch.setChecked(true);
                        } else {
                            //connectionStatus.setText(R.string.disconnected);
                            connectSwitch.setChecked(false);
                        }
                    }
                }
            }
        }
    }
}
