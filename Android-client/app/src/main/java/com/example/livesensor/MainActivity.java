package com.example.livesensor;


import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.MotionEvent;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.TextView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;


public class MainActivity extends AppCompatActivity {

    final static private String TAG = "";

    private int serverPort = 9000;
    private String serverAddress = "100.64.81.146";

    private SocketThread socketThread;
    private MainHandler mainHandler = new MainHandler();


    // layout elements
    private TextInputEditText portTextEdit, ipTextEdit;
    private MaterialButton connectButton;
    private TextView connectionStatus;
    private SwitchMaterial connectionSwitch;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ip address and port number text-edits
        portTextEdit = findViewById(R.id.port_edit_text);
        portTextEdit.setText(R.string.default_port);
        portTextEdit.addTextChangedListener(new TextWatcher() {

            public void afterTextChanged(Editable s) {
                if (portTextEdit.getText() != null) {
                    if(!portTextEdit.getText().toString().equals("")) {
                        serverPort = Integer.parseInt(portTextEdit.getText().toString());
                    }
                }
            }

            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            public void onTextChanged(CharSequence s, int start, int before, int count) {}
        });        portTextEdit.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View view, boolean hasFocus) {
                if (!hasFocus) {
                    if ((view.getId() == portTextEdit.getId()) && (portTextEdit.getText() != null)) {
                        serverPort = Integer.parseInt(portTextEdit.getText().toString());
                    }
                }
            }
        });

        ipTextEdit = findViewById(R.id.ip_edit_text);
        ipTextEdit.setText("100.64.81.146");
        ipTextEdit.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View view, boolean hasFocus) {
                if (!hasFocus) {
                    if ((view.getId() == ipTextEdit.getId()) && (ipTextEdit.getText() != null)) {
                        serverAddress = ipTextEdit.getText().toString();
                    }
                }
            }
        });

        // The connect button
//        connectButton = findViewById(R.id.connect_btn);
//        connectButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                if (socketThread != null) {
//                    if (socketThread.mSocket != null) {
//                        if (socketThread.mSocket.connected()) {
//                            socketThread.stopThread();
//                        } else {
//                            socketThread = new SocketThread(getApplicationContext(), mainHandler, serverAddress, serverPort);
//                            socketThread.start();
//                        }
//                    }
//                } else {
//                    socketThread = new SocketThread(getApplicationContext(), mainHandler, serverAddress, serverPort);
//                    socketThread.start();
//                }
//            }
//        });

        // the connection switch
        connectionSwitch = findViewById(R.id.connection_sw);
        connectionSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton compoundButton, boolean isChecked) {
                if (isChecked) {
                    socketThread = new SocketThread(getApplicationContext(), mainHandler, serverAddress, serverPort);
                    socketThread.start();
                } else {
                    if (socketThread != null) {
                        socketThread.stopThread();
                    }
                }
            }
        });


        // connection status text view
        connectionStatus = findViewById(R.id.conn_status_tv);
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
                    connectionStatus.setText(R.string.disconnected);
                    connectionSwitch.setChecked(false);
                } else {
                    if (socketThread.mSocket == null) {
                        connectionStatus.setText(R.string.disconnected);
                        connectionSwitch.setChecked(false);

                    } else {
                        if (socketThread.mSocket.connected()) {
                            connectionStatus.setText(R.string.connected);
                            connectionSwitch.setChecked(true);
                        } else {
                            connectionStatus.setText(R.string.disconnected);
                            connectionSwitch.setChecked(false);
                        }
                    }
                }
            }
        }
    }
}
