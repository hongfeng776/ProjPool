import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


class PDFExporter:
    def __init__(self):
        self._register_fonts()
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _register_fonts(self):
        try:
            font_paths = [
                "C:/Windows/Fonts/msyh.ttc",
                "C:/Windows/Fonts/msyh.ttf",
                "C:/Windows/Fonts/simhei.ttf",
                "C:/Windows/Fonts/simsun.ttc",
            ]
            font_registered = False
            for path in font_paths:
                if os.path.exists(path):
                    try:
                        pdfmetrics.registerFont(TTFont('ChineseFont', path))
                        font_registered = True
                        break
                    except:
                        continue
            if not font_registered:
                pdfmetrics.registerFont(TTFont('ChineseFont', "C:/Windows/Fonts/simsun.ttc"))
        except Exception as e:
            print(f"Warning: Failed to register Chinese font: {e}")

    def _setup_styles(self):
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontName='ChineseFont',
            fontSize=18,
            leading=22,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontName='ChineseFont',
            fontSize=14,
            leading=18,
            spaceBefore=15,
            spaceAfter=10
        )
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontName='ChineseFont',
            fontSize=11,
            leading=16,
            alignment=TA_LEFT
        )
        self.code_style = ParagraphStyle(
            'CustomCode',
            parent=self.styles['Normal'],
            fontName='Courier',
            fontSize=10,
            leading=14,
            leftIndent=20,
            textColor=colors.darkblue
        )
        self.header_style = ParagraphStyle(
            'CustomHeader',
            parent=self.styles['Normal'],
            fontName='ChineseFont',
            fontSize=10,
            leading=12,
            textColor=colors.grey
        )

    def export_to_pdf(self, report_content: str, output_path: str, title: str = "荷载计算书"):
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )

        story = []
        lines = report_content.split('\n')

        for line in lines:
            if '=' * 30 in line or '-' * 30 in line:
                continue
            elif '计算书' in line or '建 筑 荷 载' in line or '风 荷 载' in line or '雪 荷 载' in line:
                story.append(Paragraph(line.strip(), self.title_style))
                story.append(Spacer(1, 5*mm))
            elif line.startswith('一、') or line.startswith('二、') or line.startswith('三、') or line.startswith('四、') or line.startswith('五、'):
                story.append(Paragraph(line, self.subtitle_style))
            elif line.startswith('  【') or line.startswith('【'):
                story.append(Spacer(1, 2*mm))
                story.append(Paragraph(line.strip(), self.normal_style))
            elif '│' in line and '┌' not in line and '└' not in line and '├' not in line:
                continue
            elif line.strip() == '':
                story.append(Spacer(1, 2*mm))
            else:
                story.append(Paragraph(line.strip() or '&nbsp;', self.normal_style))

        doc.build(story)
        return output_path
