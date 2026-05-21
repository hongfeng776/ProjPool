$(function() {
    function updateCurrentDate() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        var weekDay = weekDays[now.getDay()];
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        
        $('#current-date').text(
            year + '年' + month + '月' + day + '日 星期' + weekDay + ' ' + hours + ':' + minutes
        );
    }

    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);

    function checkDbStatus() {
        $.ajax({
            url: '/api/db/status',
            type: 'GET',
            timeout: 5000,
            success: function(response) {
                var $dot = $('#status-dot');
                var $text = $('#status-text');
                
                if (response.status === 'connected') {
                    $dot.removeClass('disconnected').addClass('connected');
                    $text.text('数据库正常');
                } else {
                    $dot.removeClass('connected').addClass('disconnected');
                    $text.text('连接异常');
                }
            },
            error: function() {
                $('#status-dot').removeClass('connected').addClass('disconnected');
                $('#status-text').text('连接失败');
            }
        });
    }

    checkDbStatus();
    setInterval(checkDbStatus, 30000);
});

function logout() {
    if (confirm('确定要退出登录吗？')) {
        $.ajax({
            url: '/api/auth/logout',
            type: 'POST',
            success: function(response) {
                if (response.success) {
                    window.location.href = '/login';
                } else {
                    alert('退出失败: ' + response.message);
                }
            },
            error: function() {
                window.location.href = '/login';
            }
        });
    }
}
