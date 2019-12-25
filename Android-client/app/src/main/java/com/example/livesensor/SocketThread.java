package com.example.livesensor;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

public class SocketThread extends Thread implements SensorEventListener {

    private final static String TAG = "";

    public static final int CONN_STATUS_CHANGED = 1;

    private String ACC_STR = "acc";


    private List<String> sensorsList = new ArrayList<>();

    public Socket mSocket;
    private String serverAddress;
    private int serverPort;
    private Context context;
    private Handler mainHandler;


    public SocketThread(Context context, Handler mainHandler, String address, int port) {
        this.serverPort = port;
        this.serverAddress = address;
        this.context = context;
        this.mainHandler = mainHandler;
    }

    @Override
    public void run() {
        try {
            System.out.println("http://"+ serverAddress + ":" + serverPort);
            mSocket = IO.socket("http://"+ serverAddress + ":" + serverPort + "/android-app");
        } catch (URISyntaxException ex) {
            ex.printStackTrace();
            Log.e(TAG, "IO.Socket(): Error in creating the client socket");
        }
        mSocket.connect();
        System.out.println("connected");

        mSocket.on(Socket.EVENT_CONNECT, onConnection);
        mSocket.on(Socket.EVENT_DISCONNECT, onConnection);
        mSocket.on("sensor request", handleSensorRequest);
    }

    public void stopThread() {
        if (mSocket != null) {
            mSocket.disconnect();
            System.out.println("disconnected");
            mSocket.off("sensor request", handleSensorRequest);
        }

        SensorManager sensorManager =
                (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);

        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }

    }

    private int getSensorType(String sensor) {
        int type = -300;
        if (sensor.equals(ACC_STR)) {
            return Sensor.TYPE_ACCELEROMETER;
        }
        return type;
    }

    private String getSensorCode(int sensorType) {
        if (sensorType == Sensor.TYPE_ACCELEROMETER) {
            return ACC_STR;
        }
        return ACC_STR;
    }

    private Emitter.Listener onConnection = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            // send the disconnection message to the UI thread
            Message msg = Message.obtain();
            msg.what = CONN_STATUS_CHANGED;
            mainHandler.sendMessage(msg);
        }
    };

    private void updateSensorService(String requestedSensor) {
        // register newly subscribed sensors
        SensorManager sensorManager =
                (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (!sensorsList.contains(requestedSensor)) {
            int type = getSensorType(requestedSensor);
            if (sensorManager != null) {
                Sensor sensor = sensorManager.getDefaultSensor(type);
                sensorManager.registerListener(this, sensor,
                        SensorManager.SENSOR_DELAY_FASTEST);
                sensorsList.add(requestedSensor);
            }
        }
    }

    private JSONObject makeJsonObject(SensorEvent event) {
        JSONObject data = new JSONObject();
        JSONObject values = new JSONObject();
        try {
            int sensorType = event.sensor.getType();
            if (sensorType == Sensor.TYPE_ACCELEROMETER) {
                values.put("x axis", event.values[0]);
                values.put("y axis", event.values[1]);
                values.put("z axis", event.values[2]);
                data.put(getSensorCode(sensorType), values);
            }
        } catch (JSONException ex) {
            ex.printStackTrace();
        }
        return data;
    }

    // the listener for incoming messages
    private Emitter.Listener handleSensorRequest = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            String requestedSensor = (String) args[0];
            String request = (String) args[1];
            if (request.equals("start")) {
                updateSensorService(requestedSensor);
            }
        }
    };

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        JSONObject sensorData = makeJsonObject(sensorEvent);
        mSocket.emit("sensor_data_for_server", sensorData.toString());
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }
}









