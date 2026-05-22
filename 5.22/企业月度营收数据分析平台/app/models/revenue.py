from datetime import datetime
from app.models import db

class RevenueData(db.Model):
    __tablename__ = 'revenue_data'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(100), nullable=False, comment='公司名称')
    department = db.Column(db.String(50), comment='部门')
    business_type = db.Column(db.String(50), comment='业务类型')
    revenue_amount = db.Column(db.Numeric(15, 2), nullable=False, comment='营收金额')
    revenue_date = db.Column(db.Date, nullable=False, comment='营收日期')
    year = db.Column(db.Integer, nullable=False, comment='年份')
    month = db.Column(db.Integer, nullable=False, comment='月份')
    region = db.Column(db.String(50), comment='地区')
    customer_type = db.Column(db.String(50), comment='客户类型')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'department': self.department,
            'business_type': self.business_type,
            'revenue_amount': float(self.revenue_amount) if self.revenue_amount else 0,
            'revenue_date': self.revenue_date.strftime('%Y-%m-%d') if self.revenue_date else None,
            'year': self.year,
            'month': self.month,
            'region': self.region,
            'customer_type': self.customer_type,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
