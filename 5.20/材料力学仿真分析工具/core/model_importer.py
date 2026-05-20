import os
import vtk


class ModelImporter:
    def __init__(self):
        self.supported_formats = {
            '.stl': self.import_stl,
            '.step': self.import_step,
            '.stp': self.import_step,
            '.obj': self.import_obj,
            '.ply': self.import_ply,
            '.vtk': self.import_vtk,
            '.vtp': self.import_vtp
        }
        
    def import_model(self, file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext not in self.supported_formats:
            raise ValueError(f"不支持的文件格式: {ext}")
            
        importer_func = self.supported_formats[ext]
        return importer_func(file_path)
    
    def import_stl(self, file_path):
        reader = vtk.vtkSTLReader()
        reader.SetFileName(file_path)
        reader.Update()
        
        polydata = reader.GetOutput()
        
        if polydata.GetNumberOfPoints() == 0:
            return None
            
        return polydata
    
    def import_step(self, file_path):
        try:
            reader = vtk.vtkSTEPReader()
            reader.SetFileName(file_path)
            reader.Update()
            
            output = reader.GetOutput()
            
            if output is None or output.GetNumberOfPoints() == 0:
                return self._fallback_step_import(file_path)
                
            return output
        except:
            return self._fallback_step_import(file_path)
    
    def _fallback_step_import(self, file_path):
        try:
            reader = vtk.vtkIGESReader()
            reader.SetFileName(file_path)
            reader.Update()
            
            output = reader.GetOutput()
            
            if output and output.GetNumberOfPoints() > 0:
                return output
        except:
            pass
            
        return None
    
    def import_obj(self, file_path):
        reader = vtk.vtkOBJReader()
        reader.SetFileName(file_path)
        reader.Update()
        
        polydata = reader.GetOutput()
        
        if polydata.GetNumberOfPoints() == 0:
            return None
            
        return polydata
    
    def import_ply(self, file_path):
        reader = vtk.vtkPLYReader()
        reader.SetFileName(file_path)
        reader.Update()
        
        polydata = reader.GetOutput()
        
        if polydata.GetNumberOfPoints() == 0:
            return None
            
        return polydata
    
    def import_vtk(self, file_path):
        reader = vtk.vtkPolyDataReader()
        reader.SetFileName(file_path)
        reader.Update()
        
        polydata = reader.GetOutput()
        
        if polydata.GetNumberOfPoints() == 0:
            return None
            
        return polydata
    
    def import_vtp(self, file_path):
        reader = vtk.vtkXMLPolyDataReader()
        reader.SetFileName(file_path)
        reader.Update()
        
        polydata = reader.GetOutput()
        
        if polydata.GetNumberOfPoints() == 0:
            return None
            
        return polydata
    
    def get_supported_formats(self):
        return list(self.supported_formats.keys())
    
    def create_sample_model(self):
        sphere = vtk.vtkSphereSource()
        sphere.SetRadius(10.0)
        sphere.SetPhiResolution(30)
        sphere.SetThetaResolution(30)
        sphere.Update()
        return sphere.GetOutput()
