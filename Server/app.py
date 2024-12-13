from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import os

# Initialize Flask app and Supabase
app = Flask(__name__)
CORS(app)
load_dotenv()

supabase: Client = create_client(os.getenv("URL"), os.getenv("API_KEY"))

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.get("error"):
            return jsonify({"error": response["error"]["message"]}), 400
        return jsonify({"message": "Registration successful", "data": response["data"]}), 200
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
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.get("error"):
            return jsonify({"error": response["error"]["message"]}), 400
        return jsonify({"message": "Login successful", "data": response["data"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/user", methods=["GET"])
def get_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Authorization token missing"}), 401

    try:
        token = auth_header.split("Bearer ")[1]
        user = supabase.auth.get_user(token)
        if user.get("error"):
            return jsonify({"error": user["error"]["message"]}), 400
        return jsonify({"user": user["data"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
