from flask import Flask, request, json, render_template
from flask_socketio import SocketIO
import random
import m2m
import system

import threading
import thread

app = Flask(__name__, template_folder="static/")
socketio = SocketIO(app)

system = system.System()

# TODO Deprecated
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
    for sensor in system.sensors["temperature"]:
        m2m.subscribe(sensor['uri'], "/temperature/new")
        print("Subscribed to " + sensor['id'])
    for sensor in system.sensors["humidity"]:
        m2m.subscribe(sensor['uri'], "/humidity/new")
        print("Subscribed to " + sensor['id'])
    for sensor in system.sensors["luminosity"]:
        m2m.subscribe(sensor['uri'], "/luminosity/new")
        print("Subscribed to " + sensor['id'])
    return

def _processNotify(sensorType, request):
    try:
        (sensorId, value, time) = m2m.parseNotify(request.json)
        system.update(sensorType, sensorId, value, time)
        socketio.emit("new " + sensorType, {
            'id': sensorId,
            'value': value})
        return "", 202    
    except ValueError:
        return "", 202

@app.route("/<sensorType>/new", methods=["POST"])
def on_new_value(sensorType):    
    return _processNotify(sensorType, request)
    return "", 202

@app.route("/<sensorType>/last")
def get_last_temperature(sensorType):    
    collection = system.getLastValue(sensorType)
    return json.dumps(collection)

@app.route("/<sensorType>/history", methods=["DELETE"])
def delete_sensor_history(sensorType):
    print("Called delete")
    if request.args.has_key("name"):
        sensorName = request.args["name"]
        system.clearHistory(sensorType, sensorName)
        return "", 200
    else:
        return "", 404

@app.route("/<sensorType>/history", methods=["GET"])
def get_sensor_history(sensorType):
    collection = []
    for sensor in system.sensors[sensorType]:
        collection.append({
            'id': sensor['id'],
            'history': sensor['history']})
    return json.dumps(collection)

@app.route("/<sensorType>/sensors")
def get_sensors(sensorType):
    collection = []
    for sensor in system.sensors[sensorType]:
        collection.append({
            'id': sensor['id'], 
            'lastValue': sensor['lastValue']})
    return json.dumps(collection)

@app.route("/static/chiara/<sensorType>_sensors")
def get_temperature_sensors_page(sensorType):

    attr = {
        'temperature': {
            'title': "Temperature Sensor",
            'controller': "temperatureSensors",
            'icon': "fa-thermometer-three-quarters",
            'graphPage': 'graph_temperature'
        },
        'humidity': {
            'title': "Humidity Sensor",
            'controller': "humiditySensorCtrl",
            'icon': "fa-tint",
            'graphPage': 'graph_humidity'
        },
        'luminosity': {
            'title': "Luminosity Sensor",
            'controller': "luminositySensorCtrl",
            'icon': "fa-sun-o",
            'graphPage': 'graph_luminosity'
        }
    }
    
    return render_template("chiara/sensors.html",
                           title=attr[sensorType]['title'], 
                           controller=attr[sensorType]['controller'],
                           icon=attr[sensorType]['icon'],
                           graphPage=attr[sensorType]['graphPage'])
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
