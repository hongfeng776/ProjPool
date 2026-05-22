from flask import jsonify, request
from app.api import api_bp
from app.models import db
from app.models.revenue import RevenueData
from app.utils.response import success_response, error_response
from app.utils.data_cleaner import DataCleaner

cleaner = DataCleaner()

@api_bp.route('/revenue', methods=['GET'])
def get_revenue_list():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        department = request.args.get('department')
        
        query = RevenueData.query
        
        if year:
            query = query.filter(RevenueData.year == year)
        if month:
            query = query.filter(RevenueData.month == month)
        if department:
            query = query.filter(RevenueData.department == department)
        
        pagination = query.order_by(RevenueData.revenue_date.desc())\
                        .paginate(page=page, per_page=page_size, error_out=False)
        
        data = {
            'items': [item.to_dict() for item in pagination.items],
            'total': pagination.total,
            'page': page,
            'page_size': page_size,
            'pages': pagination.pages
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/revenue/<int:id>', methods=['GET'])
def get_revenue_detail(id):
    try:
        revenue = RevenueData.query.get(id)
        if not revenue:
            return error_response(message='数据不存在', code=404)
        
        return success_response(data=revenue.to_dict())
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/revenue', methods=['POST'])
def create_revenue():
    try:
        data = request.get_json()
        
        is_valid, cleaned_data, errors = cleaner.clean_single_record(data)
        
        if not is_valid:
            return error_response(message='数据验证失败: ' + '; '.join(errors), code=400)
        
        revenue = RevenueData(
            company_name=cleaned_data['company_name'],
            department=cleaned_data['department'],
            business_type=cleaned_data['business_type'],
            revenue_amount=cleaned_data['revenue_amount'],
            revenue_date=cleaned_data['revenue_date'],
            year=cleaned_data['year'],
            month=cleaned_data['month'],
            region=cleaned_data['region'],
            customer_type=cleaned_data['customer_type']
        )
        
        db.session.add(revenue)
        db.session.commit()
        
        return success_response(data=revenue.to_dict(), message='创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))

@api_bp.route('/revenue/<int:id>', methods=['PUT'])
def update_revenue(id):
    try:
        revenue = RevenueData.query.get(id)
        if not revenue:
            return error_response(message='数据不存在', code=404)
        
        data = request.get_json()
        
        update_data = {}
        if 'company_name' in data:
            update_data['company_name'] = data['company_name']
        if 'department' in data:
            update_data['department'] = data['department']
        if 'business_type' in data:
            update_data['business_type'] = data['business_type']
        if 'revenue_amount' in data:
            update_data['revenue_amount'] = data['revenue_amount']
        if 'revenue_date' in data:
            update_data['revenue_date'] = data['revenue_date']
        if 'year' in data:
            update_data['year'] = data['year']
        if 'month' in data:
            update_data['month'] = data['month']
        if 'region' in data:
            update_data['region'] = data['region']
        if 'customer_type' in data:
            update_data['customer_type'] = data['customer_type']
        
        if update_data:
            is_valid, cleaned_data, errors = cleaner.clean_single_record(update_data)
            if not is_valid:
                return error_response(message='数据验证失败: ' + '; '.join(errors), code=400)
            
            for key, value in cleaned_data.items():
                if hasattr(revenue, key):
                    setattr(revenue, key, value)
        
        db.session.commit()
        
        return success_response(data=revenue.to_dict(), message='更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))

@api_bp.route('/revenue/<int:id>', methods=['DELETE'])
def delete_revenue(id):
    try:
        revenue = RevenueData.query.get(id)
        if not revenue:
            return error_response(message='数据不存在', code=404)
        
        db.session.delete(revenue)
        db.session.commit()
        
        return success_response(message='删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))

@api_bp.route('/revenue/batch', methods=['POST'])
def batch_import_revenue():
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        if not records:
            return error_response(message='没有数据需要导入', code=400)
        
        report = cleaner.clean_batch(records)
        
        success_count = 0
        failed_records = []
        
        for idx, record in enumerate(report['valid_records']):
            try:
                revenue = RevenueData(
                    company_name=record['company_name'],
                    department=record['department'],
                    business_type=record['business_type'],
                    revenue_amount=record['revenue_amount'],
                    revenue_date=record['revenue_date'],
                    year=record['year'],
                    month=record['month'],
                    region=record['region'],
                    customer_type=record['customer_type']
                )
                db.session.add(revenue)
                success_count += 1
            except Exception as e:
                failed_records.append({
                    'index': idx,
                    'record': record,
                    'error': str(e)
                })
        
        db.session.commit()
        
        result = {
            'total_count': report['total_count'],
            'cleaned_valid_count': report['valid_count'],
            'cleaned_invalid_count': report['invalid_count'],
            'import_success_count': success_count,
            'import_failed_count': len(failed_records),
            'valid_rate': report['valid_rate'],
            'cleaning_errors': report['error_summary'],
            'import_errors': failed_records
        }
        
        return success_response(data=result, message=f'批量导入完成，成功导入 {success_count} 条')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))

@api_bp.route('/revenue/clean', methods=['POST'])
def clean_revenue_data():
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        if not records:
            return error_response(message='没有数据需要清洗', code=400)
        
        report = cleaner.clean_batch(records)
        
        result = {
            'total_count': report['total_count'],
            'valid_count': report['valid_count'],
            'invalid_count': report['invalid_count'],
            'valid_rate': report['valid_rate'],
            'valid_records': report['valid_records'],
            'invalid_records': [
                {
                    'index': inv['index'],
                    'errors': inv['errors']
                }
                for inv in report['invalid_records']
            ]
        }
        
        return success_response(data=result, message='数据清洗完成')
    except Exception as e:
        return error_response(message=str(e))
