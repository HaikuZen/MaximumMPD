package com.maximummpd;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class NowPlayingControlModule extends ReactContextBaseJavaModule {
    public NowPlayingControlModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NowPlayingControl";
    }

    // Required for rn built in EventEmitter Calls.
    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    }
    
    @ReactMethod
    public void start() {
    }

    @ReactMethod
    public void stop() {
    }

    @ReactMethod
    public void playSilence() {
    }

    @ReactMethod
    public void pauseSilence() {
    }

    @ReactMethod
    public void setNowPlaying(ReadableMap values) {
    }
}

