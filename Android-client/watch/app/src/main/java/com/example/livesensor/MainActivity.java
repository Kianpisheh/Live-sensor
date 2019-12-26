package com.example.livesensor;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.wearable.activity.WearableActivity;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends WearableActivity {

    final static private String TAG = "";

    private int serverPort = 9000;
    private String serverAddress = "100.64.81.146";

    private SocketThread socketThread;
    private MainHandler mainHandler = new MainHandler();


    // layout elements
    private EditText portTextEdit, ipTextEdit;
    private TextView connectionStatus;
    private SwitchMaterial connectionSwitch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mTextView = (TextView) findViewById(R.id.text);

        // Enables Always-on
        setAmbientEnabled();
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
