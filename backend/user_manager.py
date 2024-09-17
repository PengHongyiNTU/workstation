import os
from flask import session, Flask, url_for
from authlib.integrations.flask_client import OAuth  # type: ignore
from werkzeug.utils import secure_filename
from typing import Optional
import requests  # type: ignore


class OAuthConfigError(Exception):
    pass


class UserManager:
    def __init__(self, app: Flask, workspace_root: str) -> None:
        self.app = app
        self.workspace_root = workspace_root
        self.guest_workspace = os.path.join(workspace_root, "guest")
        os.makedirs(self.guest_workspace, exist_ok=True)
        self.oauth = OAuth(app)

        github_client_id = os.environ.get("GITHUB_CLIENT_ID")
        github_client_secret = os.environ.get("GITHUB_CLIENT_SECRET")
        if not github_client_id or not github_client_secret:
            raise OAuthConfigError(
                "GitHub OAuth credentials not set in environment variables"
            )

        self.github_proxy = self.oauth.register(
            name="github",
            client_id=github_client_id,
            client_secret=github_client_secret,
            access_token_url="https://github.com/login/oauth/access_token",
            access_token_params=None,
            authorize_url="https://github.com/login/oauth/authorize",
            authorize_params=None,
            api_base_url="https://api.github.com/",
            client_kwargs={"scope": "user:email"},
        )

        google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
        google_client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
        if not google_client_id or not google_client_secret:
            raise OAuthConfigError(
                "Google OAuth credentials not set in environment variables"
            )

        self.google_proxy = self.oauth.register(
            name="google",
            client_id=google_client_id,
            client_secret=google_client_secret,
            server_metadata_url=(
                "https://accounts.google.com/.well-known/openid-configuration"
            ),
            client_kwargs={
                "scope": "openid email profile",
                "prompt": "select_account",
            },
        )

    def create_user_workspace(self, user_id: str) -> str:
        user_workspace = os.path.join(
            self.workspace_root, secure_filename(user_id)
        )
        os.makedirs(user_workspace, exist_ok=True)
        return user_workspace

    def initialize_session(self) -> str:
        if "user_id" not in session:
            return self.create_guest_session()
        return session["user_id"]

    def create_guest_session(self) -> str:
        session["user_id"] = "guest"
        session["user_type"] = "guest"
        session["user_name"] = "Guest"
        session["avatar_url"] = None
        return session["user_id"]

    def get_user_workspace(self, user_id: str) -> str:
        if user_id == "guest":
            return self.guest_workspace
        else:
            return os.path.join(self.workspace_root, secure_filename(user_id))

    def login_github(self):
        if not self.github_proxy:
            raise OAuthConfigError("Github OAuth not configured")
        redirect_uri = url_for("github_callback", _external=True)
        return self.github_proxy.authorize_redirect(redirect_uri)

    def github_authorize(self):
        if not self.github_proxy:
            raise OAuthConfigError("Github OAuth not configured")
        token = self.github_proxy.authorize_access_token()
        resp = self.github_proxy.get("user", token=token)
        profile = resp.json()
        session["user_id"] = f"github_{profile['id']}"
        session["user_type"] = "github"
        session["user_name"] = profile.get(
            "name", profile.get("login", "GitHub User")
        )
        session["avatar_url"] = profile.get("avatar_url")
        print("Session after:", session)
        self.create_user_workspace(session["user_id"])
        return session["user_id"]

    def login_google(self) -> str:
        if not self.google_proxy:
            raise OAuthConfigError("Google OAuth not configured")
        redirect_uri = url_for("google_callback", _external=True)
        return self.google_proxy.authorize_redirect(redirect_uri)

    def google_authorize(self) -> str:
        if not self.google_proxy:
            raise OAuthConfigError("Google OAuth not configured")
        token = self.google_proxy.authorize_access_token()
        resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f'Bearer {token["access_token"]}'},
        )
        user_info = resp.json()

        session["user_id"] = f"google_{user_info['sub']}"
        session["user_type"] = "google"
        session["user_name"] = user_info.get("name", "Google User")
        session["avatar_url"] = user_info.get("picture")
        self.create_user_workspace(session["user_id"])
        return session["user_id"]

    def logout(self) -> Optional[str]:
        if session.get("user_type") in ["github", "google"]:
            user_id = session.get("user_id")
            session.clear()
            return user_id
        return None

    def cleanup_guest_workspace(self, user_id: str) -> None:
        if user_id.startswith("guest_"):
            user_workspace = os.path.join(
                self.workspace_root, secure_filename(user_id)
            )
            if os.path.exists(user_workspace):
                for root, dirs, files in os.walk(
                    user_workspace, topdown=False
                ):
                    for name in files:
                        os.remove(os.path.join(root, name))
                    for name in dirs:
                        os.rmdir(os.path.join(root, name))
                os.rmdir(user_workspace)

    def get_user_info(self) -> dict:
        return {
            "user_id": session.get("user_id"),
            "user_name": session.get("user_name"),
            "user_type": session.get("user_type"),
            "avatar_url": session.get("avatar_url"),
        }

    def get_user_id(self) -> Optional[str]:
        return session.get("user_id")

    def is_authenticated(self) -> bool:
        return "user_id" in session

    def is_guest(self) -> bool:
        return session.get("user_type") == "guest"
