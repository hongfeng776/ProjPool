-- =============================================
-- 鲜优达销售数据分析系统 数据库建表脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS xianyouda_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE xianyouda_db;

-- ---------------------------------------------
-- 商品表
-- ---------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL COMMENT '商品名称',
    category    VARCHAR(50)   NOT NULL COMMENT '商品类别',
    unit        VARCHAR(20)   DEFAULT '斤' COMMENT '单位',
    price       DECIMAL(10,2) NOT NULL COMMENT '单价',
    stock       INT           DEFAULT 0 COMMENT '库存',
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ---------------------------------------------
-- 销售记录表
-- ---------------------------------------------
DROP TABLE IF EXISTS sale_records;
CREATE TABLE sale_records (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT           NOT NULL COMMENT '商品ID',
    quantity        DECIMAL(10,2) NOT NULL COMMENT '销售数量',
    total_amount    DECIMAL(10,2) NOT NULL COMMENT '销售金额',
    sale_date       DATE          NOT NULL COMMENT '销售日期',
    customer_type   VARCHAR(20)   DEFAULT '散客' COMMENT '客户类型',
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_product_id (product_id),
    INDEX idx_sale_date (sale_date),
    CONSTRAINT fk_sales_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售记录表';

-- ---------------------------------------------
-- 进货记录表
-- ---------------------------------------------
DROP TABLE IF EXISTS stock_in;
CREATE TABLE stock_in (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT           NOT NULL COMMENT '商品ID',
    quantity    DECIMAL(10,2) NOT NULL COMMENT '进货数量',
    supplier    VARCHAR(100)  COMMENT '供应商',
    stock_date  DATE          NOT NULL COMMENT '进货日期',
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_product_id (product_id),
    INDEX idx_stock_date (stock_date),
    CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='进货记录表';

-- ---------------------------------------------
-- 示例数据
-- ---------------------------------------------
INSERT INTO products (name, category, unit, price, stock) VALUES
('大白菜', '蔬菜', '斤', 3.50, 200),
('西红柿', '蔬菜', '斤', 5.80, 150),
('黄瓜',   '蔬菜', '斤', 4.20, 180),
('土豆',   '蔬菜', '斤', 2.80, 300),
('胡萝卜', '蔬菜', '斤', 3.20, 160),
('苹果',   '水果', '斤', 8.50, 120),
('香蕉',   '水果', '斤', 6.00, 100),
('橙子',   '水果', '斤', 7.20, 140),
('猪肉',   '肉类', '斤', 28.00, 80),
('牛肉',   '肉类', '斤', 58.00, 50),
('鸡肉',   '肉类', '斤', 18.00, 100),
('草鱼',   '水产', '斤', 15.00, 60),
('鲤鱼',   '水产', '斤', 12.00, 70),
('鸡蛋',   '蛋奶', '斤', 10.50, 200),
('牛奶',   '蛋奶', '盒', 5.50, 150);

INSERT INTO sale_records (product_id, quantity, total_amount, sale_date, customer_type) VALUES
(1, 10.5, 36.75,  '2026-05-01', '散客'),
(2, 8.0,  46.40,  '2026-05-01', '会员'),
(6, 5.0,  42.50,  '2026-05-01', '散客'),
(9, 3.0,  84.00,  '2026-05-02', '会员'),
(1, 12.0, 42.00,  '2026-05-02', '散客'),
(3, 6.5,  27.30,  '2026-05-03', '散客'),
(11, 4.0,  72.00,  '2026-05-03', '会员'),
(7, 8.5,  51.00,  '2026-05-04', '散客'),
(14, 20.0, 210.00, '2026-05-04', '会员'),
(10, 2.0,  116.00, '2026-05-05', '散客'),
(5, 15.0, 48.00,  '2026-05-05', '会员'),
(8, 10.0, 72.00,  '2026-05-06', '散客'),
(4, 25.0, 70.00,  '2026-05-06', '会员'),
(12, 5.0,  75.00,  '2026-05-07', '散客'),
(2, 12.0, 69.60,  '2026-05-07', '散客'),
(1, 8.0,  28.00,  '2026-05-08', '会员'),
(6, 15.0, 127.50, '2026-05-08', '散客'),
(15, 30.0, 165.00, '2026-05-09', '会员'),
(9, 5.0,  140.00, '2026-05-09', '散客'),
(3, 10.0, 42.00,  '2026-05-10', '散客');

INSERT INTO stock_in (product_id, quantity, supplier, stock_date) VALUES
(1, 100, '绿源蔬菜基地', '2026-04-25'),
(2, 80,  '绿源蔬菜基地', '2026-04-25'),
(6, 60,  '鲜果汇', '2026-04-26'),
(9, 50,  '顺发肉联', '2026-04-27'),
(10, 30, '顺发肉联', '2026-04-27'),
(14, 100, '正大蛋业', '2026-04-28'),
(12, 40,  '海洋渔业', '2026-04-29'),
(15, 120, '蒙牛乳业', '2026-04-30');
