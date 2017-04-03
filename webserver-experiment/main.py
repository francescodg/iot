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

def _sensorsFromType(sensorType):
    if sensorType == 'temperature':
        sensors = system.temperatureSensors
    elif sensorType == 'luminosity':
        sensors = system.luminositySensors
    elif sensorType == 'humidity':
        sensors = system.humiditySensors
    else:
        sensors = []
    return sensors

def start():
    thread.start_new_thread(system.retrieveSensorsHistory, ())
    thread.start_new_thread(subscribe, ())

def subscribe():
    print("Subscribing...")
    sensors = system.temperatureSensors
    for sensor in sensors:
        m2m.subscribe(sensor['uri'], "/temperature/new")
        print("Subscribed to " + sensor['id'])
    return

@app.route("/temperature/new", methods=["POST"])
def on_new_temperature():
    try:
        (sensorId, value, time) = m2m.parseNotify(request.json)
        system.update(sensorId, value, time)
        socketio.emit("new temperature", {
            'id': sensorId,
            'value': value})
        return "", 202    
    except ValueError:
        return "", 202

@app.route("/temperature/last")
def get_last_temperature():
    collection = system.getLastValue("temperature")
    return json.dumps(collection)

@app.route("/<sensorType>/history")
def get_sensor_history(sensorType):
    sensors = _sensorsFromType(sensorType)
    collection = []
    for sensor in sensors:
        collection.append({
            'id': sensor['id'],
            'history': sensor['history']})
    return json.dumps(collection)

@app.route("/<sensorType>/sensors")
def get_sensors(sensorType):
    sensors = _sensorsFromType(sensorType)
    collection = []
    for sensor in sensors:
        collection.append({
            'id': sensor['id'], 
            'lastValue': sensor['lastValue']})
    return json.dumps(collection)

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
    # timer()    
    start()
    socketio.run(app, debug=True, use_reloader=False) # To disable duplicate output (use_reloader=False)


