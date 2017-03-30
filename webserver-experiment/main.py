from flask import Flask, request, json
from flask_socketio import SocketIO
import random
import m2m

import threading
import thread

app = Flask(__name__)
socketio = SocketIO(app)

class System:
    def __init__(self):
        self.sensors = {
            'Temperature_Sensor_0': [],
            'Temperature_Sensor_1': [],
            'Temperature_Sensor_2': [],
            'Temperature_Average': []
        } 
        
        self.temperatureSensors = [1, 2, 3]

    def random(self):
        for sensor in self.sensors:
            self.sensors[sensor].append(random.random() * 100)

    def randomUpdate(self, index):
        self.temperatureSensors[index] = random.randint(0, 100)

    @property
    def averageTemperature(self):
        return sum(self.temperatureSensors) / len(self.temperatureSensors)
        
system = System()

def systemUpdateTemperature(sensorId, value):
    data = { 'id': 'Temperature_Sensor_' + sensorId, 'value': value }
    socketio.emit("new temperature", data)
    socketio.emit("new average temperature", system.averageTemperature)

def timer():
  # Update system
  index = random.randint(0, len(system.temperatureSensors)-1)
  system.randomUpdate(index)

  data = { 'id': 'Temperature_Sensor_' + str(index), 'value': system.temperatureSensors[index] }
  
  socketio.emit("new temperature", data)
  socketio.emit("new average temperature", system.averageTemperature)

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
    sensors = [{'id': 'Temperature_Sensor_0', 'lastValue': 1},
               {'id': 'Temperature_Sensor_1', 'lastValue': 2},
               {'id': 'Temperature_Sensor_2', 'lastValue': 3}]
    return json.dumps(sensors)

@app.route("/send")
def send():
    print("Request on send")
    socketio.emit('new data', {'data': str(random.randint(0, 10))})
    return "Send"

if __name__ == "__main__":
    timer()    
    # start()
    socketio.run(app, debug=True, use_reloader=False) # To disable duplicate output (use_reloader=False)


