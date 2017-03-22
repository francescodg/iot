from flask import Flask, request
from flask_socketio import SocketIO
import datetime
import random
import requests
import json

app = Flask(__name__)
socketio = SocketIO(app)

import datetime
import threading

def subscribe_to_mn():
	url = "http://127.0.0.1:8282/~/mn-cse/mn-name/TempApp/DATA"
	headers = {
		'X-M2M-Origin': 'admin:admin',
		'Accept': 'application/json',
		'Content-Type': 'application/json;ty=23'
	}
	
	body = {'m2m:sub': {'rn': 'PythonMonitor', 'nu': 'http://localhost:5000/monitor', 'nct': '2'}}

	r = requests.post(url, headers=headers, json=body)
	socketio.emit('subscribed', {'data': str(r.status_code)})
	return

@socketio.on('subscribe')
def subscribe():
	print('Called Subscribe')
	subscribe_to_mn()
	# thread.start_new_thread(subscribe_to_mn, ())
	
@app.route("/read")
def read_remote():
	url = 'http://127.0.0.1:8282/~/mn-cse/mn-name/TempApp/DATA'
	headers = {
		'X-M2M-Origin': 'admin:admin',
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
	r = requests.get(url, headers=headers)
	return r.text

@app.route("/monitor", methods=["POST"])
def monitor():	
	if request.json['m2m:sgn'].has_key('nev'):
			content = request.json['m2m:sgn']['nev']['rep']['con']
			socketio.emit('new data notified', {'data': str(content)})
	return '', 204

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
