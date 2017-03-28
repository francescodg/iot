from flask import Flask, request
from flask_socketio import SocketIO
import random

import threading

app = Flask(__name__)
socketio = SocketIO(app)

class System:
    def __init__(self):
        self.temperatureSensors = [1, 2, 3]

    def randomUpdate(self, index):
        self.temperatureSensors[index] = random.randint(0, 100)

    @property
    def averageTemperature(self):
        return sum(self.temperatureSensors) / len(self.temperatureSensors)
        

system = System()

def timer():
    # Update system
    index = random.randint(0, len(system.temperatureSensors)-1)
    system.randomUpdate(index)

    data = {
        'id': index,
        'value': system.temperatureSensors[index]
    }

    socketio.emit("new temperature", data)
    socketio.emit("new average temperature", system.averageTemperature)

    threading.Timer(5, timer).start()

@app.route("/send")
def send():
    print("Request on send")
    socketio.emit('new data', {'data': str(random.randint(0, 10))})
    return "Send"

if __name__ == "__main__":
    timer()
    socketio.run(app, debug=True)


