from flask import Blueprint, render_template, make_response
from app.api.dashboard import export_revenue, export_summary

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/dashboard')
def dashboard():
    return render_template('index.html')

@main_bp.route('/export/revenue')
def export_revenue_route():
    return export_revenue()

@main_bp.route('/export/summary')
def export_summary_route():
    return export_summary()
