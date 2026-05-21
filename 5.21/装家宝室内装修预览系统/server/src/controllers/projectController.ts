import { Request, Response } from 'express';
import Project from '../models/Project';

export const getAllProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where = status ? { status } : {};
    
    const { count, rows } = await Project.findAndCountAll({
      where: where as Record<string, unknown>,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取项目列表失败',
    });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在',
      });
    }
    
    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取项目详情失败',
    });
  }
};

export const createProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description, roomType, area, style, budget, thumbnail, sceneData } = req.body;
    
    if (!name || !roomType || !area || !style || !budget) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
      });
    }
    
    const project = await Project.create({
      name,
      description: description || '',
      roomType,
      area,
      style,
      budget,
      thumbnail,
      sceneData,
    });
    
    return res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: project,
    });
  } catch (error) {
    console.error('创建项目失败:', error);
    return res.status(500).json({
      success: false,
      message: '创建项目失败',
    });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, roomType, area, style, budget, status, thumbnail, sceneData } = req.body;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在',
      });
    }
    
    await project.update({
      name,
      description,
      roomType,
      area,
      style,
      budget,
      status,
      thumbnail,
      sceneData,
    });
    
    return res.status(200).json({
      success: true,
      message: '项目更新成功',
      data: project,
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新项目失败',
    });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在',
      });
    }
    
    await project.destroy();
    
    return res.status(200).json({
      success: true,
      message: '项目删除成功',
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除项目失败',
    });
  }
};
