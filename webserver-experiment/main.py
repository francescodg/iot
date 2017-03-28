from flask import Flask, request
from flask_socketio import SocketIO
import random

app = Flask(__name__)
socketio = SocketIO(app)
	
@app.route("/send")
def send():
        print("Request on send")
        socketio.emit('new data', {'data': str(random.randint(0, 10))})
        return "Send"

if __name__ == "__main__":
    socketio.run(app, debug=True)
