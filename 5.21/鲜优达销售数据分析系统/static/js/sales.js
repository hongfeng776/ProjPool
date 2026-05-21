$(function() {
    var salesTrendChart = null;
    var categoryPieChart = null;
    var currentDays = 7;

    function loadTodayStats() {
        $.ajax({
            url: '/api/sales/today',
            type: 'GET',
            success: function(response) {
                if (response.success && response.data) {
                    var data = response.data;
                    
                    $('#today-sales').text('¥' + data.today_sales.toFixed(2));
                    $('#today-orders').text(data.today_orders);
                    $('#today-avg-price').text('¥' + data.avg_price.toFixed(2));
                    
                    updateTrendTag('sales-trend-tag', data.sales_change);
                    updateTrendTag('orders-trend-tag', data.orders_change);
                    updateTrendTag('avg-trend-tag', data.avg_change);
                }
            },
            error: function() {
                useMockTodayStats();
            }
        });
    }

    function useMockTodayStats() {
        var mockData = {
            today_sales: 2856.50,
            today_orders: 68,
            avg_price: 42.01,
            sales_change: 12.5,
            orders_change: 8.3,
            avg_change: 3.8
        };
        
        $('#today-sales').text('¥' + mockData.today_sales.toFixed(2));
        $('#today-orders').text(mockData.today_orders);
        $('#today-avg-price').text('¥' + mockData.avg_price.toFixed(2));
        
        updateTrendTag('sales-trend-tag', mockData.sales_change);
        updateTrendTag('orders-trend-tag', mockData.orders_change);
        updateTrendTag('avg-trend-tag', mockData.avg_change);
    }

    function updateTrendTag(elementId, change) {
        var $tag = $('#' + elementId);
        var $icon = $tag.find('.trend-icon');
        var $text = $tag.find('.trend-text');
        
        if (change > 0) {
            $tag.removeClass('down');
            $icon.text('📈');
            $text.text('较昨日 +' + change + '%');
        } else if (change < 0) {
            $tag.addClass('down');
            $icon.text('📉');
            $text.text('较昨日 ' + change + '%');
        } else {
            $tag.removeClass('down');
            $icon.text('➡️');
            $text.text('较昨日 持平');
        }
    }

    function initSalesTrendChart(days) {
        if (!salesTrendChart) {
            salesTrendChart = echarts.init(document.getElementById('sales-trend-chart'));
            $(window).resize(function() { salesTrendChart.resize(); });
        }

        $.ajax({
            url: '/api/sales/trend?days=' + days,
            type: 'GET',
            success: function(response) {
                var dates = [];
                var amounts = [];
                
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach(function(item) {
                        dates.push(formatDateShort(item.date));
                        amounts.push(item.amount);
                    });
                } else {
                    var mockDates = generateMockDates(days);
                    dates = mockDates;
                    amounts = generateMockAmounts(days);
                }

                renderSalesTrendChart(dates, amounts);
            },
            error: function() {
                var mockDates = generateMockDates(days);
                var mockAmounts = generateMockAmounts(days);
                renderSalesTrendChart(mockDates, mockAmounts);
            }
        });
    }

    function renderSalesTrendChart(dates, amounts) {
        var option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                textStyle: { color: '#333' },
                formatter: function(params) {
                    return params[0].name + '<br/>销售额: ¥' + params[0].value.toFixed(2);
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLine: { lineStyle: { color: '#ddd' } },
                axisLabel: { color: '#666', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ddd' } },
                axisLabel: { 
                    color: '#666', 
                    fontSize: 12,
                    formatter: function(value) {
                        if (value >= 1000) {
                            return '¥' + (value / 1000).toFixed(1) + 'k';
                        }
                        return '¥' + value;
                    }
                },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
            },
            series: [{
                name: '销售额',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 4,
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#667eea' },
                        { offset: 1, color: '#764ba2' }
                    ])
                },
                itemStyle: {
                    color: '#667eea',
                    borderColor: '#fff',
                    borderWidth: 3
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                        { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
                    ])
                },
                data: amounts
            }]
        };

        salesTrendChart.setOption(option, true);
    }

    function initCategoryPieChart() {
        if (!categoryPieChart) {
            categoryPieChart = echarts.init(document.getElementById('category-pie-chart'));
            $(window).resize(function() { categoryPieChart.resize(); });
        }

        $.ajax({
            url: '/api/sales/category',
            type: 'GET',
            success: function(response) {
                console.log('分类销售API返回:', response);
                console.log('API返回分类数据:', response.data);
                if (response.debug) {
                    console.log('原始记录调试信息:', response.debug);
                }
                
                var data = [];
                
                if (response.success && response.data && response.data.length > 0) {
                    data = response.data.map(function(item) {
                        return {
                            name: String(item.name),
                            value: parseFloat(item.value)
                        };
                    }).filter(function(item) {
                        return item.value > 0 && item.name && item.name.length > 0;
                    });
                    
                    console.log('处理后的数据:', data);
                    console.log('分类数量:', data.length);
                }
                
                if (data.length === 0) {
                    data = [
                        { name: '蔬菜', value: 3500 },
                        { name: '水果', value: 2800 },
                        { name: '肉类', value: 4200 },
                        { name: '水产', value: 1500 },
                        { name: '蛋奶', value: 1800 }
                    ];
                }

                renderCategoryPieChart(data);
            },
            error: function() {
                console.log('API请求失败，使用模拟数据');
                var mockData = [
                    { name: '蔬菜', value: 3500 },
                    { name: '水果', value: 2800 },
                    { name: '肉类', value: 4200 },
                    { name: '水产', value: 1500 },
                    { name: '蛋奶', value: 1800 }
                ];
                renderCategoryPieChart(mockData);
            }
        });
    }

    function renderCategoryPieChart(data) {
        console.log('渲染饼图数据:', JSON.stringify(data));
        console.log('数据条数:', data.length);
        
        var colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffd54f', '#ffa726'];
        
        var chartData = data.map(function(item, index) {
            return {
                name: String(item.name),
                value: parseFloat(item.value),
                itemStyle: {
                    color: colors[index % colors.length]
                }
            };
        });
        
        console.log('处理后的图表数据:', JSON.stringify(chartData));

        var option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e0e0e0',
                borderWidth: 1,
                textStyle: { color: '#333' },
                formatter: function(params) {
                    return params.name + ': ¥' + Number(params.value).toFixed(2) + ' (' + params.percent + '%)';
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 'middle',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: { color: '#666', fontSize: 12 },
                data: chartData.map(function(item) { return item.name; })
            },
            color: colors,
            series: [{
                name: '销售分类',
                type: 'pie',
                radius: ['40%', '65%'],
                center: ['38%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
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
                        formatter: function(params) {
                            return params.name + '\n¥' + Number(params.value).toFixed(2);
                        },
                        color: '#1a237e'
                    },
                    itemStyle: {
                        shadowBlur: 20,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: chartData
            }]
        };

        categoryPieChart.clear();
        categoryPieChart.setOption(option, true);
        
        setTimeout(function() {
            categoryPieChart.resize();
        }, 100);
    }

    function loadTodaySalesList() {
        $.ajax({
            url: '/api/sales/today/list',
            type: 'GET',
            success: function(response) {
                var html = '';
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach(function(item) {
                        html += '<tr>' +
                            '<td>' + item.product_name + '</td>' +
                            '<td>' + item.quantity + '</td>' +
                            '<td>¥' + item.total_amount.toFixed(2) + '</td>' +
                            '<td><span class="customer-badge ' + item.customer_type + '">' + item.customer_type + '</span></td>' +
                            '</tr>';
                    });
                } else {
                    html = '<tr><td colspan="4" class="empty-text">今日暂无销售记录</td></tr>';
                }
                $('#today-sales-tbody').html(html);
            },
            error: function() {
                var mockData = [
                    { product_name: '大白菜', quantity: 10.5, total_amount: 36.75, customer_type: '散客' },
                    { product_name: '西红柿', quantity: 8.0, total_amount: 46.40, customer_type: '会员' },
                    { product_name: '苹果', quantity: 5.0, total_amount: 42.50, customer_type: '散客' },
                    { product_name: '猪肉', quantity: 3.0, total_amount: 84.00, customer_type: '会员' },
                    { product_name: '黄瓜', quantity: 6.5, total_amount: 27.30, customer_type: '散客' }
                ];
                var html = '';
                mockData.forEach(function(item) {
                    html += '<tr>' +
                        '<td>' + item.product_name + '</td>' +
                        '<td>' + item.quantity + '</td>' +
                        '<td>¥' + item.total_amount.toFixed(2) + '</td>' +
                        '<td><span class="customer-badge ' + item.customer_type + '">' + item.customer_type + '</span></td>' +
                        '</tr>';
                });
                $('#today-sales-tbody').html(html);
            }
        });
    }

    function formatDateShort(dateStr) {
        var parts = dateStr.split('-');
        if (parts.length === 3) {
            return parts[1] + '-' + parts[2];
        }
        return dateStr;
    }

    function generateMockDates(days) {
        var dates = [];
        var today = new Date();
        for (var i = days - 1; i >= 0; i--) {
            var d = new Date(today);
            d.setDate(d.getDate() - i);
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            dates.push(month + '-' + day);
        }
        return dates;
    }

    function generateMockAmounts(days) {
        var amounts = [];
        var baseAmount = 2500;
        for (var i = 0; i < days; i++) {
            var variation = (Math.random() - 0.5) * 800;
            amounts.push(Math.round(baseAmount + variation));
        }
        return amounts;
    }

    $('.chart-btn').on('click', function() {
        var days = $(this).data('days');
        $('.chart-btn').removeClass('active');
        $(this).addClass('active');
        currentDays = days;
        initSalesTrendChart(days);
    });

    loadTodayStats();
    initSalesTrendChart(currentDays);
    initCategoryPieChart();
    loadTodaySalesList();

    setInterval(function() {
        loadTodayStats();
        loadTodaySalesList();
    }, 60000);
});
