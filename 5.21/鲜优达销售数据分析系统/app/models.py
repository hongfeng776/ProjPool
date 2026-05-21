from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True, comment='用户名')
    password_hash = db.Column(db.String(255), nullable=False, comment='密码哈希')
    real_name = db.Column(db.String(50), comment='真实姓名')
    email = db.Column(db.String(100), comment='邮箱')
    role = db.Column(db.String(20), default='user', comment='角色：admin/user')
    is_active = db.Column(db.Boolean, default=True, comment='是否激活')
    last_login = db.Column(db.DateTime, comment='最后登录时间')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'real_name': self.real_name,
            'email': self.email,
            'role': self.role,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else '',
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, comment='商品名称')
    category = db.Column(db.String(50), nullable=False, comment='商品类别')
    unit = db.Column(db.String(20), default='斤', comment='单位')
    price = db.Column(db.Numeric(10, 2), nullable=False, comment='单价')
    stock = db.Column(db.Integer, default=0, comment='库存')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')


class SaleRecord(db.Model):
    __tablename__ = 'sale_records'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False, comment='销售数量')
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, comment='销售金额')
    sale_date = db.Column(db.Date, nullable=False, comment='销售日期')
    customer_type = db.Column(db.String(20), default='散客', comment='客户类型')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')

    product = db.relationship('Product', backref=db.backref('sales', lazy=True))


class StockIn(db.Model):
    __tablename__ = 'stock_in'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False, comment='进货数量')
    supplier = db.Column(db.String(100), comment='供应商')
    stock_date = db.Column(db.Date, nullable=False, comment='进货日期')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')

    product = db.relationship('Product', backref=db.backref('stock_ins', lazy=True))
