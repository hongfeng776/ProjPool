import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProjectAttributes {
  id: number;
  name: string;
  description: string;
  roomType: string;
  area: number;
  style: string;
  budget: number;
  status: 'draft' | 'in_progress' | 'completed';
  thumbnail?: string;
  floorPlan?: string;
  sceneData?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public roomType!: string;
  public area!: number;
  public style!: string;
  public budget!: number;
  public status!: 'draft' | 'in_progress' | 'completed';
  public thumbnail?: string;
  public floorPlan?: string;
  public sceneData?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    roomType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    style: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sceneData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
  }
);

export default Project;
