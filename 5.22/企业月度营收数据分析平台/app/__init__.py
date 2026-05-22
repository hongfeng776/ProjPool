from flask import Flask, jsonify
from flask_cors import CORS
from config.config import config
from app.models import db
import logging
from logging.handlers import RotatingFileHandler
import os

def create_app(config_name='default'):
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')
    
    app.config.from_object(config[config_name])
    
    CORS(app)
    
    db.init_app(app)
    
    setup_logging(app)
    
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    from app import routes
    app.register_blueprint(routes.main_bp)
    
    register_error_handlers(app)
    
    with app.app_context():
        try:
            db.create_all()
            app.logger.info('数据库表初始化成功')
        except Exception as e:
            app.logger.warning(f'数据库表初始化跳过: {e}')
    
    return app

def setup_logging(app):
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=1024 * 1024 * 10,
        backupCount=10,
        encoding='utf-8'
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
    console_handler.setLevel(logging.DEBUG)
    
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        app.logger.error(f'400错误: {error}')
        return jsonify({
            'code': 400,
            'message': '请求参数错误',
            'data': None
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        app.logger.error(f'404错误: {error}')
        return jsonify({
            'code': 404,
            'message': '资源不存在',
            'data': None
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'500错误: {error}', exc_info=True)
        return jsonify({
            'code': 500,
            'message': '服务器内部错误',
            'data': None
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f'未捕获异常: {str(e)}', exc_info=True)
        return jsonify({
            'code': 500,
            'message': '系统异常，请稍后重试',
            'data': None
        }), 500
