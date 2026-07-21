"""Local PDF Invoice Generator Service using ReportLab"""
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

INVOICE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "invoices"


class PDFInvoiceService:
    """Service to generate and manage local PDF invoices"""

    @classmethod
    def get_invoice_dir(cls) -> Path:
        """Get or create the local invoices directory"""
        INVOICE_DIR.mkdir(parents=True, exist_ok=True)
        return INVOICE_DIR

    @classmethod
    def get_invoice_filepath(cls, order_id: str) -> Path:
        """Get absolute path for an order PDF invoice file"""
        dir_path = cls.get_invoice_dir()
        return dir_path / f"invoice_{order_id}.pdf"

    @classmethod
    def generate_invoice(cls, order: dict) -> str:
        """
        Generate a PDF cash memo / invoice locally for an order.
        Returns the absolute file path of the generated PDF.
        """
        order_id = order["order_id"]
        customer_name = order.get("customer_name", "Valued Customer")
        user_phone = order.get("user_id", "")
        items: List[dict] = order.get("items", [])
        total_price = order.get("total_price", 0.0)
        created_at = order.get("created_at", datetime.utcnow().isoformat())

        # Format date
        try:
            dt = datetime.fromisoformat(created_at)
            formatted_date = dt.strftime("%B %d, %Y - %I:%M %p")
        except Exception:
            formatted_date = str(created_at)

        filepath = cls.get_invoice_filepath(order_id)

        # Build PDF Document
        doc = SimpleDocTemplate(
            str(filepath),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom styles
        brand_style = ParagraphStyle(
            'BrandHeader',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#1B4332')
        )

        tagline_style = ParagraphStyle(
            'BrandTagline',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#52B788')
        )

        invoice_title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            alignment=2,  # Right aligned
            textColor=colors.HexColor('#2D6A4F')
        )

        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#111A11')
        )

        meta_val_style = ParagraphStyle(
            'MetaVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#4E5E4E')
        )

        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.white
        )

        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#111A11')
        )

        table_cell_right = ParagraphStyle(
            'TableCellRight',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            alignment=2,
            textColor=colors.HexColor('#111A11')
        )

        total_style = ParagraphStyle(
            'TotalText',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            alignment=2,
            textColor=colors.HexColor('#1B4332')
        )

        story = []

        # Header Table: Logo/Brand on left, Cash Memo / Invoice on right
        header_data = [
            [
                Paragraph("FreshCart", brand_style),
                Paragraph("OFFICIAL CASH MEMO", invoice_title_style)
            ],
            [
                Paragraph("Fresh & Organic Grocery Store", tagline_style),
                Paragraph(f"Invoice #: <b>{order_id}</b>", ParagraphStyle('InvNum', parent=meta_val_style, alignment=2))
            ]
        ]

        header_table = Table(header_data, colWidths=[300, 240])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 12))

        # Green accent line
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2D6A4F'), spaceAfter=15))

        # Customer & Order Details Box
        info_data = [
            [
                Paragraph("<b>Customer Details:</b>", meta_label_style),
                Paragraph("<b>Order Details:</b>", meta_label_style)
            ],
            [
                Paragraph(f"Name: {customer_name}<br/>Phone/ID: {user_phone}", meta_val_style),
                Paragraph(f"Date: {formatted_date}<br/>Status: <b>DELIVERED</b>", meta_val_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[270, 270])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0FFF4')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#D8F3DC')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 15))

        # Items Table
        items_table_data = [
            [
                Paragraph("#", table_header_style),
                Paragraph("Item Description", table_header_style),
                Paragraph("Price/Unit", table_header_style),
                Paragraph("Qty", table_header_style),
                Paragraph("Amount (INR)", ParagraphStyle('THRight', parent=table_header_style, alignment=2))
            ]
        ]

        for idx, item in enumerate(items, 1):
            name = item.get("product_name", "Item")
            price = item.get("price_snapshot", 0.0)
            qty = item.get("quantity", 1)
            unit = item.get("unit", "")
            amount = price * qty
            items_table_data.append([
                Paragraph(str(idx), table_cell_style),
                Paragraph(f"{name} ({unit})", table_cell_style),
                Paragraph(f"Rs. {price:.2f}", table_cell_style),
                Paragraph(str(qty), table_cell_style),
                Paragraph(f"Rs. {amount:.2f}", table_cell_right)
            ])

        # Add total row
        items_table_data.append([
            "", "", "",
            Paragraph("<b>Total Amount:</b>", ParagraphStyle('TotLbl', parent=meta_label_style, alignment=2)),
            Paragraph(f"<b>Rs. {total_price:.2f}</b>", total_style)
        ])

        items_table = Table(items_table_data, colWidths=[30, 230, 90, 50, 140])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2D6A4F')),
            ('ALIGN', (0,0), (-1,0), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#DDE8DD')),
            ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#F7F9F7')]),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LINEABOVE', (0,-1), (-1,-1), 1.5, colors.HexColor('#1B4332')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#EBFBEE')),
        ]))

        story.append(items_table)
        story.append(Spacer(1, 25))

        # Footer Notice
        footer_style = ParagraphStyle(
            'FooterNotice',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            alignment=1,
            textColor=colors.HexColor('#8A9A8A')
        )
        story.append(Paragraph("Thank you for shopping with FreshCart! Your fresh groceries delivered fast.", footer_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("This is a computer-generated tax invoice and requires no physical signature.", footer_style))

        # Build document
        doc.build(story)
        print(f"[PDF GENERATED] Local invoice saved: {filepath}")

        return str(filepath)

