from flask import Flask
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'

# Initialize socket
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return "Hello World"


@socketio.on("connect")
def handle_connect():
    print("Client connected")


if __name__ == '__main__':
    socketio.run(app, debug=True)
