from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
from supabase import create_client, Client
import os

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Load environment variables from the .env file
load_dotenv()


# Getting envrironment variables
app.config["URL"] = os.getenv("URL")
app.config["API_KEY"] = os.getenv("API_KEY")

# Initialize socket
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize supbase
supabase: Client = create_client(app.config['URL'], app.config["API_KEY"])


@ app.route("/")
def index():
    data = supabase.table("Test").select("*").execute()

    return jsonify("Hello World")


@ socketio.on("connect")
def handle_connect():
    print("Client connected")


if __name__ == '__main__':
    socketio.run(app, debug=True)
