from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import revenue, dashboard, data_clean
