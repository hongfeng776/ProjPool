import os
import tempfile
import pandas as pd
from datetime import datetime, date, timedelta
from flask import Blueprint, render_template, jsonify, request, current_app
from sqlalchemy import func, and_
from werkzeug.utils import secure_filename
from app.models import db, Product, SaleRecord, StockIn

main_bp = Blueprint('main', __name__)

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@main_bp.route('/')
def index():
    return render_template('index.html', active_page='index')


@main_bp.route('/sales')
def sales():
    return render_template('sales.html', active_page='sales')


@main_bp.route('/sales/overview')
def sales_overview():
    return render_template('sales_overview.html', active_page='sales_overview')


@main_bp.route('/stock')
def stock():
    return render_template('stock.html', active_page='stock')


@main_bp.route('/products')
def products():
    return render_template('products.html', active_page='products')


@main_bp.route('/test')
def test():
    return render_template('test.html', active_page='test')


@main_bp.route('/import')
def import_data():
    return render_template('import_data.html', active_page='import')


@main_bp.route('/api/import/template')
def api_import_template():
    from io import BytesIO
    from flask import make_response

    output = BytesIO()
    
    df = pd.DataFrame({
        '商品名称': ['大白菜', '西红柿', '苹果'],
        '销售数量': [10.5, 8.0, 5.0],
        '销售金额': [36.75, 46.40, 42.50],
        '销售日期': ['2026-05-21', '2026-05-21', '2026-05-21'],
        '客户类型': ['散客', '会员', '散客']
    })
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='销售数据')
    
    output.seek(0)
    
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response.headers['Content-Disposition'] = 'attachment; filename=销售数据导入模板.xlsx'
    
    return response


@main_bp.route('/api/sales/data')
def api_sales_data():
    records = SaleRecord.query.limit(100).all()
    return jsonify([{
        'id': r.id,
        'product_name': r.product.name if r.product else '',
        'quantity': float(r.quantity),
        'total_amount': float(r.total_amount),
        'sale_date': r.sale_date.strftime('%Y-%m-%d') if r.sale_date else '',
    } for r in records])


@main_bp.route('/api/db/status')
def api_db_status():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'connected', 'message': '数据库连接正常'})
    except Exception as e:
        return jsonify({'status': 'disconnected', 'message': str(e)})


@main_bp.route('/api/dashboard/stats')
def api_dashboard_stats():
    try:
        total_sales = db.session.query(func.sum(SaleRecord.total_amount)).scalar() or 0
        total_orders = db.session.query(func.count(SaleRecord.id)).scalar() or 0
        total_products = db.session.query(func.count(Product.id)).scalar() or 0
        total_stock = db.session.query(func.sum(Product.stock)).scalar() or 0

        return jsonify({
            'success': True,
            'data': {
                'total_sales': float(total_sales),
                'total_orders': int(total_orders),
                'total_products': int(total_products),
                'total_stock': int(total_stock)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@main_bp.route('/api/products')
def api_products():
    try:
        products = Product.query.all()
        return jsonify({
            'success': True,
            'data': [{
                'id': p.id,
                'name': p.name,
                'category': p.category,
                'unit': p.unit,
                'price': float(p.price),
                'stock': int(p.stock),
                'created_at': p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else ''
            } for p in products]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'data': []})


@main_bp.route('/api/sales/trend')
def api_sales_trend():
    try:
        days = request.args.get('days', 7, type=int)
        start_date = date.today() - timedelta(days=days - 1)
        
        records = db.session.query(
            SaleRecord.sale_date,
            func.sum(SaleRecord.total_amount)
        ).filter(
            SaleRecord.sale_date >= start_date
        ).group_by(SaleRecord.sale_date).order_by(SaleRecord.sale_date).all()

        date_map = {r[0].strftime('%Y-%m-%d'): float(r[1] or 0) for r in records}
        
        result_data = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            result_data.append({
                'date': date_str,
                'amount': date_map.get(date_str, 0)
            })

        return jsonify({
            'success': True,
            'data': result_data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'data': []})


@main_bp.route('/api/sales/category')
def api_sales_category():
    try:
        records = db.session.query(
            Product.category,
            func.sum(SaleRecord.total_amount)
        ).join(
            SaleRecord, Product.id == SaleRecord.product_id
        ).group_by(
            Product.category
        ).all()

        raw_records = db.session.query(
            Product.id,
            Product.name,
            Product.category,
            SaleRecord.total_amount,
            SaleRecord.sale_date
        ).join(
            SaleRecord, Product.id == SaleRecord.product_id
        ).limit(20).all()

        debug_data = [{
            'product_id': r[0],
            'product_name': r[1],
            'category': r[2],
            'amount': float(r[3]),
            'date': r[4].strftime('%Y-%m-%d') if r[4] else ''
        } for r in raw_records]

        result = []
        for r in records:
            category = r[0] if r[0] else '其他'
            amount = float(r[1]) if r[1] is not None else 0.0
            if amount > 0:
                result.append({
                    'name': str(category),
                    'value': round(amount, 2)
                })

        result.sort(key=lambda x: x['value'], reverse=True)

        current_app.logger.info(f'分类销售数据查询结果: {result}')
        current_app.logger.info(f'原始记录数: {len(raw_records)}, 分类数: {len(result)}')

        return jsonify({
            'success': True,
            'data': result,
            'debug': debug_data
        })
    except Exception as e:
        current_app.logger.error(f'分类销售数据查询失败: {str(e)}')
        return jsonify({'success': False, 'message': str(e), 'data': []})


@main_bp.route('/api/sales/today')
def api_sales_today():
    try:
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        today_sales = db.session.query(
            func.sum(SaleRecord.total_amount)
        ).filter(SaleRecord.sale_date == today).scalar() or 0
        
        today_orders = db.session.query(
            func.count(SaleRecord.id)
        ).filter(SaleRecord.sale_date == today).scalar() or 0
        
        today_avg = float(today_sales) / int(today_orders) if today_orders > 0 else 0
        
        yesterday_sales = db.session.query(
            func.sum(SaleRecord.total_amount)
        ).filter(SaleRecord.sale_date == yesterday).scalar() or 0
        
        yesterday_orders = db.session.query(
            func.count(SaleRecord.id)
        ).filter(SaleRecord.sale_date == yesterday).scalar() or 0
        
        yesterday_avg = float(yesterday_sales) / int(yesterday_orders) if yesterday_orders > 0 else 0
        
        sales_change = 0
        orders_change = 0
        avg_change = 0
        
        if yesterday_sales > 0:
            sales_change = round(((float(today_sales) - float(yesterday_sales)) / float(yesterday_sales)) * 100, 1)
        if yesterday_orders > 0:
            orders_change = round(((int(today_orders) - int(yesterday_orders)) / int(yesterday_orders)) * 100, 1)
        if yesterday_avg > 0:
            avg_change = round(((today_avg - yesterday_avg) / yesterday_avg) * 100, 1)
        
        return jsonify({
            'success': True,
            'data': {
                'today_sales': float(today_sales),
                'today_orders': int(today_orders),
                'avg_price': round(today_avg, 2),
                'sales_change': sales_change,
                'orders_change': orders_change,
                'avg_change': avg_change
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@main_bp.route('/api/sales/today/list')
def api_sales_today_list():
    try:
        today = date.today()
        
        records = SaleRecord.query.filter(
            SaleRecord.sale_date == today
        ).order_by(SaleRecord.created_at.desc()).limit(20).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'product_name': r.product.name if r.product else '未知商品',
                'quantity': float(r.quantity),
                'total_amount': float(r.total_amount),
                'customer_type': r.customer_type
            } for r in records]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'data': []})


@main_bp.route('/api/sales/rank')
def api_sales_rank():
    try:
        records = db.session.query(
            Product.name,
            func.sum(SaleRecord.quantity)
        ).join(SaleRecord, Product.id == SaleRecord.product_id
        ).group_by(Product.id, Product.name
        ).order_by(func.sum(SaleRecord.quantity).desc()
        ).limit(10).all()

        return jsonify({
            'success': True,
            'data': [{
                'name': r[0] or '',
                'quantity': float(r[1] or 0)
            } for r in records]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'data': []})


@main_bp.route('/api/import/sales', methods=['POST'])
def api_import_sales():
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'message': '未找到上传的文件'
        })

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'success': False,
            'message': '请选择要上传的文件'
        })

    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'message': '不支持的文件格式，请上传 .xlsx 或 .xls 文件'
        })

    try:
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        try:
            result = process_excel_file(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        return jsonify({
            'success': True,
            'message': '导入完成',
            'data': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'导入失败: {str(e)}'
        })


def process_excel_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.xlsx':
        df = pd.read_excel(file_path, engine='openpyxl')
    elif ext == '.xls':
        df = pd.read_excel(file_path, engine='xlrd')
    else:
        raise ValueError('不支持的文件格式')

    df.columns = df.columns.str.strip()

    required_columns = ['商品名称', '销售数量', '销售金额', '销售日期']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        raise ValueError(f'缺少必要的列: {", ".join(missing_columns)}')

    products = Product.query.all()
    product_name_map = {p.name: p.id for p in products}

    result = {
        'total': len(df),
        'success': 0,
        'skipped': 0,
        'failed': 0,
        'errors': []
    }

    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            row_result = validate_and_import_row(row, row_num, product_name_map)
            
            if row_result['status'] == 'success':
                result['success'] += 1
            elif row_result['status'] == 'skipped':
                result['skipped'] += 1
                result['errors'].append({
                    'row': row_num,
                    'message': row_result['message']
                })
            else:
                result['failed'] += 1
                result['errors'].append({
                    'row': row_num,
                    'message': row_result['message']
                })

        except Exception as e:
            result['failed'] += 1
            result['errors'].append({
                'row': row_num,
                'message': f'处理异常: {str(e)}'
            })

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise ValueError(f'数据库提交失败: {str(e)}')

    return result


def validate_and_import_row(row, row_num, product_name_map):
    product_name = str(row['商品名称']).strip() if pd.notna(row['商品名称']) else ''
    
    if not product_name:
        return {'status': 'failed', 'message': '商品名称不能为空'}

    if product_name not in product_name_map:
        return {'status': 'failed', 'message': f'商品 "{product_name}" 不存在'}

    product_id = product_name_map[product_name]

    try:
        quantity = float(row['销售数量'])
        if quantity <= 0:
            return {'status': 'failed', 'message': '销售数量必须大于0'}
    except (ValueError, TypeError):
        return {'status': 'failed', 'message': '销售数量格式不正确'}

    try:
        total_amount = float(row['销售金额'])
        if total_amount <= 0:
            return {'status': 'failed', 'message': '销售金额必须大于0'}
    except (ValueError, TypeError):
        return {'status': 'failed', 'message': '销售金额格式不正确'}

    sale_date = row['销售日期']
    if pd.isna(sale_date):
        return {'status': 'failed', 'message': '销售日期不能为空'}

    try:
        if isinstance(sale_date, pd.Timestamp):
            sale_date = sale_date.date()
        elif isinstance(sale_date, str):
            sale_date = datetime.strptime(sale_date.strip(), '%Y-%m-%d').date()
        elif isinstance(sale_date, datetime):
            sale_date = sale_date.date()
        else:
            return {'status': 'failed', 'message': '销售日期格式不正确，请使用 YYYY-MM-DD 格式'}
    except (ValueError, TypeError):
        return {'status': 'failed', 'message': '销售日期格式不正确，请使用 YYYY-MM-DD 格式'}

    customer_type = str(row.get('客户类型', '散客')).strip() if pd.notna(row.get('客户类型')) else '散客'
    if not customer_type:
        customer_type = '散客'

    existing = SaleRecord.query.filter(and_(
        SaleRecord.product_id == product_id,
        SaleRecord.quantity == quantity,
        SaleRecord.total_amount == total_amount,
        SaleRecord.sale_date == sale_date
    )).first()

    if existing:
        return {'status': 'skipped', 'message': '重复数据已跳过'}

    new_record = SaleRecord(
        product_id=product_id,
        quantity=quantity,
        total_amount=total_amount,
        sale_date=sale_date,
        customer_type=customer_type
    )
    db.session.add(new_record)

    return {'status': 'success'}


@main_bp.route('/api/sales/today-stats')
def api_sales_today_stats():
    try:
        today = date.today()
        yesterday = today - timedelta(days=1)

        today_sales = db.session.query(
            func.sum(SaleRecord.total_amount),
            func.count(SaleRecord.id),
            func.count(func.distinct(SaleRecord.product_id))
        ).filter(SaleRecord.sale_date == today).first()

        yesterday_sales = db.session.query(
            func.sum(SaleRecord.total_amount),
            func.count(SaleRecord.id)
        ).filter(SaleRecord.sale_date == yesterday).first()

        today_total = float(today_sales[0] or 0)
        today_orders = int(today_sales[1] or 0)
        today_products = int(today_sales[2] or 0)
        today_avg = today_total / today_orders if today_orders > 0 else 0

        yesterday_total = float(yesterday_sales[0] or 0)
        yesterday_orders = int(yesterday_sales[1] or 0)
        yesterday_avg = yesterday_total / yesterday_orders if yesterday_orders > 0 else 0

        sales_change = ((today_total - yesterday_total) / yesterday_total * 100) if yesterday_total > 0 else 0
        orders_change = ((today_orders - yesterday_orders) / yesterday_orders * 100) if yesterday_orders > 0 else 0
        avg_change = ((today_avg - yesterday_avg) / yesterday_avg * 100) if yesterday_avg > 0 else 0

        return jsonify({
            'success': True,
            'data': {
                'today': {
                    'total_sales': today_total,
                    'orders': today_orders,
                    'avg_price': today_avg,
                    'products': today_products
                },
                'yesterday': {
                    'total_sales': yesterday_total,
                    'orders': yesterday_orders,
                    'avg_price': yesterday_avg
                },
                'changes': {
                    'sales': round(sales_change, 2),
                    'orders': round(orders_change, 2),
                    'avg_price': round(avg_change, 2)
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': None
        })


@main_bp.route('/api/sales/trend-days')
def api_sales_trend_days():
    try:
        days = int(request.args.get('days', 7))
        if days < 1 or days > 90:
            days = 7

        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        records = db.session.query(
            SaleRecord.sale_date,
            func.sum(SaleRecord.total_amount),
            func.count(SaleRecord.id)
        ).filter(
            SaleRecord.sale_date >= start_date,
            SaleRecord.sale_date <= end_date
        ).group_by(SaleRecord.sale_date).order_by(SaleRecord.sale_date).all()

        date_dict = {}
        for r in records:
            date_dict[r[0].strftime('%Y-%m-%d')] = {
                'amount': float(r[1] or 0),
                'orders': int(r[2] or 0)
            }

        result = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            display_date = current_date.strftime('%m-%d')
            if date_str in date_dict:
                result.append({
                    'date': date_str,
                    'display_date': display_date,
                    'amount': date_dict[date_str]['amount'],
                    'orders': date_dict[date_str]['orders']
                })
            else:
                result.append({
                    'date': date_str,
                    'display_date': display_date,
                    'amount': 0,
                    'orders': 0
                })

        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        })


@main_bp.route('/api/sales/category-amount')
def api_sales_category_amount():
    try:
        records = db.session.query(
            Product.category,
            func.sum(SaleRecord.total_amount),
            func.sum(SaleRecord.quantity),
            func.count(SaleRecord.id)
        ).join(SaleRecord, Product.id == SaleRecord.product_id
        ).group_by(Product.category).all()

        total_amount = sum(float(r[1] or 0) for r in records)

        result = []
        for r in records:
            amount = float(r[1] or 0)
            result.append({
                'name': r[0] or '其他',
                'value': amount,
                'quantity': float(r[2] or 0),
                'orders': int(r[3] or 0),
                'percentage': round((amount / total_amount * 100) if total_amount > 0 else 0, 2)
            })

        result.sort(key=lambda x: x['value'], reverse=True)

        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        })


@main_bp.route('/api/sales/today-category-detail')
def api_sales_today_category_detail():
    try:
        today = date.today()

        records = db.session.query(
            Product.category,
            func.sum(SaleRecord.quantity),
            func.sum(SaleRecord.total_amount),
            func.count(SaleRecord.id)
        ).join(SaleRecord, Product.id == SaleRecord.product_id
        ).filter(SaleRecord.sale_date == today
        ).group_by(Product.category).all()

        total_amount = sum(float(r[2] or 0) for r in records)

        result = []
        for r in records:
            amount = float(r[2] or 0)
            result.append({
                'category': r[0] or '其他',
                'quantity': float(r[1] or 0),
                'amount': amount,
                'orders': int(r[3] or 0),
                'percentage': round((amount / total_amount * 100) if total_amount > 0 else 0, 2)
            })

        result.sort(key=lambda x: x['amount'], reverse=True)

        return jsonify({
            'success': True,
            'data': result,
            'total': {
                'amount': total_amount,
                'orders': sum(r[3] or 0 for r in records)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': [],
            'total': {'amount': 0, 'orders': 0}
        })
