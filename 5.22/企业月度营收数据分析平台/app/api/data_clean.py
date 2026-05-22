from flask import request
from app.api import api_bp
from app.models import db
from app.models.revenue import RevenueData
from app.utils.response import success_response, error_response
from app.utils.data_cleaner import DataCleaner
import pandas as pd


@api_bp.route('/data/clean/preview', methods=['POST'])
def preview_clean_data():
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        if not records:
            return error_response(message='没有提供数据记录', code=400)
        
        result = DataCleaner.clean_batch_records(records)
        
        return success_response(data={
            'total': result['total'],
            'valid_count': result['valid_count'],
            'invalid_count': result['invalid_count'],
            'valid_preview': result['valid_records'][:10],
            'invalid_records': result['invalid_records']
        })
    except Exception as e:
        return error_response(message=str(e))


@api_bp.route('/data/clean/import', methods=['POST'])
def clean_and_import():
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        if not records:
            return error_response(message='没有提供数据记录', code=400)
        
        result = DataCleaner.clean_batch_records(records)
        
        if result['valid_count'] > 0:
            batch = []
            for record in result['valid_records']:
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
                batch.append(revenue)
            
            db.session.bulk_save_objects(batch)
            db.session.commit()
        
        return success_response(data={
            'total': result['total'],
            'imported_count': result['valid_count'],
            'invalid_count': result['invalid_count'],
            'invalid_records': result['invalid_records']
        }, message=f'成功导入 {result["valid_count"]} 条有效数据')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))


@api_bp.route('/data/clean/single', methods=['POST'])
def clean_single():
    try:
        record = request.get_json()
        
        is_valid, cleaned_data, errors = DataCleaner.clean_single_record(record)
        
        return success_response(data={
            'is_valid': is_valid,
            'cleaned_data': cleaned_data,
            'errors': errors
        })
    except Exception as e:
        return error_response(message=str(e))


@api_bp.route('/data/clean/db', methods=['POST'])
def clean_existing_db_data():
    try:
        all_records = RevenueData.query.all()
        records_to_update = []
        invalid_records = []
        
        for record in all_records:
            record_dict = {
                'company_name': record.company_name,
                'department': record.department,
                'business_type': record.business_type,
                'revenue_amount': float(record.revenue_amount) if record.revenue_amount else None,
                'revenue_date': record.revenue_date.strftime('%Y-%m-%d') if record.revenue_date else None,
                'region': record.region,
                'customer_type': record.customer_type
            }
            
            is_valid, cleaned_data, errors = DataCleaner.clean_single_record(record_dict)
            
            if is_valid:
                record.company_name = cleaned_data['company_name']
                record.department = cleaned_data['department']
                record.business_type = cleaned_data['business_type']
                record.revenue_amount = cleaned_data['revenue_amount']
                record.revenue_date = cleaned_data['revenue_date']
                record.year = cleaned_data['year']
                record.month = cleaned_data['month']
                record.region = cleaned_data['region']
                record.customer_type = cleaned_data['customer_type']
                records_to_update.append(record)
            else:
                invalid_records.append({
                    'id': record.id,
                    'errors': errors
                })
        
        db.session.commit()
        
        return success_response(data={
            'total': len(all_records),
            'cleaned_count': len(records_to_update),
            'invalid_count': len(invalid_records),
            'invalid_records': invalid_records
        }, message='数据库数据清洗完成')
    except Exception as e:
        db.session.rollback()
        return error_response(message=str(e))
