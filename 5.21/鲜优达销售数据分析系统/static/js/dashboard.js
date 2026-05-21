$(function() {
    function loadStats() {
        $.ajax({
            url: '/api/dashboard/stats',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data) {
                    var data = response.data;
                    $('#total-sales').text('¥' + data.total_sales.toFixed(2));
                    $('#total-orders').text(data.total_orders);
                    $('#total-products').text(data.total_products);
                    $('#total-stock').text(data.total_stock);
                }
            }
        });
    }

    function initSalesTrendChart() {
        var chart = echarts.init(document.getElementById('sales-trend-chart'));
        
        $.ajax({
            url: '/api/sales/trend',
            type: 'GET',
            success: function(response) {
                var dates = [];
                var amounts = [];
                
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach(function(item) {
                        dates.push(item.date);
                        amounts.push(item.amount);
                    });
                } else {
                    dates = ['5-01', '5-02', '5-03', '5-04', '5-05', '5-06', '5-07'];
                    amounts = [2300, 2800, 2200, 3100, 2900, 3500, 4200];
                }

                var option = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}<br/>销售额: ¥{c}'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dates,
                        axisLine: { lineStyle: { color: '#ddd' } },
                        axisLabel: { color: '#666' }
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: { lineStyle: { color: '#ddd' } },
                        axisLabel: { color: '#666', formatter: '¥{value}' },
                        splitLine: { lineStyle: { color: '#f0f0f0' } }
                    },
                    series: [{
                        name: '销售额',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        lineStyle: {
                            width: 3,
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#667eea' },
                                { offset: 1, color: '#764ba2' }
                            ])
                        },
                        itemStyle: {
                            color: '#667eea',
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                            ])
                        },
                        data: amounts
                    }]
                };

                chart.setOption(option);
            }
        });

        $(window).resize(function() { chart.resize(); });
    }

    function initCategoryPieChart() {
        var chart = echarts.init(document.getElementById('category-pie-chart'));
        
        $.ajax({
            url: '/api/sales/category',
            type: 'GET',
            success: function(response) {
                var data = [];
                
                if (response.success && response.data && response.data.length > 0) {
                    data = response.data;
                } else {
                    data = [
                        { name: '蔬菜', value: 3500 },
                        { name: '水果', value: 2800 },
                        { name: '肉类', value: 4200 },
                        { name: '水产', value: 1500 },
                        { name: '蛋奶', value: 1800 }
                    ];
                }

                var colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}: ¥{c} ({d}%)'
                    },
                    legend: {
                        orient: 'vertical',
                        right: '5%',
                        top: 'center',
                        itemWidth: 12,
                        itemHeight: 12,
                        textStyle: { color: '#666' }
                    },
                    color: colors,
                    series: [{
                        type: 'pie',
                        radius: ['45%', '70%'],
                        center: ['40%', '50%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 8,
                            borderColor: '#fff',
                            borderWidth: 3
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 18,
                                fontWeight: 'bold',
                                formatter: '{b}\n¥{c}'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: data
                    }]
                };

                chart.setOption(option);
            }
        });

        $(window).resize(function() { chart.resize(); });
    }

    function initProductRankChart() {
        var chart = echarts.init(document.getElementById('product-rank-chart'));
        
        $.ajax({
            url: '/api/sales/rank',
            type: 'GET',
            success: function(response) {
                var names = [];
                var quantities = [];
                
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach(function(item) {
                        names.push(item.name);
                        quantities.push(item.quantity);
                    });
                } else {
                    names = ['大白菜', '西红柿', '苹果', '猪肉', '黄瓜', '土豆', '香蕉', '牛肉', '鸡蛋', '橙子'];
                    quantities = [45.5, 38.0, 35.0, 28.0, 26.5, 25.0, 23.5, 18.0, 20.0, 22.0];
                }

                var option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        formatter: '{b}: {c} 斤'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        axisLine: { lineStyle: { color: '#ddd' } },
                        axisLabel: { color: '#666' },
                        splitLine: { lineStyle: { color: '#f0f0f0' } }
                    },
                    yAxis: {
                        type: 'category',
                        data: names.reverse(),
                        axisLine: { lineStyle: { color: '#ddd' } },
                        axisLabel: { color: '#666' }
                    },
                    series: [{
                        type: 'bar',
                        data: quantities.reverse(),
                        barWidth: '55%',
                        itemStyle: {
                            borderRadius: [0, 6, 6, 0],
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#43e97b' },
                                { offset: 1, color: '#38f9d7' }
                            ])
                        },
                        emphasis: {
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    { offset: 0, color: '#667eea' },
                                    { offset: 1, color: '#764ba2' }
                                ])
                            }
                        }
                    }]
                };

                chart.setOption(option);
            }
        });

        $(window).resize(function() { chart.resize(); });
    }

    loadStats();
    initSalesTrendChart();
    initCategoryPieChart();
    initProductRankChart();
});
