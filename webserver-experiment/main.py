from flask import Flask, request, json
from flask_socketio import SocketIO
import random
import m2m
import system

import threading
import thread

app = Flask(__name__)
socketio = SocketIO(app)
        
system = system.System()

def systemUpdateTemperature(sensorId, value):
    pass

def start():
    thread.start_new_thread(subscribe, ())

def subscribe():
    resources = ["/Temperature/Temperature_Sensor_0", "/Temperature/Temperature_Sensor_1"]
    for resource in resources:
        m2m.subscribe(resource, "/new/temperature")
    return

@app.route("/new/temperature", methods=["POST"])
def on_new_temperature():
    print(request.json)    
    try:
        (resourceId, value) = m2m.parseNotify(request.json)
        systemUpdateTemperature(resourceId, value)
    except ValueError:
        pass
    return "", 202

@app.route("/<sensorType>/history")
def get_sensor_history(sensorType):
    collection = []
    for sensor in system.temperatureSensors:
        collection.append({
            'id': sensor['id'],
            'history': sensor['history']})
    return json.dumps(collection)

@app.route("/temperature/sensors/history")
def get_temperature_history():

    return get_sensor_history('')

    system.random()    
    collection = []
    sensors = system.sensors
    for sensor, values in sensors.iteritems():
        history = []
        for time in range(0, len(values)):
            history.append({'time': time, 'value': values[time]})
        collection.append({'id': sensor, 'history': history})
    return json.dumps(collection)

@app.route("/<sensorType>/sensors")
def get_sensors(sensorType):
    uris = []
    if sensorType == "temperature":
        uris = system.temperatureSensors
    elif sensorType == "luminosity":
        uris = system.luminositySensors
    elif sensorType == "humidity":
        uris = system.humiditySensors
    sensors = []
    for sensor in uris:
        sensors.append({
            'id': sensor['id'], 
            'lastValue': sensor['lastValue']})
    return json.dumps(sensors)

@app.route("/send")
def send():
    print("Request on send")
    socketio.emit('new data', {'data': str(random.randint(0, 10))})
    return "Send"

@app.route("/overview")
def get_overview():
    return system.overview

def timer():
  # socketio.emit("new temperature", random.randint(0, 100))
  # socketio.emit("new average temperature", random.randint(0, 100))
  socketio.emit("new overview", system.overview)
  threading.Timer(5, timer).start()

if __name__ == "__main__":
    timer()    
    # start()
    socketio.run(app, debug=True, use_reloader=False) # To disable duplicate output (use_reloader=False)


