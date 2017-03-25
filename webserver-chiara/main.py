from flask import Flask, request
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

import datetime
import threading
	
@app.route("/read")
def read_remote():
	return r.text

@app.route("/monitor", methods=["POST"])
def monitor():	
	return '', 204

@app.route("/delete")
def delete_content_instance():
        return 'No URI specified', 404

@app.route("/retrieve")
def retrieve_container_instance():
	return json.dumps({'contentInstances': contentInstances})

@socketio.on('connect')
def on_connect():
    print("Connnected")

@socketio.on('message')
def test_message(message):
    print("Message = " + message)

@app.route('/')
def index():
    return '<h1>Hello world</h1>'

@app.route('/temperature/average')
def get_average_temperature():
        return '128'

if __name__ == "__main__":
    socketio.run(app, debug=True)
