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
    m2m.subscribe("/mn-cse/mn-name/GreenHouse/Temperature_Average", "/temperature/average/new")
    m2m.subscribe("/mn-cse/mn-name/GreenHouse/Humidity_Average", "/humidity/average/new")
    m2m.subscribe("/mn-cse/mn-name/GreenHouse/Luminosity_Average", "/luminosity/average/new")
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

@app.route("/<sensorType>/average/new", methods=["POST"])
def on_new_average_value(sensorType):    
    try:
        (_, value, _) = m2m.parseNotify(request.json)
        socketio.emit('new {0} average'.format(sensorType), 
                          {'data': value})
    except ValueError:
        pass
    return "", 202

@app.route("/<sensorType>/new", methods=["POST"])
def on_new_value(sensorType):
    return _processNotify(sensorType, request)

@app.route("/<sensorType>/history", methods=["DELETE"])
def delete_sensor_history(sensorType):
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
        if len(sensor['history']) > 0:
            collection.append({
                'id': sensor['id'],
                'history': sensor['history']})
    average = {
        'temperature': 'Temperature_Average',
        'humidity': 'Humidity_Average',
        'luminosity': 'Luminosity_Average'
    }

    value = system.getSensorsAverage(sensorType)
    if value != None:
        collection.append({
            'id': average[sensorType],
            'history': [{'time': 0, 'value': value}]
        });
    return json.dumps(collection)

@app.route("/<sensorType>/last")
def get_sensors(sensorType):
    collection = []
    for sensor in system.sensors[sensorType]:
        value = system.getLastValue(sensor)
        if value != None:
            collection.append({
                'id': sensor['id'], 
                'lastValue': value})
    return json.dumps(collection)

@app.route("/<sensorType>/average")
def get_average(sensorType):
    average = system.getSensorsAverage(sensorType)
    return json.dumps({'average': average})

@app.route("/static/chiara/<sensorType>_sensors")
def get_sensors_page(sensorType):

    attr = {
        'temperature': {
            'title': "Temperature Sensor",
            'controller': "temperatureSensors",
            'icon': "fa-thermometer-three-quarters",
            'graphPage': 'temperature_graph'
        },
        'humidity': {
            'title': "Humidity Sensor",
            'controller': "humiditySensorCtrl",
            'icon': "fa-tint",
            'graphPage': 'humidity_graph'
        },
        'luminosity': {
            'title': "Luminosity Sensor",
            'controller': "luminositySensorCtrl",
            'icon': "fa-sun-o",
            'graphPage': 'luminosity_graph'
        }
    }
    
    return render_template("chiara/sensors.html",
                           title=attr[sensorType]['title'], 
                           controller=attr[sensorType]['controller'],
                           icon=attr[sensorType]['icon'],
                           graphPage=attr[sensorType]['graphPage'])

@app.route("/static/chiara/<sensorType>_graph")
def get_graph_page(sensorType):
    attr = {
        'temperature': {
            'title': "Temperature Sensor Graph",
            'controller': "temperatureGraph",
            'sensorPage': 'temperature_sensors'
        },
        'humidity': {
            'title': "Humidity Sensor",
            'controller': "humidityGraph",
            'sensorPage': 'humidity_sensors'
        },
        'luminosity': {
            'title': "Luminosity Sensor",
            'controller': "luminosityGraph",
            'sensorPage': 'luminosity_sensors'
        }
    }
    
    return render_template("chiara/graph.html",
                           title=attr[sensorType]['title'], 
                           controller=attr[sensorType]['controller'],
                           sensorPage=attr[sensorType]['sensorPage'])

@app.route('/boiler', methods=["GET", "POST"])
def set_boiler_temperature():
    if request.method == "GET":
        boilerState = system.getBoilerState()
        return json.dumps(boilerState)
    value = request.data
    system.setBoilerTemperature(value)    
    return "", 200

@app.route('/shader', methods=["POST"])
def set_shader_opening():
    shaderId = request.args["id"]
    value = request.data
    system.setShaderOpening(shaderId, value)    
    return "", 200

@app.route('/sprinkler', methods=["POST"])
def set_sprinkler_status():
    sprinklerId = request.args["id"]
    status = request.data
    system.setSprinklerStatus(sprinklerId, status)
    return "", 200

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
