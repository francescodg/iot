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
    data = { 'id': 'Temperature_Sensor_' + sensorId, 'value': value }
    socketio.emit("new temperature", data)
    socketio.emit("new average temperature", system.averageTemperature)

def timer():
  # Update system
  index = random.randint(0, len(system.temperatureSensors)-1)
  system.randomUpdate(index)

  data = { 'id': 'Temperature_Sensor_' + str(index), 'value': system.temperatureSensors[index] }

  system.random()

  socketio.emit("new temperature", data)
  socketio.emit("new average temperature", system.averageTemperature)
  socketio.emit("new overview", system.overview)

  threading.Timer(5, timer).start()

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

@app.route("/temperature/sensors/history")
def get_temperature_history():
    system.random()    
    collection = []
    sensors = system.sensors
    for sensor, values in sensors.iteritems():
        history = []
        for time in range(0, len(values)):
            history.append({'time': time, 'value': values[time]})
        collection.append({'id': sensor, 'history': history})
    return json.dumps(collection)
        
@app.route("/temperature/sensors")
def get_temperature_sensors():
    sensors = []
    for sensor in system.temperatureSensors:
        sensors.append({
            'id': sensor['id'], 
            'lastValue': sensor['lastValue']})
    return json.dumps(sensors)

@app.route("/humidity/sensors")
def get_humidity_sensors():
    sensors = []
    for sensor in system.humiditySensors:
        sensors.append({
            'id': sensor['id'], 
            'lastValue': sensor['lastValue']})
    return json.dumps(sensors)

@app.route("/luminosity/sensors")
def get_luminosity_sensors():
    sensors = []
    for sensor in system.luminositySensors:
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

if __name__ == "__main__":
    # timer()    
    # start()
    socketio.run(app, debug=True, use_reloader=False) # To disable duplicate output (use_reloader=False)


