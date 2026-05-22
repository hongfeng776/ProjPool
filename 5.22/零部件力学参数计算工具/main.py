import tkinter as tk
from tkinter import messagebox, filedialog
from gui import ParamInputWindow
from database import DatabaseConfig
from calculation import DomesticCalculationAdapter, MechanicalCalculator, BatchCalculator


class MechanicalCalculationApp:
    def __init__(self):
        self.root = tk.Tk()
        
        self.db_config = DatabaseConfig()
        self.db_config.init_tables()
        
        self.calc_adapter = DomesticCalculationAdapter()
        self.mechanical_calc = MechanicalCalculator()
        self.batch_calc = BatchCalculator(max_workers=4)
        
        self.current_results = None
        
        self.gui = ParamInputWindow(self.root)
        
        self.setup_callbacks()
        
    def setup_callbacks(self):
        self.gui.single_calc_btn.config(command=self.on_single_calculate)
        self.gui.single_submit_btn.config(command=self.on_single_submit)
        
        self.gui.batch_browse_btn.config(command=self.on_browse_file)
        self.gui.batch_sample_btn.config(command=self.on_generate_sample)
        self.gui.batch_load_btn.config(command=self.on_load_data)
        self.gui.batch_calc_btn.config(command=self.on_batch_calculate)
        self.gui.batch_export_csv_btn.config(command=self.on_export_csv)
        self.gui.batch_export_excel_btn.config(command=self.on_export_excel)
        
    def on_single_calculate(self):
        data = self.gui.get_single_input_data()
        if data is None:
            return
        
        required_fields = ["length", "width", "height", "force"]
        missing_fields = []
        for field in required_fields:
            if data.get(field) is None:
                missing_fields.append(field)
        
        if missing_fields:
            messagebox.showwarning("提示", "请输入完整的尺寸和受力参数！")
            return
        
        material = data.get("material", "Q235")
        calc_result = self.mechanical_calc.calculate_all(data, material=material)
        self.current_results = calc_result
        
        self.gui.display_single_results(calc_result)
        
        if calc_result.get("success"):
            if calc_result.get("warnings"):
                self.gui.show_single_status(f"计算完成！有 {len(calc_result['warnings'])} 条警告", is_success=True)
            else:
                self.gui.show_single_status("计算完成！所有校验通过", is_success=True)
        else:
            self.gui.show_single_status(f"计算失败！有 {len(calc_result['errors'])} 条错误", is_success=False)
        
    def on_single_submit(self):
        data = self.gui.get_single_input_data()
        if data is None:
            return
        
        if not data.get("part_name"):
            messagebox.showwarning("提示", "请输入零件名称！")
            return
        
        success, error = self.db_config.save_part_params(data)
        if success:
            self.gui.show_single_status(f"数据已成功保存！零件名称: {data['part_name']}", is_success=True)
        else:
            self.gui.show_single_status(f"保存失败: {error}", is_success=False)
            messagebox.showerror("错误", f"保存失败: {error}")
        
    def on_browse_file(self):
        file_path = filedialog.askopenfilename(
            title="选择CSV文件",
            filetypes=[("CSV文件", "*.csv"), ("所有文件", "*.*")]
        )
        if file_path:
            self.gui.batch_file_path.delete(0, tk.END)
            self.gui.batch_file_path.insert(0, file_path)
    
    def on_generate_sample(self):
        file_path = filedialog.asksaveasfilename(
            title="保存示例CSV",
            defaultextension=".csv",
            filetypes=[("CSV文件", "*.csv")]
        )
        if file_path:
            success, message = self.batch_calc.generate_sample_csv(file_path)
            if success:
                self.gui.show_batch_status(message, is_success=True)
                self.gui.batch_file_path.delete(0, tk.END)
                self.gui.batch_file_path.insert(0, file_path)
            else:
                self.gui.show_batch_status(message, is_success=False)
                messagebox.showerror("错误", message)
    
    def on_load_data(self):
        file_path = self.gui.batch_file_path.get().strip()
        if not file_path:
            messagebox.showwarning("提示", "请先选择CSV文件！")
            return
        
        success, message = self.batch_calc.load_from_csv(file_path)
        if success:
            self.gui.update_batch_data_count(len(self.batch_calc.batch_data))
            self.gui.show_batch_status(message, is_success=True)
        else:
            self.gui.show_batch_status(message, is_success=False)
            messagebox.showerror("错误", message)
    
    def on_batch_calculate(self):
        if not self.batch_calc.batch_data:
            messagebox.showwarning("提示", "请先加载数据！")
            return
        
        self.gui.batch_calc_btn.config(state="disabled")
        self.gui.update_stats(total=len(self.batch_calc.batch_data))
        self.gui.show_batch_status("正在计算中...", is_success=True)
        self.root.update()
        
        results, elapsed = self.batch_calc.calculate_all(use_parallel=True)
        
        success, failed, warning = self.gui.display_batch_results(results)
        self.gui.update_stats(
            total=len(results),
            success=success,
            failed=failed,
            warning=warning,
            elapsed_time=elapsed
        )
        
        self.gui.batch_calc_btn.config(state="normal")
        self.gui.show_batch_status(f"批量计算完成，耗时 {elapsed:.3f} 秒", is_success=True)
    
    def on_export_csv(self):
        if not self.batch_calc.batch_results:
            messagebox.showwarning("提示", "请先进行批量计算！")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="导出计算结果",
            defaultextension=".csv",
            filetypes=[("CSV文件", "*.csv")]
        )
        if file_path:
            success, message = self.batch_calc.export_results_to_csv(file_path)
            if success:
                self.gui.show_batch_status(message, is_success=True)
            else:
                self.gui.show_batch_status(message, is_success=False)
                messagebox.showerror("错误", message)
    
    def on_export_excel(self):
        if not self.batch_calc.batch_results:
            messagebox.showwarning("提示", "请先进行批量计算！")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="导出Excel报告",
            defaultextension=".xlsx",
            filetypes=[("Excel文件", "*.xlsx")]
        )
        if file_path:
            success, message = self.batch_calc.export_report_to_excel(file_path)
            if success:
                self.gui.show_batch_status(message, is_success=True)
            else:
                self.gui.show_batch_status(message, is_success=False)
                messagebox.showerror("错误", message)
        
    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = MechanicalCalculationApp()
    app.run()
