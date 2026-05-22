from datetime import datetime, timedelta
from sqlalchemy import func, distinct, and_, or_
from flask import jsonify, request, make_response
import pandas as pd
import io
from app.api import api_bp
from app.models import db
from app.models.revenue import RevenueData
from app.utils.response import success_response, error_response
from app.utils.data_cleaner import DataCleaner

cleaner = DataCleaner()

@api_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    try:
        year = request.args.get('year', type=int) or datetime.now().year
        month = request.args.get('month', type=int)
        
        query = RevenueData.query
        
        total_revenue = db.session.query(func.sum(RevenueData.revenue_amount)).scalar() or 0
        
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        month_revenue = db.session.query(func.sum(RevenueData.revenue_amount))\
            .filter(RevenueData.year == current_year, RevenueData.month == current_month)\
            .scalar() or 0
        
        bill_count = db.session.query(func.count(RevenueData.id)).scalar() or 0
        
        department_count = db.session.query(func.count(distinct(RevenueData.department))).scalar() or 0
        
        last_month = current_month - 1
        last_month_year = current_year
        if last_month == 0:
            last_month = 12
            last_month_year = current_year - 1
        
        last_month_revenue = db.session.query(func.sum(RevenueData.revenue_amount))\
            .filter(RevenueData.year == last_month_year, RevenueData.month == last_month)\
            .scalar() or 0
        
        month_on_month = 0
        if last_month_revenue > 0:
            month_on_month = round(((month_revenue - last_month_revenue) / last_month_revenue) * 100, 2)
        
        last_year_revenue = db.session.query(func.sum(RevenueData.revenue_amount))\
            .filter(RevenueData.year == current_year - 1, RevenueData.month == current_month)\
            .scalar() or 0
        
        year_on_year = 0
        if last_year_revenue > 0:
            year_on_year = round(((month_revenue - last_year_revenue) / last_year_revenue) * 100, 2)
        
        data = {
            'total_revenue': float(total_revenue),
            'month_revenue': float(month_revenue),
            'year_on_year': year_on_year,
            'month_on_month': month_on_month,
            'bill_count': bill_count,
            'department_count': department_count,
            'last_month_revenue': float(last_month_revenue),
            'last_year_revenue': float(last_year_revenue)
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/trend', methods=['GET'])
def get_revenue_trend():
    try:
        year = request.args.get('year', type=int) or datetime.now().year
        
        monthly_revenues = db.session.query(
            RevenueData.month,
            func.sum(RevenueData.revenue_amount)
        ).filter(RevenueData.year == year)\
         .group_by(RevenueData.month)\
         .order_by(RevenueData.month)\
         .all()
        
        last_year_revenues = db.session.query(
            RevenueData.month,
            func.sum(RevenueData.revenue_amount)
        ).filter(RevenueData.year == year - 1)\
         .group_by(RevenueData.month)\
         .order_by(RevenueData.month)\
         .all()
        
        months = []
        revenues = []
        last_year_revenues_list = []
        mom_rates = []
        
        revenue_dict = {m: float(r) for m, r in monthly_revenues}
        last_year_dict = {m: float(r) for m, r in last_year_revenues}
        
        for m in range(1, 13):
            months.append(f'{m}月')
            current_rev = revenue_dict.get(m, 0)
            last_rev = last_year_dict.get(m, 0)
            revenues.append(current_rev)
            last_year_revenues_list.append(last_rev)
            
            if m > 1:
                prev_rev = revenue_dict.get(m - 1, 0)
                if prev_rev > 0:
                    mom = round(((current_rev - prev_rev) / prev_rev) * 100, 2)
                else:
                    mom = 100 if current_rev > 0 else 0
            else:
                mom = 0
            mom_rates.append(mom)
        
        data = {
            'months': months,
            'revenues': revenues,
            'last_year_revenues': last_year_revenues_list,
            'mom_rates': mom_rates
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/department', methods=['GET'])
def get_department_revenue():
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        query = db.session.query(
            RevenueData.department,
            func.sum(RevenueData.revenue_amount),
            func.count(RevenueData.id)
        )
        
        if year:
            query = query.filter(RevenueData.year == year)
        if month:
            query = query.filter(RevenueData.month == month)
        
        dept_revenues = query.group_by(RevenueData.department)\
            .order_by(func.sum(RevenueData.revenue_amount).desc())\
            .limit(10)\
            .all()
        
        departments = []
        revenues = []
        counts = []
        
        for dept, rev, cnt in dept_revenues:
            departments.append(dept or '未指定')
            revenues.append(float(rev))
            counts.append(cnt)
        
        data = {
            'departments': departments,
            'revenues': revenues,
            'counts': counts
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/region', methods=['GET'])
def get_region_revenue():
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        query = db.session.query(
            RevenueData.region,
            func.sum(RevenueData.revenue_amount)
        )
        
        if year:
            query = query.filter(RevenueData.year == year)
        if month:
            query = query.filter(RevenueData.month == month)
        
        region_revenues = query.group_by(RevenueData.region)\
            .order_by(func.sum(RevenueData.revenue_amount).desc())\
            .limit(10)\
            .all()
        
        regions = []
        revenues = []
        
        for region, rev in region_revenues:
            regions.append(region or '未指定')
            revenues.append(float(rev))
        
        data = {
            'regions': regions,
            'revenues': revenues
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/business', methods=['GET'])
def get_business_revenue():
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        query = db.session.query(
            RevenueData.business_type,
            func.sum(RevenueData.revenue_amount)
        )
        
        if year:
            query = query.filter(RevenueData.year == year)
        if month:
            query = query.filter(RevenueData.month == month)
        
        biz_revenues = query.group_by(RevenueData.business_type)\
            .order_by(func.sum(RevenueData.revenue_amount).desc())\
            .all()
        
        result = []
        for biz_type, rev in biz_revenues:
            result.append({
                'name': biz_type or '未指定',
                'value': float(rev)
            })
        
        return success_response(data=result)
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/anomalies', methods=['GET'])
def get_anomalies():
    try:
        anomalies = []
        
        avg_revenue = db.session.query(func.avg(RevenueData.revenue_amount)).scalar() or 0
        std_revenue = db.session.query(func.std(RevenueData.revenue_amount)).scalar() or 0
        
        threshold = avg_revenue + 2 * std_revenue if std_revenue > 0 else avg_revenue * 3
        
        high_values = RevenueData.query.filter(
            RevenueData.revenue_amount > threshold
        ).order_by(RevenueData.revenue_amount.desc()).limit(5).all()
        
        for item in high_values:
            anomalies.append({
                'type': 'high_value',
                'level': 'warning',
                'message': f'异常高值：{item.department} 营收 ¥{item.revenue_amount:,.2f}',
                'description': f'超出平均值2倍标准差，日期：{item.revenue_date}',
                'data': item.to_dict()
            })
        
        recent_date = datetime.now() - timedelta(days=30)
        recent_revenues = db.session.query(
            RevenueData.department,
            func.sum(RevenueData.revenue_amount),
            func.count(RevenueData.id)
        ).filter(RevenueData.created_at >= recent_date)\
         .group_by(RevenueData.department)\
         .all()
        
        dept_avg = {}
        total_sum = 0
        for dept, rev, cnt in recent_revenues:
            if cnt > 0:
                dept_avg[dept] = rev / cnt
                total_sum += rev
        
        overall_avg = total_sum / len(dept_avg) if dept_avg else 0
        
        for dept, avg_val in dept_avg.items():
            if avg_val < overall_avg * 0.3 and avg_val > 0:
                anomalies.append({
                    'type': 'low_dept',
                    'level': 'info',
                    'message': f'部门偏低：{dept} 营收偏低',
                    'description': f'近30天平均营收仅为整体平均的 {avg_val/overall_avg*100:.1f}%',
                    'data': {'department': dept, 'avg_revenue': avg_val}
                })
        
        thirty_days_ago = datetime.now() - timedelta(days=30)
        zero_count = RevenueData.query.filter(
            RevenueData.revenue_amount == 0,
            RevenueData.created_at >= thirty_days_ago
        ).count()
        
        if zero_count > 0:
            anomalies.append({
                'type': 'zero_value',
                'level': 'warning',
                'message': f'存在 {zero_count} 条零值记录',
                'description': '近30天内存在营收金额为0的记录',
                'data': {'count': zero_count}
            })
        
        anomalies.sort(key=lambda x: {'warning': 0, 'info': 1}.get(x['level'], 2))
        
        return success_response(data={
            'anomalies': anomalies,
            'count': len(anomalies),
            'warning_count': len([a for a in anomalies if a['level'] == 'warning'])
        })
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/dashboard/compare', methods=['GET'])
def get_compare_data():
    try:
        year = request.args.get('year', type=int) or datetime.now().year
        
        current_data = db.session.query(
            RevenueData.month,
            func.sum(RevenueData.revenue_amount)
        ).filter(RevenueData.year == year)\
         .group_by(RevenueData.month)\
         .all()
        
        last_year_data = db.session.query(
            RevenueData.month,
            func.sum(RevenueData.revenue_amount)
        ).filter(RevenueData.year == year - 1)\
         .group_by(RevenueData.month)\
         .all()
        
        current_dict = {m: float(r) for m, r in current_data}
        last_dict = {m: float(r) for m, r in last_year_data}
        
        months = []
        current_revenues = []
        last_revenues = []
        yoy_rates = []
        mom_rates = []
        
        for m in range(1, 13):
            months.append(f'{m}月')
            curr = current_dict.get(m, 0)
            last = last_dict.get(m, 0)
            
            current_revenues.append(curr)
            last_revenues.append(last)
            
            if last > 0:
                yoy = round(((curr - last) / last) * 100, 2)
            else:
                yoy = 100 if curr > 0 else 0
            yoy_rates.append(yoy)
            
            if m > 1:
                prev = current_dict.get(m - 1, 0)
                if prev > 0:
                    mom = round(((curr - prev) / prev) * 100, 2)
                else:
                    mom = 100 if curr > 0 else 0
            else:
                mom = 0
            mom_rates.append(mom)
        
        return success_response(data={
            'months': months,
            'current_revenues': current_revenues,
            'last_revenues': last_revenues,
            'yoy_rates': yoy_rates,
            'mom_rates': mom_rates
        })
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/export/revenue', methods=['GET'])
def export_revenue():
    try:
        export_format = request.args.get('format', 'excel')
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
        
        records = query.order_by(RevenueData.revenue_date.desc()).all()
        
        data = []
        for item in records:
            data.append({
                '序号': item.id,
                '公司名称': item.company_name,
                '部门': item.department,
                '业务类型': item.business_type,
                '营收金额': float(item.revenue_amount),
                '交易日期': item.revenue_date.strftime('%Y-%m-%d') if item.revenue_date else '',
                '年份': item.year,
                '月份': item.month,
                '地区': item.region,
                '客户类型': item.customer_type,
                '录入时间': item.created_at.strftime('%Y-%m-%d %H:%M:%S') if item.created_at else ''
            })
        
        df = pd.DataFrame(data)
        
        if export_format == 'csv':
            output = io.StringIO()
            df.to_csv(output, index=False, encoding='utf-8-sig')
            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = f"attachment; filename=revenue_data_{datetime.now().strftime('%Y%m%d')}.csv"
            response.headers["Content-type"] = "text/csv"
        else:
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='营收数据')
                
                workbook = writer.book
                worksheet = writer.sheets['营收数据']
                
                for idx, col in enumerate(df.columns):
                    series = df[col]
                    max_len = max((
                        series.astype(str).map(len).max(),
                        len(str(col))
                    )) + 2
                    worksheet.column_dimensions[chr(65 + idx)].width = max_len
            
            output.seek(0)
            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = f"attachment; filename=revenue_data_{datetime.now().strftime('%Y%m%d')}.xlsx"
            response.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        return response
    except Exception as e:
        return error_response(message=str(e))

@api_bp.route('/export/summary', methods=['GET'])
def export_summary():
    try:
        export_format = request.args.get('format', 'excel')
        year = request.args.get('year', type=int) or datetime.now().year
        
        monthly_data = db.session.query(
            RevenueData.month,
            func.sum(RevenueData.revenue_amount),
            func.count(RevenueData.id)
        ).filter(RevenueData.year == year)\
         .group_by(RevenueData.month)\
         .order_by(RevenueData.month)\
         .all()
        
        dept_data = db.session.query(
            RevenueData.department,
            func.sum(RevenueData.revenue_amount),
            func.count(RevenueData.id)
        ).filter(RevenueData.year == year)\
         .group_by(RevenueData.department)\
         .order_by(func.sum(RevenueData.revenue_amount).desc())\
         .all()
        
        region_data = db.session.query(
            RevenueData.region,
            func.sum(RevenueData.revenue_amount)
        ).filter(RevenueData.year == year)\
         .group_by(RevenueData.region)\
         .order_by(func.sum(RevenueData.revenue_amount).desc())\
         .all()
        
        monthly_df = pd.DataFrame([{
            '月份': f'{m}月',
            '营收金额': float(rev),
            '单据数量': cnt
        } for m, rev, cnt in monthly_data])
        
        dept_df = pd.DataFrame([{
            '部门': dept or '未指定',
            '营收金额': float(rev),
            '单据数量': cnt
        } for dept, rev, cnt in dept_data])
        
        region_df = pd.DataFrame([{
            '地区': region or '未指定',
            '营收金额': float(rev)
        } for region, rev in region_data])
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            monthly_df.to_excel(writer, index=False, sheet_name='月度汇总')
            dept_df.to_excel(writer, index=False, sheet_name='部门汇总')
            region_df.to_excel(writer, index=False, sheet_name='地区汇总')
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = f"attachment; filename=summary_report_{year}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        response.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        return response
    except Exception as e:
        return error_response(message=str(e))
