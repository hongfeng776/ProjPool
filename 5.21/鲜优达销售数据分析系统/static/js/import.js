$(function() {
    var selectedFile = null;
    var $uploadArea = $('#upload-area');
    var $fileInput = $('#file-input');
    var $fileInfo = $('#file-info');
    var $fileName = $('#file-name');
    var $fileSize = $('#file-size');
    var $uploadBtn = $('#upload-btn');
    var $downloadBtn = $('#download-template');
    var $resultSection = $('#result-section');
    var $loadingOverlay = $('#loading-overlay');

    $uploadArea.on('click', function() {
        $fileInput.click();
    });

    $uploadArea.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $uploadArea.addClass('drag-over');
    });

    $uploadArea.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $uploadArea.removeClass('drag-over');
    });

    $uploadArea.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $uploadArea.removeClass('drag-over');
        
        var files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    $fileInput.on('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    $('#remove-file').on('click', function(e) {
        e.stopPropagation();
        resetFileSelect();
    });

    $downloadBtn.on('click', function() {
        window.location.href = '/api/import/template';
    });

    $uploadBtn.on('click', function() {
        if (!selectedFile) {
            alert('请先选择要上传的文件');
            return;
        }
        uploadFile();
    });

    function handleFileSelect(file) {
        var allowedExtensions = ['xlsx', 'xls'];
        var fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (allowedExtensions.indexOf(fileExtension) === -1) {
            alert('请上传 .xlsx 或 .xls 格式的文件');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('文件大小不能超过 10MB');
            return;
        }

        selectedFile = file;
        $fileName.text(file.name);
        $fileSize.text(formatFileSize(file.size));
        $fileInfo.show();
        $uploadBtn.prop('disabled', false);
        $resultSection.hide();
    }

    function resetFileSelect() {
        selectedFile = null;
        $fileInput.val('');
        $fileInfo.hide();
        $uploadBtn.prop('disabled', true);
        $resultSection.hide();
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function uploadFile() {
        var formData = new FormData();
        formData.append('file', selectedFile);

        showLoading();

        $.ajax({
            url: '/api/import/sales',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        var percent = Math.round((e.loaded / e.total) * 100);
                        updateProgress(percent);
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                hideLoading();
                if (response.success) {
                    displayResult(response.data);
                } else {
                    alert('导入失败: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                hideLoading();
                try {
                    var response = JSON.parse(xhr.responseText);
                    alert('导入失败: ' + response.message);
                } catch (e) {
                    alert('导入失败: 网络错误，请重试');
                }
            }
        });
    }

    function showLoading() {
        $loadingOverlay.show();
        updateProgress(0);
    }

    function hideLoading() {
        $loadingOverlay.hide();
    }

    function updateProgress(percent) {
        $('#progress-fill').css('width', percent + '%');
        $('#progress-text').text(percent + '%');
    }

    function displayResult(data) {
        var $resultStats = $('#result-stats');
        var $resultSummary = $('#result-summary');
        var $resultTbody = $('#result-tbody');

        var statsHtml = '<div class="result-stats">' +
            '<div class="result-stat total">' +
            '<div class="result-stat-icon">📊</div>' +
            '<div class="result-stat-info">' +
            '<p class="result-stat-value">' + data.total + '</p>' +
            '<p class="result-stat-label">总计</p>' +
            '</div></div>' +
            '<div class="result-stat success">' +
            '<div class="result-stat-icon">✅</div>' +
            '<div class="result-stat-info">' +
            '<p class="result-stat-value">' + data.success + '</p>' +
            '<p class="result-stat-label">成功</p>' +
            '</div></div>' +
            '<div class="result-stat skipped">' +
            '<div class="result-stat-icon">⚠️</div>' +
            '<div class="result-stat-info">' +
            '<p class="result-stat-value">' + data.skipped + '</p>' +
            '<p class="result-stat-label">跳过</p>' +
            '</div></div>' +
            '<div class="result-stat failed">' +
            '<div class="result-stat-icon">❌</div>' +
            '<div class="result-stat-info">' +
            '<p class="result-stat-value">' + data.failed + '</p>' +
            '<p class="result-stat-label">失败</p>' +
            '</div></div>' +
            '</div>';

        $resultStats.html(statsHtml);

        var summaryText = '';
        if (data.success > 0 && data.failed === 0 && data.skipped === 0) {
            summaryText = '<div class="alert alert-success">🎉 导入完成！全部 ' + data.success + ' 条数据导入成功。</div>';
        } else if (data.failed > 0) {
            summaryText = '<div class="alert alert-warning">⚠️ 导入完成！成功 ' + data.success + ' 条，跳过 ' + data.skipped + ' 条，失败 ' + data.failed + ' 条。请查看下方详情。</div>';
        } else {
            summaryText = '<div class="alert alert-info">ℹ️ 导入完成！成功 ' + data.success + ' 条，跳过 ' + data.skipped + ' 条。</div>';
        }
        $resultSummary.html(summaryText);

        if (data.errors && data.errors.length > 0) {
            var errorsHtml = '';
            data.errors.forEach(function(err) {
                errorsHtml += '<tr>' +
                    '<td>' + err.row + '</td>' +
                    '<td>-</td>' +
                    '<td>-</td>' +
                    '<td>-</td>' +
                    '<td>-</td>' +
                    '<td><span class="status-badge warning">跳过/失败</span></td>' +
                    '<td>' + err.message + '</td>' +
                    '</tr>';
            });
            $resultTbody.html(errorsHtml);
            $('#result-details').show();
        } else {
            $('#result-details').hide();
        }

        $resultSection.show();
        $resultSection[0].scrollIntoView({ behavior: 'smooth' });
    }

    $('.status-dot').addClass('disconnected');
    $('.status-text').text('未连接');
});
