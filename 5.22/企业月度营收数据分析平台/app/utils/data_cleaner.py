import re
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import pandas as pd


class DataCleaner:
    def __init__(self):
        self.valid_departments = {
            '销售部', '市场部', '技术部', '运营部', '财务部',
            '人力资源部', '产品部', '客服部', '行政部', '研发部'
        }
        self.valid_regions = {
            '华东', '华南', '华北', '华中', '西南', '西北', '东北', '港澳台'
        }
        self.valid_business_types = {
            '产品销售', '服务收入', '咨询服务', '技术支持', '其他',
            '项目外包', '软件授权', '维护服务'
        }
        self.valid_customer_types = {
            '企业客户', '个人客户', '政府机构', '合作伙伴', '其他'
        }
        self.cleaning_report = {}

    def _safe_str(self, value) -> str:
        if value is None:
            return ''
        if isinstance(value, (int, float)):
            if value == int(value):
                return str(int(value))
            return str(value)
        s = str(value).strip()
        if s.lower() in ['nan', 'none', 'null', 'undefined', 'nan']:
            return ''
        return s

    def _is_empty(self, value) -> bool:
        if value is None:
            return True
        s = self._safe_str(value)
        return s == ''

    def clean_single_record(self, record: Dict) -> Tuple[bool, Dict, List[str]]:
        errors = []
        cleaned_data = {}
        
        for key, value in record.items():
            cleaned_data[key] = value
        
        if not self._validate_amount(cleaned_data, errors):
            return False, cleaned_data, errors
            
        if not self._validate_and_format_date(cleaned_data, errors):
            return False, cleaned_data, errors
            
        self._standardize_department(cleaned_data)
        self._standardize_region(cleaned_data)
        self._standardize_business_type(cleaned_data)
        self._standardize_customer_type(cleaned_data)
        self._standardize_company_name(cleaned_data)
        self._ensure_year_month(cleaned_data)
        
        return len(errors) == 0, cleaned_data, errors

    def _validate_amount(self, data: Dict, errors: List[str]) -> bool:
        amount = data.get('revenue_amount')
        
        if self._is_empty(amount):
            errors.append('金额为空')
            return False
        
        amount_str = self._safe_str(amount)
        amount_str = amount_str.replace(',', '').replace('¥', '').replace('￥', '').strip()
        
        try:
            amount_float = float(amount_str)
            if amount_float < 0:
                errors.append(f'金额为负数: {amount}')
                return False
            data['revenue_amount'] = round(amount_float, 2)
        except (ValueError, TypeError):
            errors.append(f'金额格式错误: {amount}')
            return False
            
        return True

    def _validate_and_format_date(self, data: Dict, errors: List[str]) -> bool:
        date_str = data.get('revenue_date')
        
        if self._is_empty(date_str):
            errors.append('日期为空')
            return False
            
        date_obj = self._parse_date(date_str)
        if date_obj is None:
            errors.append(f'日期格式错误: {date_str}')
            return False
        
        if date_obj.year < 2000 or date_obj.year > 2100:
            errors.append(f'日期年份超出合理范围: {date_str}')
            return False
            
        data['revenue_date'] = date_obj.strftime('%Y-%m-%d')
        data['year'] = date_obj.year
        data['month'] = date_obj.month
        
        return True

    def _parse_date(self, date_str) -> Optional[datetime]:
        if isinstance(date_str, datetime):
            return date_str
            
        if hasattr(date_str, 'strftime'):
            return datetime(date_str.year, date_str.month, date_str.day)
            
        s = self._safe_str(date_str)
        if not s:
            return None
        
        s = s.replace(' ', '')
        
        ymd_patterns = [
            (r'^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$', True),
            (r'^(\d{4})(\d{2})(\d{2})$', True),
        ]
        
        for pattern, is_ymd in ymd_patterns:
            match = re.match(pattern, s)
            if match:
                try:
                    y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
                    if is_ymd and 1 <= m <= 12 and 1 <= d <= 31:
                        return datetime(y, m, d)
                except (ValueError, TypeError):
                    continue
        
        dot_patterns = [
            r'^(\d{4})\.(\d{1,2})\.(\d{1,2})$',
        ]
        for pattern in dot_patterns:
            match = re.match(pattern, s)
            if match:
                try:
                    y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
                    if 1 <= m <= 12 and 1 <= d <= 31:
                        return datetime(y, m, d)
                except (ValueError, TypeError):
                    continue
        
        dmy_patterns = [
            r'^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$',
        ]
        for pattern in dmy_patterns:
            match = re.match(pattern, s)
            if match:
                try:
                    d, m, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
                    if 1 <= m <= 12 and 1 <= d <= 31:
                        return datetime(y, m, d)
                except (ValueError, TypeError):
                    continue
        
        mdy_patterns = [
            r'^(\d{1,2})/(\d{1,2})/(\d{4})$',
        ]
        for pattern in mdy_patterns:
            match = re.match(pattern, s)
            if match:
                try:
                    m, d, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
                    if 1 <= m <= 12 and 1 <= d <= 31:
                        return datetime(y, m, d)
                except (ValueError, TypeError):
                    continue
        
        return None

    def _standardize_department(self, data: Dict):
        dept = self._safe_str(data.get('department', ''))
        
        if not dept:
            data['department'] = '未指定'
            return
        
        exact_mapping = {
            '销售部': '销售部',
            '市场部': '市场部',
            '技术部': '技术部',
            '运营部': '运营部',
            '财务部': '财务部',
            '人力资源部': '人力资源部',
            '人事部': '人力资源部',
            'HR': '人力资源部',
            '产品部': '产品部',
            '客服部': '客服部',
            '行政部': '行政部',
            '研发部': '研发部',
        }
        
        if dept in exact_mapping:
            data['department'] = exact_mapping[dept]
            return
        
        fuzzy_mapping = [
            (['人力', 'hr', '人事'], '人力资源部'),
            (['销售'], '销售部'),
            (['市场'], '市场部'),
            (['技术', '研发'], '技术部'),
            (['运营'], '运营部'),
            (['财务'], '财务部'),
            (['产品'], '产品部'),
            (['客服', '支持'], '客服部'),
            (['行政'], '行政部'),
        ]
        
        dept_lower = dept.lower()
        for keywords, result in fuzzy_mapping:
            if any(kw.lower() in dept_lower for kw in keywords):
                data['department'] = result
                return
        
        if dept in self.valid_departments:
            data['department'] = dept
        else:
            data['department'] = '其他'

    def _standardize_region(self, data: Dict):
        region = self._safe_str(data.get('region', ''))
        
        if not region:
            data['region'] = '未指定'
            return
        
        province_mapping = {
            '上海': '华东', '江苏': '华东', '浙江': '华东',
            '安徽': '华东', '福建': '华东', '江西': '华东', '山东': '华东',
            '广东': '华南', '广西': '华南', '海南': '华南',
            '北京': '华北', '天津': '华北', '河北': '华北',
            '山西': '华北', '内蒙古': '华北',
            '湖北': '华中', '湖南': '华中', '河南': '华中',
            '四川': '西南', '贵州': '西南', '云南': '西南',
            '重庆': '西南', '西藏': '西南',
            '陕西': '西北', '甘肃': '西北', '青海': '西北',
            '宁夏': '西北', '新疆': '西北',
            '辽宁': '东北', '吉林': '东北', '黑龙江': '东北',
            '香港': '港澳台', '澳门': '港澳台', '台湾': '港澳台',
        }
        
        for province, area in province_mapping.items():
            if province in region:
                data['region'] = area
                return
        
        if region in self.valid_regions:
            data['region'] = region
        else:
            data['region'] = '其他'

    def _standardize_business_type(self, data: Dict):
        biz_type = self._safe_str(data.get('business_type', ''))
        
        if not biz_type:
            data['business_type'] = '未指定'
            return
        
        exact_mapping = {
            '产品销售': '产品销售',
            '服务收入': '服务收入',
            '咨询服务': '咨询服务',
            '技术支持': '技术支持',
            '项目外包': '项目外包',
            '软件授权': '软件授权',
            '维护服务': '维护服务',
        }
        
        if biz_type in exact_mapping:
            data['business_type'] = exact_mapping[biz_type]
            return
        
        fuzzy_mapping = [
            (['产品', '卖货', '商品'], '产品销售'),
            (['外包', '项目'], '项目外包'),
            (['咨询'], '咨询服务'),
            (['软件', '授权', 'license'], '软件授权'),
            (['维护', '维保'], '维护服务'),
            (['支持', '技术'], '技术支持'),
            (['服务'], '服务收入'),
        ]
        
        biz_lower = biz_type.lower()
        for keywords, result in fuzzy_mapping:
            if any(kw.lower() in biz_lower for kw in keywords):
                data['business_type'] = result
                return
        
        if biz_type in self.valid_business_types:
            data['business_type'] = biz_type
        else:
            data['business_type'] = '其他'

    def _standardize_customer_type(self, data: Dict):
        cust_type = self._safe_str(data.get('customer_type', ''))
        
        if not cust_type:
            data['customer_type'] = '未指定'
            return
        
        exact_mapping = {
            '企业客户': '企业客户',
            '个人客户': '个人客户',
            '政府机构': '政府机构',
            '合作伙伴': '合作伙伴',
        }
        
        if cust_type in exact_mapping:
            data['customer_type'] = exact_mapping[cust_type]
            return
        
        fuzzy_mapping = [
            (['企业', '公司'], '企业客户'),
            (['个人', '私人'], '个人客户'),
            (['政府', '国企', '事业'], '政府机构'),
            (['合作', '伙伴', '渠道'], '合作伙伴'),
        ]
        
        cust_lower = cust_type.lower()
        for keywords, result in fuzzy_mapping:
            if any(kw.lower() in cust_lower for kw in keywords):
                data['customer_type'] = result
                return
        
        if cust_type in self.valid_customer_types:
            data['customer_type'] = cust_type
        else:
            data['customer_type'] = '其他'

    def _standardize_company_name(self, data: Dict):
        company = self._safe_str(data.get('company_name', ''))
        
        if not company:
            data['company_name'] = '未指定'
            return
            
        company = re.sub(r'\s+', ' ', company)
        company = company.strip()
        
        if not company:
            company = '未指定'
            
        data['company_name'] = company

    def _ensure_year_month(self, data: Dict):
        date_str = data.get('revenue_date')
        if date_str:
            date_obj = self._parse_date(date_str)
            if date_obj:
                data['year'] = date_obj.year
                data['month'] = date_obj.month
                return
        
        if 'year' not in data or self._is_empty(data['year']):
            data['year'] = datetime.now().year
        
        if 'month' not in data or self._is_empty(data['month']):
            data['month'] = 1
        
        try:
            data['year'] = int(data['year'])
            data['month'] = int(data['month'])
        except (ValueError, TypeError):
            data['year'] = datetime.now().year
            data['month'] = 1

    def clean_batch(self, records: List[Dict]) -> Dict:
        valid_records = []
        invalid_records = []
        all_errors = []
        
        for idx, record in enumerate(records):
            is_valid, cleaned_data, errors = self.clean_single_record(record)
            
            if is_valid:
                valid_records.append(cleaned_data)
            else:
                invalid_records.append({
                    'index': idx,
                    'original_data': record,
                    'errors': errors
                })
                all_errors.extend([f'第{idx+1}条: {err}' for err in errors])
        
        self.cleaning_report = {
            'total_count': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'valid_rate': round(len(valid_records) / len(records) * 100, 2) if records else 0,
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'error_summary': all_errors[:100]
        }
        
        return self.cleaning_report

    def clean_dataframe(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, Dict]:
        records = df.to_dict('records')
        report = self.clean_batch(records)
        
        valid_df = pd.DataFrame(report['valid_records']) if report['valid_records'] else pd.DataFrame()
        
        invalid_data = []
        for inv in report['invalid_records']:
            row = inv['original_data'].copy()
            row['cleaning_errors'] = '; '.join(inv['errors'])
            invalid_data.append(row)
        invalid_df = pd.DataFrame(invalid_data) if invalid_data else pd.DataFrame()
        
        return valid_df, invalid_df, report

    def get_cleaning_report(self) -> Dict:
        return self.cleaning_report
