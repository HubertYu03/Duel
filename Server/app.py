import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS
from flask import Flask, jsonify, request


# Initialize Flask app, SocketIO, and Supabase
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
load_dotenv()

# Allow requests from the frontend (http://localhost:5173)
CORS(app, resources={
     r"/*": {"origins": "http://localhost:5173"}})

# Supabase intialization
supabase: Client = create_client(os.getenv("URL"), os.getenv("API_KEY"))

# API routes


@app.route('/')
def index():
    return "Hello World"


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
            emit("game_start", {
                 "users": rooms[room_id]["users"]}, to=room_id)

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
    turnIndex = data.get("turnIndex")
    user = data.get("user")

    # Announce to room who is going first
    socketio.emit(
        "game_first", {"turnIndex": turnIndex, "user": user}, to=room_id)

    print(data["user"]["username"])


@socketio.on("card_played")
def card_played(data):
    room_id = data.get("room_id")
    card = data.get("card")
    user = data.get("username")
    user_id = data.get('user_id')

    # Update players card count in the room instance
    for user in rooms[room_id]["users"]:
        if user["user_id"] == user_id:
            user["cardsInHand"] = user["cardsInHand"] - 1
            print(user["cardsInHand"])

            # update player card count for room users
            socketio.emit("update_opponent_card_count",
                          user, to=room_id)

    socketio.emit("card_played_by_opponent", {
                  "card": card, "username": user}, to=room_id)


@socketio.on("update_player_inital")
def update_player_inital(data):
    hp = data.get("hp")
    cardsInHand = data.get("cardsInHand")
    room_id = data.get("room_id")
    user_id = data.get("user_id")

    # Up your hp and initial card amount when the game starts
    for user in rooms[room_id]["users"]:
        if user["user_id"] == user_id:
            user["hp"] = hp
            user["cardsInHand"] = cardsInHand

            # Initialize Player Shield Here
            user["shield"] = 0

    socketio.emit("receive_player_data_initial",
                  rooms[room_id]["users"], to=room_id)

    print(rooms[room_id]["users"])


@socketio.on("opponent_card_update")
def opponent_card_update(data):
    room_id = data.get("room_id")
    count = data.get("count")
    user_id = data.get("user_id")

    # Update hand in room instance
    # Up your hp and initial card amount when the game starts
    for user in rooms[room_id]["users"]:
        if user["user_id"] == user_id:
            user["cardsInHand"] = count

    # Update opponent card data for all users
    socketio.emit("receive_opponent_card_update", {
                  "count": count, "user_id": user_id}, to=room_id)


@socketio.on("turn_over")
# When the turn is over, switch to the next player based on who just went
def turn_over(data):
    current = data.get("currentIndex")
    room_id = data.get("room_id")
    playerList = data.get("playerList")

    # Update to next player accoringly
    if (current == 0):
        socketio.emit("update_turn_order", {
                      "index": 1, "user_id": playerList[1]["user_id"], "username": playerList[1]["username"]},  to=room_id)
    else:
        socketio.emit("update_turn_order", {
                      "index": 0, "user_id": playerList[0]["user_id"], "username": playerList[0]["username"]},  to=room_id)


@socketio.on("apply_card_effect")
def apply_card_effect(data):
    # apply the cards affect to the target
    card = data.get("card")
    room_id = data.get("room_id")
    user_id = data.get("user_id")

    # First check if it is damage
    if (card["type"] == "damage"):
        # Deal the damage to the appropriate target
        for user in rooms[room_id]["users"]:
            if user["user_id"] != user_id:
                # Check if user has a shield
                if (user["shield"] > 0):
                    # If the shield is greater than the incoming damage
                    if (user["shield"] >= card["amount"]):
                        user["hp"] = user["hp"]
                    else:
                        user["hp"] = user["hp"] + \
                            user["shield"] - card["amount"]
                    # Shield is destroyed no matter what
                    user["shield"] = 0
                else:
                    user["hp"] = user["hp"] - card["amount"]
                    if (user["hp"] < 0):
                        user["hp"] = 0

                if (user["hp"] == 0):
                    socketio.emit("game_over", user)
                else:
                    # Update all HP counts
                    socketio.emit("update_player_health", {
                        "hp": user["hp"],
                        "user_id": user["user_id"],
                        "username": user["username"],
                        "type": card["type"],
                        "amount": card["amount"],
                        "shieldDestroyed": True}, to=room_id)
    elif (card["type"] == "heal"):
        # Heal the user for that amount
        for user in rooms[room_id]["users"]:
            if user["user_id"] == user_id:

                # Angel's grace heals to 10 if the user has lower than 10 hp
                if (card['amount'] == 100):
                    if (user["hp"] < 20):
                        user["hp"] = 10
                    else:
                        user["hp"] = user["hp"]
                else:
                    # Heal whatever amount the card says
                    user["hp"] = user["hp"] + card["amount"]
                    if (user["hp"] > 20):
                        user["hp"] = 20

                # Update all HP counts
                socketio.emit("update_player_health", {
                              "hp": user["hp"], "user_id": user["user_id"], "type": card["type"], "amount": card["amount"]}, to=room_id)
    elif (card["type"] == "shield"):
        # Shield the user for that amount
        for user in rooms[room_id]["users"]:
            if user["user_id"] == user_id:
                # Heal whatever amount the card says
                user["shield"] = card["amount"]

                # Update shield amount for users in a room
                socketio.emit("update_player_health", {
                              "shield": user["shield"], "user_id": user["user_id"], "type": card["type"], "amount": card["amount"]}, to=room_id)


@socketio.on("user_leaving_room")
def user_leaving_room(data):
    room_id = data.get("room_id")
    user_id = data.get("user_id")

    # Leave socket room
    leave_room(room_id)

    # Remove user from room instance
    rooms[room_id]["users"] = list(
        filter(lambda user: user["user_id"] != user_id, rooms[room_id]["users"]))

    # If all users have left, delete the room from the user instance
    if (len(rooms[room_id]["users"]) == 0):
        del rooms[room_id]


if __name__ == "__main__":
    socketio.run(app, debug=True)
