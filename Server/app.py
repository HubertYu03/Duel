from flask_socketio import SocketIO
from flask import Flask
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from dotenv import load_dotenv
from supabase import create_client, Client
import os

# Initialize Flask app, SocketIO, and Supabase
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
load_dotenv()


app = Flask(__name__)

# Allow requests from the frontend (http://localhost:5173)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

supabase: Client = create_client(os.getenv("URL"), os.getenv("API_KEY"))

# API routes


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")

    if not email or not password or not username:
        return jsonify({"error": "Email, password, and username are required"}), 400

    try:
        # Create user in Supabase Auth
        response = supabase.auth.sign_up(
            {"email": email, "password": password})
        if response.get("error"):
            return jsonify({"error": response["error"]["message"]}), 400

        user_id = response["data"]["user"]["id"]

        # Insert user into custom users table
        user_data = {
            "id": user_id,
            "email": email,
            "username": username,
            "wins": 0,
            "deck": [],
        }
        supabase.table("users").insert(user_data).execute()
        return jsonify({"message": "Registration successful", "data": user_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Log the user in via Supabase Auth
        response = supabase.auth.sign_in_with_password(
            {"email": email, "password": password})
        if response.get("error"):
            return jsonify({"error": response["error"]["message"]}), 400

        user_id = response["data"]["user"]["id"]
        # Fetch additional user details from the "users" table
        user_data = supabase.table("users").select(
            "*").eq("id", user_id).single().execute()
        if user_data.get("error"):
            return jsonify({"error": "User not found in custom table"}), 404

        return jsonify({"message": "Login successful", "user": user_data["data"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/user", methods=["GET"])
def get_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Authorization token missing"}), 401

    try:
        token = auth_header.split("Bearer ")[1]
        user_response = supabase.auth.get_user(token)
        if user_response.get("error"):
            return jsonify({"error": user_response["error"]["message"]}), 400

        user_id = user_response["data"]["id"]
        # Fetch user details from the "users" table
        user_data = supabase.table("users").select(
            "*").eq("id", user_id).single().execute()
        if user_data.get("error"):
            return jsonify({"error": "User not found in custom table"}), 404

        return jsonify({"user": user_data["data"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/fetchUserDeck/<id>")
# Route to deck a user's deck
def fetch_deck(id):
    # Get the deck from supabase
    deck = supabase.table("Users").select("deck").eq("userID", id).execute()

    # Parse data to get what is wanted
    deckData = deck.data[0]["deck"]

    return jsonify(deckData)


@app.route("/fetchAvailableCards")
# Route to get all available cards
def fetch_available_cards():
    cards = supabase.table("Cards").select("*").execute()

    allCards = cards.data

    return jsonify(allCards)


@app.route("/updateDeck/<id>", methods=["POST"])
# Route to update a user's deck
def update_deck(id):
    newDeck = request.get_json()

    response = supabase.table("Users").update(
        {"deck": newDeck}).eq("userID", id).execute()

    return "success"


# WebSocket events
connected_users = {}

rooms = {}


@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit("connected", {"message": "You are connected!"})


@socketio.on("disconnect")
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    connected_users.pop(request.sid, None)


@socketio.on("create_room")
def create_room(data):
    room_id = data.get("room_id")
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return

    join_room(room_id)

    rooms[room_id] = {
        "users": []
    }

    emit("room_created", {"room_id": room_id}, to=room_id)
    print(f"Room created: {room_id}")


@socketio.on("join_room")
def join_room_event(data):
    room_id = data.get("room_id")
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return

    join_room(room_id)

    users = rooms[room_id]["users"]

    if data.get("user") not in users:
        users.append(data.get("user"))

        rooms[room_id] = {
            "users": users
        }

        print(rooms[room_id]["users"])

        # Send user data to people in the room so it can update client side
        emit("room_joined", {"room_id": room_id,
             "user": request.sid, "users": rooms[room_id]["users"]}, to=room_id)

        # If there are enough players, start the game
        if (len(rooms[room_id]["users"]) == 2):
            emit("game_start", to=room_id)

        print(f"User {request.sid} joined room: {room_id}")


@socketio.on("send_message")
def send_message(data):
    room_id = data.get("room_id")
    message = data.get("message")

    if not room_id or not message:
        emit("error", {"message": "Room ID and message are required."})
        return

    emit("receive_message", {"message": message,
         "user": request.sid}, to=room_id)

    print(f"Message sent to room {room_id}: {message}")


@socketio.on("game_setup")
def initialize_game(data):
    room_id = data.get("room_id")
    userDeck = data.get("deck")
    hp = data.get("hp")

    print("Test")


if __name__ == "__main__":
    socketio.run(app, debug=True)
