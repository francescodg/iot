from flask import Flask
from flask_socketio import SocketIO
import datetime
import random

app = Flask(__name__)
socketio = SocketIO(app)

import datetime
import threading

def timer():
    socketio.emit('update value', {'data': str(datetime.datetime.now())})
    threading.Timer(1, timer).start()    

@socketio.on('connect')
def on_connect():
    print("Connnected")

@socketio.on('message')
def test_message(message):
    print("Message = " + message)

@socketio.on('value changed')
def test_value_changed(data):
    print(data)
    socketio.emit('update value', {'data': str(datetime.datetime.now())})

@app.route('/')
def index():
    return '<h1>Hello world</h1>'

@app.route('/start')
def start_timer():
    timer()
    return '', 204

@app.before_request
def before_request():
    print 'Called before request'

@app.route('/last_value')
def get_last_value():
    return str(random.randint(1, 10))

if __name__ == "__main__":
    socketio.run(app, debug=True)
