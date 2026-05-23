def print_step_summary(stats):
    print("\n" + "=" * 60)
    print("                  步数统计摘要")
    print("=" * 60)
    
    print(f"\n📅 统计周期: {stats['start_date']} 至 {stats['end_date']}")
    print(f"📊 统计天数: {stats['total_days']} 天")
    
    print("\n" + "-" * 60)
    print("📈 步数统计:")
    print(f"  总步数: {stats['total_steps']:,} 步")
    print(f"  平均步数: {stats['avg_steps']:,} 步/天")
    print(f"  中位数: {stats['median_steps']:,} 步")
    print(f"  最高步数: {stats['max_steps']:,} 步 ({stats['max_date']})")
    print(f"  最低步数: {stats['min_steps']:,} 步 ({stats['min_date']})")
    print(f"  标准差: {stats['std_steps']:,} 步")
    
    print("\n" + "-" * 60)
    print("🎯 目标达成情况:")
    print(f"  1万步以上天数: {stats['days_above_10000']} 天 ({stats['pct_above_10000']}%)")
    print(f"  8千步以上天数: {stats['days_above_8000']} 天")
    print(f"  5千步以下天数: {stats['days_below_5000']} 天")
    
    print("\n" + "-" * 60)
    print("📅 工作日 vs 周末:")
    print(f"  工作日平均: {stats['weekday_avg']:,} 步")
    print(f"  周末平均: {stats['weekend_avg']:,} 步")
    
    print("\n" + "=" * 60)


def format_number(num):
    return f"{int(num):,}"


def format_date(date_obj):
    return date_obj.strftime('%Y-%m-%d')
