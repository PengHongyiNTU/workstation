# type: ignore
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
from loguru import logger
from file_manager import FileManager, FileExistsError
from user_manager import UserManager, OAuthConfigError
from datetime import timedelta
import os

load_dotenv()
app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "http://localhost:3000",
            "supports_credentials": True,
        }
    },
    supports_credentials=True,
)

app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

app.secret_key = os.environ.get("WORKSTATION_SECRET_KEY")
workspace_root = os.environ.get("WORKSPACE_ROOT")

file_manager = FileManager(workspace_root)
try:
    user_manager = UserManager(app, workspace_root)
except OAuthConfigError as e:
    logger.error(f"Error initializing UserManager: {e}")
    user_manager = None


@app.before_request
def initialize_session():
    if user_manager:
        user_manager.initialize_session()


@app.route("/api/login/github")
def login_github():
    logger.debug("Entering login_github route")
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    try:
        logger.debug("Calling user_manager.login_github()")
        return user_manager.login_github()
    except OAuthConfigError as e:
        logger.error(f"GitHub login is not configured: {str(e)}")
        return jsonify({"error": "GitHub login is not configured"}), 503
    except Exception as e:
        logger.error(f"Unexpected error during GitHub login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/api/auth/github/callback")
def github_callback():
    logger.debug("Entering github_callback route")
    logger.debug(f"Request args: {request.args}")
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    try:
        logger.debug("Calling user_manager.github_authorize()")
        user_id = user_manager.github_authorize()
        logger.info(f"Authorized GitHub user: {user_id}")
        return redirect("http://localhost:3000")  # Redirect to your React app
    except OAuthConfigError as e:
        logger.error(f"GitHub authorization failed: {str(e)}")
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.error(f"Unexpected error during GitHub authorization: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/api/login/google")
def login_google():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    try:
        resp = user_manager.login_google()
        logger.info("Redirecting to Google login")
        return resp
    except OAuthConfigError:
        logger.error("Google login is not configured")
        return jsonify({"error": "Google login is not configured"}), 503
    except Exception as e:
        logger.error(f"Unexpected error during GitHub login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/api/auth/google/callback")
def google_callback():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    try:
        user_id = user_manager.google_authorize()
        logger.info(f"Authorized Google user: {user_id}")
        return redirect("http://localhost:3000")  # Redirect to your React app
    except OAuthConfigError:
        logger.error("Google authorization failed")
        return jsonify({"error": "Google authorization failed"}), 503


@app.route("/api/logout", methods=["POST"])
def logout():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    logout_user_id = user_manager.logout()
    if logout_user_id:
        logger.info(f"Logged out user: {logout_user_id}")
        return jsonify({"message": "Logged out successfully"})
    else:
        logger.info("Logout attempt for guest user")
        return jsonify({"message": "Guest users cannot log out"}), 400


@app.route("/api/user/info", methods=["GET"])
def get_user_info():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    user_info = user_manager.get_user_info()
    logger.info(f"Retrieved user info: {user_info}")
    return jsonify(user_info)


@app.route("/api/files", methods=["GET"])
def list_files():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    user_id = user_manager.get_user_id()
    files = file_manager.list_files(user_id)
    logger.info(f"Listed files for user {user_id}: {files}")
    return jsonify(files)


@app.route("/api/files", methods=["POST"])
def create_file():
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    if "file" not in request.files:
        logger.error("No file part in the request")
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    user_id = user_manager.get_user_id()
    try:
        filename = file_manager.create_file(user_id, file)
        logger.info(f"Created file {filename} for user {user_id}")
        return (
            jsonify(
                {"message": "File created successfully", "filename": filename}
            ),
            201,
        )
    except ValueError as e:
        logger.error(f"ValueError while creating file: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except FileExistsError as e:
        logger.error(f"FileExistsError while creating file: {str(e)}")
        return jsonify({"error": str(e)}), 409  # 409 Conflict


@app.route("/api/files/<filename>", methods=["GET"])
def read_file(filename):
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    user_id = user_manager.get_user_id()
    try:
        content = file_manager.read_file(user_id, filename)
        logger.info(f"Read file {filename} for user {user_id}")
        return jsonify({"filename": filename, "content": content})
    except FileNotFoundError:
        logger.error(f"File {filename} not found for user {user_id}")
        return jsonify({"error": "File not found"}), 404


@app.route("/api/files/<filename>", methods=["PUT"])
def update_file(filename):
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    content = request.json.get("content", "")
    user_id = user_manager.get_user_id()
    try:
        file_manager.update_file(user_id, filename, content)
        logger.info(f"Updated file {filename} for user {user_id}")
        return jsonify({"message": "File updated successfully"})
    except FileNotFoundError:
        logger.error(
            f"File {filename} not found for user {user_id} during update"
        )
        return jsonify({"error": "File not found"}), 404


@app.route("/api/files/<filename>", methods=["DELETE"])
def delete_file(filename):
    if not user_manager:
        logger.error("User management is not available")
        return jsonify({"error": "User management is not available"}), 503
    user_id = user_manager.get_user_id()
    try:
        file_manager.delete_file(user_id, filename)
        logger.info(f"Deleted file {filename} for user {user_id}")
        return jsonify({"message": "File deleted successfully"})
    except FileNotFoundError:
        logger.error(
            f"File {filename} not found for user {user_id} during deletion"
        )
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    logger.info("Starting the Flask application")
    app.run(debug=True)
