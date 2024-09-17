from flask import Flask, request, jsonify, g
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import sqlite3
import os
import uuid
from datetime import timedelta
from dotenv import load_dotenv
import shutil
import logging
from config import Config

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE = Config.DATABASE
STORAGE_DIR = Config.STORAGE_DIR

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource("schema.sql", mode="r") as f:
            db.cursor().executescript(f.read())
        db.commit()

if not os.path.exists(DATABASE):
    init_db()
    logger.info(f"Database '{DATABASE}' created successfully.")

os.makedirs(os.path.join(STORAGE_DIR, "temp"), exist_ok=True)

# Authentication
oauth = OAuth(app)
oauth.register(
    name="github",
    client_id=Config.GITHUB_CLIENT_ID,
    client_secret=Config.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "user:email read:user"},
)
oauth.register(
    name="google",
    client_id=Config.GOOGLE_CLIENT_ID,
    client_secret=Config.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile",
        "prompt": "select_account"
    }
)

def get_user_storage_path(user_id, is_temporary=False):
    storage_uuid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"user_{user_id}"))
    if is_temporary:
        return os.path.join(STORAGE_DIR, "temp", storage_uuid)
    return os.path.join(STORAGE_DIR, storage_uuid)

def create_user_storage(user_id, is_temporary=False):
    storage_path = get_user_storage_path(user_id, is_temporary)
    os.makedirs(storage_path, exist_ok=True)
    return storage_path

@app.route("/api/auth/<provider>")
def oauth_authorize(provider):
    if provider not in ["github", "google"]:
        return jsonify(error="Invalid provider"), 400
    client = oauth.create_client(provider)
    redirect_uri = request.args.get('redirect_uri')
    return client.authorize_redirect(redirect_uri)

@app.route("/api/auth/<provider>/callback")
def oauth_callback(provider):
    if provider not in ["github", "google"]:
        return jsonify({"error": "Invalid provider"}), 400

    try:
        token = oauth.create_client(provider).authorize_access_token()
    except Exception as e:
        logger.error(f"Error obtaining access token from {provider}: {str(e)}")
        return jsonify({"error": "Authentication failed"}), 400

    if provider == "github":
        resp = oauth.create_client(provider).get("user", token=token)
        user_info = resp.json()
        avatar_url = user_info.get("avatar_url")
        email = user_info.get("email")
        if email is None:
            email_resp = oauth.create_client(provider).get("user/emails", token=token)
            email = next((email["email"] for email in email_resp.json() if email["primary"]), None)
    elif provider == "google":
        resp = oauth.create_client(provider).get("https://www.googleapis.com/oauth2/v2/userinfo", token=token)
        user_info = resp.json()
        avatar_url = user_info.get("picture")
        email = user_info.get("email")
    else:
        return jsonify({"error": "Unsupported provider"}), 400

    # db = get_db()
    # user = db.execute(
    #     "SELECT * FROM users WHERE provider_id = ? AND provider = ?",
    #     (user_info.get("id"), provider),
    # ).fetchone()

    # if user is None:
    #     logger.info(f"Creating new user with {provider} account")
    #     db.execute(
    #         "INSERT INTO users (provider_id, provider, username, email, avatar_url) VALUES (?, ?, ?, ?, ?)",
    #         (
    #             user_info.get("id"),
    #             provider,
    #             user_info.get("login") or user_info.get("name"),
    #             email,
    #             avatar_url,
    #         ),
    #     )
    #     db.commit()
    #     user = db.execute(
    #         "SELECT * FROM users WHERE provider_id = ? AND provider = ?",
    #         (user_info.get("id"), provider),
    #     ).fetchone()
    # else:
    #     logger.info(f"User with {provider} account already exists")
    #     db.execute(
    #         "UPDATE users SET avatar_url = ? WHERE id = ?",
    #         (avatar_url, user["id"]),
    #     )
    #     db.commit()

    user_storage_path = create_user_storage(str(user["id"]))
    logger.info(f"Created storage path at: {user_storage_path}")

    return jsonify({
        "message": f"Successfully authenticated with {provider.capitalize()}",
        "user_id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "avatar_url": avatar_url,
        "storage_path": user_storage_path,
    })

@app.route("/api/user/<user_id>")
def get_user(user_id):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if user:
        return jsonify({
            "user_id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar_url": user["avatar_url"],
            "storage_path": get_user_storage_path(user["id"]),
            "is_guest": False
        })
    else:
        # If no authenticated user found, return guest user info
        guest_id = user_id  # Assuming the frontend sends a generated guest ID
        return jsonify({
            "user_id": guest_id,
            "storage_path": get_user_storage_path(guest_id, is_temporary=True),
            "is_guest": True
        })

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    db = get_db()
    db.rollback()
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=Config.DEBUG)