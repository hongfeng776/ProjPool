import os
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any


class DataImporter:
    def __init__(self):
        self.raw_data = None
        self.import_report = {
            'total_rows': 0,
            'valid_rows': 0,
            'invalid_rows': 0,
            'duplicate_rows': 0,
            'missing_dates': 0,
            'missing_steps': 0,
            'invalid_steps': 0,
            'zero_steps': 0,
            'columns_found': [],
            'warnings': [],
            'data_quality_score': 0
        }
        
        self.date_aliases = [
            'date', '日期', '时间', 'datestr', 'day', '日期时间',
            '记录日期', '统计日期', 'date_str', 'datetime'
        ]
        self.steps_aliases = [
            'steps', '步数', 'step_count', '步行数', '走步数',
            '运动步数', '今日步数', 'step', 'amount', 'count'
        ]

    def import_data(self, file_path: str, **kwargs) -> Optional[pd.DataFrame]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        file_ext = os.path.splitext(file_path)[1].lower()
        self.import_report['file_path'] = file_path
        self.import_report['file_type'] = file_ext
        
        try:
            if file_ext == '.csv':
                self.raw_data = self._import_csv(file_path, **kwargs)
            elif file_ext in ['.xlsx', '.xls']:
                self.raw_data = self._import_excel(file_path, **kwargs)
            elif file_ext == '.json':
                self.raw_data = self._import_json(file_path, **kwargs)
            else:
                raise ValueError(f"不支持的文件格式: {file_ext}")
            
            self.import_report['total_rows'] = len(self.raw_data)
            self.import_report['columns_found'] = list(self.raw_data.columns)
            
            return self.raw_data
            
        except Exception as e:
            self.import_report['warnings'].append(f"导入失败: {str(e)}")
            raise

    def _import_csv(self, file_path: str, encoding: str = 'utf-8', **kwargs) -> pd.DataFrame:
        encodings_to_try = [encoding, 'gbk', 'gb2312', 'utf-8-sig', 'latin1']
        
        for enc in encodings_to_try:
            try:
                df = pd.read_csv(file_path, encoding=enc, **kwargs)
                if len(df) > 0:
                    self.import_report['encoding'] = enc
                    return df
            except UnicodeDecodeError:
                continue
            except Exception as e:
                self.import_report['warnings'].append(f"编码 {enc} 失败: {e}")
        
        raise ValueError("无法识别文件编码，请检查文件格式")

    def _import_excel(self, file_path: str, sheet_name: Optional[str] = None, **kwargs) -> pd.DataFrame:
        xl = pd.ExcelFile(file_path)
        self.import_report['sheet_names'] = xl.sheet_names
        
        if sheet_name is None:
            sheet_name = xl.sheet_names[0]
        
        self.import_report['sheet_used'] = sheet_name
        df = pd.read_excel(file_path, sheet_name=sheet_name, **kwargs)
        return df

    def _import_json(self, file_path: str, **kwargs) -> pd.DataFrame:
        df = pd.read_json(file_path, **kwargs)
        return df

    def validate_and_clean(self, df: pd.DataFrame, date_column: Optional[str] = None, 
                          steps_column: Optional[str] = None,
                          min_steps: int = 0, max_steps: int = 100000) -> pd.DataFrame:
        df = df.copy()
        
        df.columns = df.columns.str.strip().str.lower()
        
        date_col = date_column or self._find_date_column(df)
        steps_col = steps_column or self._find_steps_column(df)
        
        if date_col is None:
            raise ValueError("未找到日期列，支持的列名: " + ", ".join(self.date_aliases))
        if steps_col is None:
            raise ValueError("未找到步数列，支持的列名: " + ", ".join(self.steps_aliases))
        
        self.import_report['date_column'] = date_col
        self.import_report['steps_column'] = steps_col
        
        df = self._process_date_column(df, date_col)
        df = self._process_steps_column(df, steps_col, min_steps, max_steps)
        
        before_drop = len(df)
        df = df.dropna(subset=['date', 'steps'])
        self.import_report['valid_rows'] = len(df)
        self.import_report['invalid_rows'] = before_drop - len(df)
        
        if len(df) == 0:
            raise ValueError("数据清洗后无有效记录，请检查数据文件格式")
        
        df['steps'] = df['steps'].astype(int)
        
        df = self._remove_duplicates(df)
        
        df = df.sort_values('date').reset_index(drop=True)
        
        df = self._add_time_features(df)
        
        return df

    def validate_data_quality(self, df: pd.DataFrame, min_required_days: int = 7) -> Dict[str, Any]:
        quality_report = {
            'is_valid': True,
            'errors': [],
            'warnings': []
        }
        
        if df is None or len(df) == 0:
            quality_report['is_valid'] = False
            quality_report['errors'].append('数据为空')
            return quality_report
        
        if len(df) < min_required_days:
            quality_report['warnings'].append(
                f'数据量较少，仅有 {len(df)} 天，建议至少 {min_required_days} 天数据'
            )
        
        if 'date' not in df.columns:
            quality_report['is_valid'] = False
            quality_report['errors'].append('缺少 date 列')
        
        if 'steps' not in df.columns:
            quality_report['is_valid'] = False
            quality_report['errors'].append('缺少 steps 列')
        
        if quality_report['is_valid']:
            date_nulls = df['date'].isna().sum()
            steps_nulls = df['steps'].isna().sum()
            
            if date_nulls > 0:
                quality_report['warnings'].append(f'存在 {date_nulls} 条无效日期记录')
            
            if steps_nulls > 0:
                quality_report['warnings'].append(f'存在 {steps_nulls} 条无效步数记录')
            
            zero_steps = (df['steps'] == 0).sum()
            if zero_steps > 0:
                quality_report['warnings'].append(f'存在 {zero_steps} 条步数为0的记录')
            
            date_range = (df['date'].max() - df['date'].min()).days + 1
            expected_days = date_range
            actual_days = len(df)
            missing_days = expected_days - actual_days
            
            if missing_days > 0:
                quality_report['warnings'].append(
                    f'数据范围内缺失 {missing_days} 天记录 (共 {expected_days} 天，实际 {actual_days} 天)'
                )
        
        quality_report['total_records'] = len(df)
        quality_report['date_range'] = {
            'start': df['date'].min().strftime('%Y-%m-%d') if len(df) > 0 else None,
            'end': df['date'].max().strftime('%Y-%m-%d') if len(df) > 0 else None
        }
        
        return quality_report

    def _add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df['year'] = df['date'].dt.year.astype(int)
        df['month'] = df['date'].dt.month.astype(int)
        df['week'] = df['date'].dt.isocalendar().week.astype(int)
        df['day_of_week'] = df['date'].dt.dayofweek.astype(int)
        df['day_name'] = df['date'].dt.day_name()
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        return df

    def _find_date_column(self, df: pd.DataFrame) -> Optional[str]:
        for col in df.columns:
            col_lower = col.lower().strip()
            if col_lower in self.date_aliases:
                return col
        return None

    def _find_steps_column(self, df: pd.DataFrame) -> Optional[str]:
        for col in df.columns:
            col_lower = col.lower().strip()
            if col_lower in self.steps_aliases:
                return col
        return None

    def _process_date_column(self, df: pd.DataFrame, date_col: str) -> pd.DataFrame:
        df['date'] = pd.to_datetime(df[date_col], errors='coerce')
        
        missing_dates = df['date'].isna().sum()
        self.import_report['missing_dates'] = int(missing_dates)
        
        if missing_dates > 0:
            self.import_report['warnings'].append(f"有 {missing_dates} 行日期格式无效")
        
        return df

    def _process_steps_column(self, df: pd.DataFrame, steps_col: str, 
                             min_steps: int, max_steps: int) -> pd.DataFrame:
        original_steps = df[steps_col].copy()
        
        if df[steps_col].dtype == 'object':
            df[steps_col] = df[steps_col].astype(str).str.replace(',', '').str.strip()
        
        df['steps'] = pd.to_numeric(df[steps_col], errors='coerce')
        
        missing_steps = df['steps'].isna().sum()
        self.import_report['missing_steps'] = int(missing_steps)
        
        zero_steps = (df['steps'] == 0).sum()
        self.import_report['zero_steps'] = int(zero_steps)
        if zero_steps > 0:
            self.import_report['warnings'].append(f"发现 {zero_steps} 行步数为 0")
        
        invalid_steps = ((df['steps'] < min_steps) | (df['steps'] > max_steps) & df['steps'].notna()).sum()
        self.import_report['invalid_steps'] = int(invalid_steps)
        
        df.loc[df['steps'] < min_steps, 'steps'] = np.nan
        df.loc[df['steps'] > max_steps, 'steps'] = np.nan
        
        return df

    def check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        quality_report = {
            'total_rows': len(df),
            'complete_rows': int(df.notna().all(axis=1).sum()),
            'missing_dates': int(df['date'].isna().sum()),
            'missing_steps': int(df['steps'].isna().sum()),
            'zero_steps': int((df['steps'] == 0).sum()),
            'date_range': None,
            'date_gaps': 0,
            'duplicate_dates': 0,
            'score': 0
        }
        
        valid_dates = df['date'].dropna().sort_values()
        if len(valid_dates) > 0:
            quality_report['date_range'] = {
                'start': valid_dates.min().strftime('%Y-%m-%d'),
                'end': valid_dates.max().strftime('%Y-%m-%d'),
                'days': (valid_dates.max() - valid_dates.min()).days + 1
            }
            
            all_dates = pd.date_range(start=valid_dates.min(), end=valid_dates.max())
            existing_dates = set(valid_dates.dt.date)
            quality_report['date_gaps'] = len(all_dates) - len(existing_dates)
        
        quality_report['duplicate_dates'] = int(df['date'].duplicated().sum())
        
        score = 100
        total_rows = max(len(df), 1)
        
        score -= (quality_report['missing_dates'] / total_rows) * 30
        score -= (quality_report['missing_steps'] / total_rows) * 30
        score -= (quality_report['date_gaps'] / max(quality_report['date_range']['days'], 1)) * 20 if quality_report['date_range'] else 0
        score -= quality_report['duplicate_dates'] * 2
        
        quality_report['score'] = max(0, min(100, int(score)))
        self.import_report['data_quality_score'] = quality_report['score']
        
        return quality_report

    def validate_data_requirements(self, df: pd.DataFrame, 
                                   min_days: int = 7,
                                   min_avg_steps: int = 1000) -> Tuple[bool, List[str]]:
        errors = []
        warnings = []
        
        if len(df) == 0:
            errors.append("数据为空，请检查文件内容")
            return False, errors
        
        if len(df) < min_days:
            errors.append(f"数据天数不足，至少需要 {min_days} 天，当前只有 {len(df)} 天")
        
        avg_steps = df['steps'].mean()
        if avg_steps < min_avg_steps:
            warnings.append(f"日均步数较低 ({int(avg_steps)}步)，数据可能异常")
        
        if df['steps'].max() > 50000:
            warnings.append(f"存在异常高步数 ({df['steps'].max()}步)，请确认数据正确性")
        
        valid_dates = df['date'].dropna().sort_values()
        if len(valid_dates) > 1:
            date_range_days = (valid_dates.max() - valid_dates.min()).days + 1
            if date_range_days > len(valid_dates) * 1.5:
                warnings.append("数据存在较多日期断层")
        
        for warning in warnings:
            self.import_report['warnings'].append(warning)
        
        return len(errors) == 0, errors + warnings

    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        before_count = len(df)
        df = df.drop_duplicates(subset=['date'], keep='last')
        duplicates = before_count - len(df)
        self.import_report['duplicate_rows'] = int(duplicates)
        
        if duplicates > 0:
            self.import_report['warnings'].append(f"移除了 {duplicates} 条重复日期数据")
        
        return df

    def get_import_report(self) -> Dict[str, Any]:
        return self.import_report

    def print_import_report(self):
        report = self.import_report
        print("\n" + "=" * 60)
        print("                  数据导入报告")
        print("=" * 60)
        
        quality_score = report.get('data_quality_score', 0)
        quality_color = "🟢" if quality_score >= 80 else "🟡" if quality_score >= 60 else "🔴"
        print(f"\n{quality_color} 数据质量评分: {quality_score}/100")
        
        print(f"\n📁 文件信息:")
        print(f"  文件路径: {report.get('file_path', 'N/A')}")
        print(f"  文件类型: {report.get('file_type', 'N/A')}")
        
        if 'sheet_used' in report:
            print(f"  工作表: {report.get('sheet_used', 'N/A')}")
        
        print(f"\n📊 数据统计:")
        print(f"  总行数: {report.get('total_rows', 0)}")
        print(f"  有效行数: {report.get('valid_rows', 0)}")
        print(f"  无效行数: {report.get('invalid_rows', 0)}")
        
        print(f"\n⚠️  数据问题:")
        print(f"  缺失/无效日期: {report.get('missing_dates', 0)} 行")
        print(f"  缺失/无效步数: {report.get('missing_steps', 0)} 行")
        print(f"  零步数列: {report.get('zero_steps', 0)} 行")
        print(f"  重复日期: {report.get('duplicate_rows', 0)} 行")
        
        warnings = report.get('warnings', [])
        if warnings:
            print(f"\n🔔 警告信息:")
            for warning in warnings[:5]:
                print(f"  - {warning}")
            if len(warnings) > 5:
                print(f"  ... 还有 {len(warnings) - 5} 条警告")
        
        print("\n" + "=" * 60)
