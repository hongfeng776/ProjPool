from flask import Flask
from flask_login import LoginManager
from app.config import config_map
from app.models import db, User

login_manager = LoginManager()
login_manager.login_view = 'main.login'
login_manager.login_message = '请先登录'
login_manager.login_message_category = 'warning'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def create_app(config_name='default'):
    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='../static',
    )
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    login_manager.init_app(app)

    from app.routes import main_bp
    app.register_blueprint(main_bp)

    with app.app_context():
        try:
            db.create_all()
            app.logger.info('数据库表初始化成功')
            
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    real_name='系统管理员',
                    email='admin@xianyouda.com',
                    role='admin',
                    is_active=True
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                app.logger.info('默认管理员账户创建成功: admin / admin123')
        except Exception as e:
            app.logger.warning(f'数据库连接失败: {e}')
            app.logger.warning('应用将继续运行，前端将使用模拟数据展示')

    return app
