import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.data_cleaner import DataCleaner


def test_data_cleaner():
    cleaner = DataCleaner()
    
    print("=" * 60)
    print("数据清洗功能测试")
    print("=" * 60)
    
    test_records = [
        {
            'company_name': '测试公司A',
            'department': '销售',
            'business_type': '产品卖货',
            'revenue_amount': 15000.50,
            'revenue_date': '2024-01-15',
            'region': '上海',
            'customer_type': '企业客户'
        },
        {
            'company_name': '  测试公司B  ',
            'department': 'HR',
            'business_type': '',
            'revenue_amount': '8500.75',
            'revenue_date': '2024/02/20',
            'region': '广东',
            'customer_type': '个人'
        },
        {
            'company_name': '',
            'department': '技术部门',
            'business_type': '技术支持服务',
            'revenue_amount': None,
            'revenue_date': '2024年3月10日',
            'region': '北京',
            'customer_type': '政府'
        },
        {
            'company_name': '测试公司D',
            'department': '市场部',
            'business_type': '咨询',
            'revenue_amount': -500,
            'revenue_date': '20240405',
            'region': '四川',
            'customer_type': '合作伙伴'
        },
        {
            'company_name': '测试公司E',
            'department': '财务部',
            'business_type': '其他',
            'revenue_amount': 12000,
            'revenue_date': '',
            'region': '辽宁',
            'customer_type': ''
        },
        {
            'company_name': '测试公司F',
            'department': '运营',
            'business_type': '维护',
            'revenue_amount': 25000,
            'revenue_date': '31-12-2024',
            'region': '未知地区',
            'customer_type': '未知类型'
        },
        {
            'company_name': None,
            'department': '产品',
            'business_type': '外包',
            'revenue_amount': 18000.00,
            'revenue_date': '12/25/2024',
            'region': '',
            'customer_type': '公司客户'
        },
        {
            'company_name': '测试公司H',
            'department': '客服',
            'business_type': '软件',
            'revenue_amount': 'abc',
            'revenue_date': '2024-08-15',
            'region': '湖北',
            'customer_type': '企业'
        },
        {
            'company_name': '测试公司I',
            'department': '行政',
            'business_type': '服务收入',
            'revenue_amount': 9500.50,
            'revenue_date': '2024-09-30',
            'region': '陕西',
            'customer_type': '个人客户'
        },
        {
            'company_name': '测试公司J',
            'department': '研发部',
            'business_type': '项目外包',
            'revenue_amount': 35000,
            'revenue_date': '2024-10-01',
            'region': '新疆',
            'customer_type': '政府机构'
        }
    ]
    
    print(f"\n测试数据: {len(test_records)} 条")
    print("-" * 60)
    
    report = cleaner.clean_batch(test_records)
    
    print(f"\n清洗结果统计:")
    print(f"  总记录数: {report['total_count']}")
    print(f"  有效记录: {report['valid_count']}")
    print(f"  无效记录: {report['invalid_count']}")
    print(f"  有效率: {report['valid_rate']}%")
    
    print("\n" + "-" * 60)
    print("有效记录详情:")
    print("-" * 60)
    for i, record in enumerate(report['valid_records'], 1):
        print(f"\n第 {i} 条 (有效):")
        print(f"  公司名称: {record['company_name']}")
        print(f"  部门: {record['department']}")
        print(f"  业务类型: {record['business_type']}")
        print(f"  金额: {record['revenue_amount']}")
        print(f"  日期: {record['revenue_date']}")
        print(f"  年份: {record['year']}, 月份: {record['month']}")
        print(f"  地区: {record['region']}")
        print(f"  客户类型: {record['customer_type']}")
    
    print("\n" + "-" * 60)
    print("无效记录详情:")
    print("-" * 60)
    for inv in report['invalid_records']:
        print(f"\n第 {inv['index'] + 1} 条 (无效):")
        print(f"  错误: {', '.join(inv['errors'])}")
    
    print("\n" + "=" * 60)
    print("单条记录清洗测试:")
    print("=" * 60)
    
    single_test = {
        'department': '销售',
        'revenue_amount': '  25000.678  ',
        'revenue_date': '2024年5月20日'
    }
    is_valid, cleaned, errors = cleaner.clean_single_record(single_test)
    
    print(f"\n输入数据:")
    print(f"  部门: {single_test['department']}")
    print(f"  金额: '{single_test['revenue_amount']}'")
    print(f"  日期: {single_test['revenue_date']}")
    
    print(f"\n清洗结果:")
    print(f"  是否有效: {is_valid}")
    if is_valid:
        print(f"  规整后部门: {cleaned['department']}")
        print(f"  规整后金额: {cleaned['revenue_amount']}")
        print(f"  规整后日期: {cleaned['revenue_date']}")
        print(f"  自动提取年份: {cleaned['year']}")
        print(f"  自动提取月份: {cleaned['month']}")
    else:
        print(f"  错误信息: {errors}")
    
    print("\n" + "=" * 60)
    print("测试完成!")
    print("=" * 60)


if __name__ == '__main__':
    test_data_cleaner()
