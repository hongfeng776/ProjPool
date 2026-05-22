import os
from app import create_app
from app.models import db

app = create_app(os.getenv('FLASK_ENV', 'default'))

@app.cli.command('init-db')
def init_db():
    with app.app_context():
        db.create_all()
        print('数据库表创建成功！')

@app.cli.command('drop-db')
def drop_db():
    with app.app_context():
        db.drop_all()
        print('数据库表删除成功！')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
