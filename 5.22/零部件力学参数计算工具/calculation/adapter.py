import numpy as np
import scipy as sp
import matplotlib.pyplot as plt


class DomesticCalculationAdapter:
    def __init__(self):
        self.np = np
        self.sp = sp
        self.plt = plt
        self.is_domestic_mode = False
        
    def set_domestic_mode(self, enabled: bool):
        self.is_domestic_mode = enabled
        
    def get_numpy(self):
        return self.np
    
    def get_scipy(self):
        return self.sp
    
    def get_matplotlib(self):
        return self.plt
    
    def array(self, data, dtype=None):
        return self.np.array(data, dtype=dtype)
    
    def matrix_multiply(self, a, b):
        return self.np.dot(a, b)
    
    def solve_linear_system(self, a, b):
        return self.sp.linalg.solve(a, b)
    
    def fft(self, data):
        return self.sp.fft.fft(data)
    
    def integrate(self, func, a, b):
        return self.sp.integrate.quad(func, a, b)[0]
