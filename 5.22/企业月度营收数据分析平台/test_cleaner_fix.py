import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.data_cleaner import DataCleaner


def test_data_cleaner_fixes():
    cleaner = DataCleaner()
    
    print("=" * 70)
    print("数据清洗修复验证测试")
    print("=" * 70)
    
    test_cases = [
        {
            "name": "1. None 值处理测试",
            "data": {
                'department': None,
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'region': None,
                'business_type': None,
                'customer_type': None,
                'company_name': None
            },
            "expect_valid": True,
            "expect_department": "未指定",
            "expect_region": "未指定"
        },
        {
            "name": "2. 'None' 字符串处理",
            "data": {
                'department': 'None',
                'revenue_amount': 2000,
                'revenue_date': '2024-01-15',
                'company_name': 'nan'
            },
            "expect_valid": True,
            "expect_department": "未指定",
            "expect_company": "未指定"
        },
        {
            "name": "3. 金额带货币符号和千分位",
            "data": {
                'department': '销售部',
                'revenue_amount': '¥12,345.67',
                'revenue_date': '2024-01-15'
            },
            "expect_valid": True,
            "expect_amount": 12345.67
        },
        {
            "name": "4. 日期格式 - 年月日中文",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024年5月20日'
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
        {
            "name": "5. 日期格式 - 纯数字",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '20240520'
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
        {
            "name": "6. 日期格式 - 点分隔",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024.05.20'
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
        {
            "name": "7. 日期格式 - 日-月-年",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '20-05-2024'
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
        {
            "name": "8. 日期格式 - 月/日/年",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '05/20/2024'
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
        {
            "name": "9. 无效日期 - 格式错误",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024/15/20'
            },
            "expect_valid": False
        },
        {
            "name": "10. 无效日期 - 空值",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': ''
            },
            "expect_valid": False
        },
        {
            "name": "11. 无效金额 - 负数",
            "data": {
                'department': '销售部',
                'revenue_amount': -500,
                'revenue_date': '2024-01-15'
            },
            "expect_valid": False
        },
        {
            "name": "12. 无效金额 - 非数字",
            "data": {
                'department': '销售部',
                'revenue_amount': 'abc',
                'revenue_date': '2024-01-15'
            },
            "expect_valid": False
        },
        {
            "name": "13. 部门模糊匹配 - HR",
            "data": {
                'department': 'HR',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15'
            },
            "expect_valid": True,
            "expect_department": "人力资源部"
        },
        {
            "name": "14. 部门模糊匹配 - 技术支持",
            "data": {
                'department': '技术支持中心',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15'
            },
            "expect_valid": True,
            "expect_department": "技术部"
        },
        {
            "name": "15. 地区映射 - 上海",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'region': '上海市'
            },
            "expect_valid": True,
            "expect_region": "华东"
        },
        {
            "name": "16. 地区映射 - 广东",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'region': '广东省深圳市'
            },
            "expect_valid": True,
            "expect_region": "华南"
        },
        {
            "name": "17. 业务类型 - 产品卖货",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'business_type': '产品卖货收入'
            },
            "expect_valid": True,
            "expect_business": "产品销售"
        },
        {
            "name": "18. 客户类型 - 国企",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'customer_type': '国企客户'
            },
            "expect_valid": True,
            "expect_customer": "政府机构"
        },
        {
            "name": "19. 公司名称 - 多余空格",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '2024-01-15',
                'company_name': '  测试  科技  有限公司  '
            },
            "expect_valid": True,
            "expect_company": "测试 科技 有限公司"
        },
        {
            "name": "20. 日期带多余空格",
            "data": {
                'department': '销售部',
                'revenue_amount': 1000,
                'revenue_date': '  2024 - 05 - 20  '
            },
            "expect_valid": True,
            "expect_date": "2024-05-20"
        },
    ]
    
    passed = 0
    failed = 0
    
    for tc in test_cases:
        print(f"\n{'─' * 70}")
        print(f"测试: {tc['name']}")
        print(f"输入: {tc['data']}")
        
        is_valid, cleaned, errors = cleaner.clean_single_record(tc['data'])
        
        print(f"结果: {'有效' if is_valid else '无效'}")
        if errors:
            print(f"错误: {errors}")
        
        test_pass = True
        
        if is_valid != tc['expect_valid']:
            print(f"❌ 有效性不匹配: 期望 {tc['expect_valid']}, 实际 {is_valid}")
            test_pass = False
        
        if is_valid:
            print(f"清洗后: {cleaned}")
            
            if 'expect_department' in tc:
                if cleaned.get('department') != tc['expect_department']:
                    print(f"❌ 部门不匹配: 期望 {tc['expect_department']}, 实际 {cleaned.get('department')}")
                    test_pass = False
            
            if 'expect_region' in tc:
                if cleaned.get('region') != tc['expect_region']:
                    print(f"❌ 地区不匹配: 期望 {tc['expect_region']}, 实际 {cleaned.get('region')}")
                    test_pass = False
            
            if 'expect_date' in tc:
                if cleaned.get('revenue_date') != tc['expect_date']:
                    print(f"❌ 日期不匹配: 期望 {tc['expect_date']}, 实际 {cleaned.get('revenue_date')}")
                    test_pass = False
            
            if 'expect_amount' in tc:
                if cleaned.get('revenue_amount') != tc['expect_amount']:
                    print(f"❌ 金额不匹配: 期望 {tc['expect_amount']}, 实际 {cleaned.get('revenue_amount')}")
                    test_pass = False
            
            if 'expect_business' in tc:
                if cleaned.get('business_type') != tc['expect_business']:
                    print(f"❌ 业务类型不匹配: 期望 {tc['expect_business']}, 实际 {cleaned.get('business_type')}")
                    test_pass = False
            
            if 'expect_customer' in tc:
                if cleaned.get('customer_type') != tc['expect_customer']:
                    print(f"❌ 客户类型不匹配: 期望 {tc['expect_customer']}, 实际 {cleaned.get('customer_type')}")
                    test_pass = False
            
            if 'expect_company' in tc:
                if cleaned.get('company_name') != tc['expect_company']:
                    print(f"❌ 公司名称不匹配: 期望 {tc['expect_company']}, 实际 {cleaned.get('company_name')}")
                    test_pass = False
        
        if test_pass:
            passed += 1
            print(f"✅ 测试通过")
        else:
            failed += 1
    
    print(f"\n{'=' * 70}")
    print(f"测试结果: 通过 {passed}/{len(test_cases)}, 失败 {failed}")
    print(f"{'=' * 70}")
    
    return failed == 0


if __name__ == '__main__':
    success = test_data_cleaner_fixes()
    sys.exit(0 if success else 1)
