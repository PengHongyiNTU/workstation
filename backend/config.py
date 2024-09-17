import os
import time
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SESSION_TYPE = "filesystem"
    DATABASE = "user_data.db"
    STORAGE_DIR = "Stored"
    CORS_ORIGINS = ["http://localhost:5000"]
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    SESSION_COOKIE_NAME = 'google-login-session'
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=5)
    # OAuth configs
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')