CREATE DATABASE IF NOT EXISTS revenue_analysis DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE revenue_analysis;

CREATE TABLE IF NOT EXISTS revenue_data (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    company_name VARCHAR(100) NOT NULL COMMENT '公司名称',
    department VARCHAR(50) COMMENT '部门',
    business_type VARCHAR(50) COMMENT '业务类型',
    revenue_amount DECIMAL(15, 2) NOT NULL COMMENT '营收金额',
    revenue_date DATE NOT NULL COMMENT '营收日期',
    year INT NOT NULL COMMENT '年份',
    month INT NOT NULL COMMENT '月份',
    region VARCHAR(50) COMMENT '地区',
    customer_type VARCHAR(50) COMMENT '客户类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_year_month (year, month),
    INDEX idx_department (department),
    INDEX idx_region (region),
    INDEX idx_revenue_date (revenue_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营收数据表';
