$(function() {
    var trendChart = null;
    var pieChart = null;
    var currentDays = 7;

    function loadTodayStats() {
        $.ajax({
            url: '/api/sales/today-stats',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data) {
                    renderTodayStats(response.data);
                } else {
                    renderMockTodayStats();
                }
            },
            error: function() {
                renderMockTodayStats();
            }
        });
    }

    function renderTodayStats(data) {
        var today = data.today;
        var changes = data.changes;

        $('#today-sales').text('¥' + today.total_sales.toFixed(2));
        $('#today-orders').text(today.orders);
        $('#today-avg-price').text('¥' + today.avg_price.toFixed(2));
        $('#today-products').text(today.products);

        updateChangeValue('#today-sales-change .change-value', changes.sales);
        updateChangeValue('#today-orders-change .change-value', changes.orders);
        updateChangeValue('#today-avg-change .change-value', changes.avg_price);
    }

    function renderMockTodayStats() {
        $('#today-sales').text('¥2,486.50');
        $('#today-orders').text('86');
        $('#today-avg-price').text('¥28.91');
        $('#today-products').text('12');

        updateChangeValue('#today-sales-change .change-value', 12.5);
        updateChangeValue('#today-orders-change .change-value', 8.3);
        updateChangeValue('#today-avg-change .change-value', 3.8);
    }

    function updateChangeValue(selector, value) {
        var $el = $(selector);
        if (value > 0) {
            $el.text('+' + value + '%').removeClass('down').addClass('up');
        } else if (value < 0) {
            $el.text(value + '%').removeClass('up').addClass('down');
        } else {
            $el.text('0%').removeClass('up down');
        }
    }

    function loadTrendChart(days) {
        currentDays = days;
        $.ajax({
            url: '/api/sales/trend-days',
            type: 'GET',
            data: { days: days },
            success: function(response) {
                if (response.success && response.data && response.data.length > 0) {
                    renderTrendChart(response.data);
                } else {
                    renderMockTrendChart(days);
                }
            },
            error: function() {
                renderMockTrendChart(days);
            }
        });
    }

    function renderTrendChart(data) {
        if (!trendChart) {
            trendChart = echarts.init(document.getElementById('sales-trend-chart'));
            $(window).resize(function() { trendChart.resize(); });
        }

        var dates = data.map(function(item) { return item.display_date; });
        var amounts = data.map(function(item) { return item.amount; });
        var orders = data.map(function(item) { return item.orders; });

        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                formatter: function(params) {
                    var result = params[0].axisValue + '<br/>';
                    params.forEach(function(param) {
                        if (param.seriesName === '销售额') {
                            result += param.marker + param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>';
                        } else {
                            result += param.marker + param.seriesName + ': ' + param.value + ' 单<br/>';
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['销售额', '订单数'],
                top: 10,
                textStyle: { color: '#666' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: 60,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLine: { lineStyle: { color: '#ddd' } },
                axisLabel: { color: '#666' }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '销售额',
                    position: 'left',
                    axisLine: { lineStyle: { color: '#667eea' } },
                    axisLabel: { color: '#666', formatter: '¥{value}' },
                    splitLine: { lineStyle: { color: '#f0f0f0' } }
                },
                {
                    type: 'value',
                    name: '订单数',
                    position: 'right',
                    axisLine: { lineStyle: { color: '#f093fb' } },
                    axisLabel: { color: '#666', formatter: '{value} 单' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '销售额',
                    type: 'line',
                    yAxisIndex: 0,
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
                },
                {
                    name: '订单数',
                    type: 'bar',
                    yAxisIndex: 1,
                    barWidth: '35%',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(240, 147, 251, 0.8)' },
                            { offset: 1, color: 'rgba(245, 87, 108, 0.6)' }
                        ])
                    },
                    data: orders
                }
            ]
        };

        trendChart.setOption(option);
    }

    function renderMockTrendChart(days) {
        var mockData = [];
        var today = new Date();
        for (var i = days - 1; i >= 0; i--) {
            var d = new Date(today);
            d.setDate(d.getDate() - i);
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            mockData.push({
                date: d.toISOString().split('T')[0],
                display_date: month + '-' + day,
                amount: Math.round((1500 + Math.random() * 2500) * 100) / 100,
                orders: Math.floor(40 + Math.random() * 60)
            });
        }
        renderTrendChart(mockData);
    }

    function loadCategoryPieChart() {
        $.ajax({
            url: '/api/sales/category-amount',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data && response.data.length > 0) {
                    renderCategoryPieChart(response.data);
                } else {
                    renderMockCategoryPieChart();
                }
            },
            error: function() {
                renderMockCategoryPieChart();
            }
        });
    }

    function renderCategoryPieChart(data) {
        if (!pieChart) {
            pieChart = echarts.init(document.getElementById('category-pie-chart'));
            $(window).resize(function() { pieChart.resize(); });
        }

        var colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffc107'];

        var option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    return params.name + '<br/>销售额: ¥' + params.value.toFixed(2) + 
                           '<br/>占比: ' + params.data.percentage + '%';
                }
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'center',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: { color: '#666', fontSize: 13 },
                formatter: function(name) {
                    var item = data.find(function(d) { return d.name === name; });
                    if (item) {
                        return name + '  ' + item.percentage + '%';
                    }
                    return name;
                }
            },
            color: colors,
            series: [{
                type: 'pie',
                radius: ['50%', '75%'],
                center: ['35%', '50%'],
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
                        fontSize: 16,
                        fontWeight: 'bold',
                        formatter: function(params) {
                            return params.name + '\n¥' + params.value.toFixed(2);
                        }
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(function(item, index) {
                    return {
                        name: item.name,
                        value: item.value,
                        percentage: item.percentage,
                        itemStyle: { color: colors[index % colors.length] }
                    };
                })
            }]
        };

        pieChart.setOption(option);
    }

    function renderMockCategoryPieChart() {
        var mockData = [
            { name: '蔬菜', value: 3568.50, percentage: 35.2 },
            { name: '肉类', value: 2890.00, percentage: 28.5 },
            { name: '水果', value: 1856.80, percentage: 18.3 },
            { name: '蛋奶', value: 980.50, percentage: 9.7 },
            { name: '水产', value: 834.20, percentage: 8.3 }
        ];
        renderCategoryPieChart(mockData);
    }

    function loadTodayCategoryDetail() {
        $.ajax({
            url: '/api/sales/today-category-detail',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data && response.data.length > 0) {
                    renderTodayCategoryDetail(response.data);
                } else {
                    renderMockTodayCategoryDetail();
                }
            },
            error: function() {
                renderMockTodayCategoryDetail();
            }
        });
    }

    function renderTodayCategoryDetail(data) {
        var html = '';
        data.forEach(function(item) {
            html += '<tr>' +
                '<td><span class="category-badge">' + item.category + '</span></td>' +
                '<td>' + item.quantity.toFixed(2) + ' 斤</td>' +
                '<td>¥' + item.amount.toFixed(2) + '</td>' +
                '<td>' + item.orders + ' 单</td>' +
                '<td>' +
                    '<div class="progress-wrapper">' +
                        '<div class="progress-bar-small">' +
                            '<div class="progress-fill-small" style="width: ' + item.percentage + '%"></div>' +
                        '</div>' +
                        '<span class="progress-text-small">' + item.percentage + '%</span>' +
                    '</div>' +
                '</td>' +
                '</tr>';
        });
        $('#today-detail-tbody').html(html);
    }

    function renderMockTodayCategoryDetail() {
        var mockData = [
            { category: '蔬菜', quantity: 156.5, amount: 856.80, orders: 32, percentage: 34.5 },
            { category: '肉类', quantity: 68.5, amount: 725.00, orders: 18, percentage: 29.2 },
            { category: '水果', quantity: 45.0, amount: 428.50, orders: 15, percentage: 17.2 },
            { category: '蛋奶', quantity: 85.0, amount: 298.20, orders: 12, percentage: 12.0 },
            { category: '水产', quantity: 18.5, amount: 178.00, orders: 9, percentage: 7.1 }
        ];
        renderTodayCategoryDetail(mockData);
    }

    $('#trend-range').on('change', function() {
        var days = parseInt($(this).val());
        loadTrendChart(days);
    });

    function refreshData() {
        loadTodayStats();
        loadTrendChart(currentDays);
        loadCategoryPieChart();
        loadTodayCategoryDetail();
    }

    refreshData();
    setInterval(refreshData, 60000);
});
