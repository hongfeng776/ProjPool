CREATE DATABASE factory_3d;

\c factory_3d;

CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'normal',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_records (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  inspector VARCHAR(100),
  inspection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20),
  notes TEXT
);

INSERT INTO devices (name, type, status, position_x, position_y, position_z, description) VALUES
('设备 A', '电机', 'normal', -5, 0, 0, '主生产线驱动电机'),
('设备 B', '泵', 'normal', 0, 0, -5, '冷却循环水泵'),
('设备 C', '压缩机', 'normal', 5, 0, 0, '空气压缩机');
