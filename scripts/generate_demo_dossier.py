from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PDF = ROOT / "public" / "brandproof-demo-dossier.pdf"
OUTPUT_PDF = ROOT.parents[1] / "outputs" / "pdf" / "brandproof-demo-dossier.pdf"

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#17211D")
MUTED = colors.HexColor("#66756E")
CREAM = colors.HexColor("#F7F2E8")
PAPER = colors.HexColor("#FFFDF8")
MINT = colors.HexColor("#BFD8CC")
FOREST = colors.HexColor("#214C3E")
CORAL = colors.HexColor("#E97A62")
GOLD = colors.HexColor("#E2B45A")


def rounded_label(c, x, y, w, text, fill, text_color=INK):
    c.setFillColor(fill)
    c.roundRect(x, y, w, 8 * mm, 4 * mm, stroke=0, fill=1)
    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(x + w / 2, y + 2.7 * mm, text.upper())


def footer(c, page_num, source_name):
    c.setStrokeColor(colors.HexColor("#D9D5CB"))
    c.line(18 * mm, 15 * mm, PAGE_W - 18 * mm, 15 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(18 * mm, 10 * mm, "SYNTHETIC HACKATHON DEMO - NOT A REAL PRODUCT - NO REGULATORY APPROVAL")
    page_text = f"{source_name}  |  Page {page_num} of 3"
    c.drawRightString(PAGE_W - 18 * mm, 10 * mm, page_text)


def draw_wrapped(c, text, x, y, width, style):
    p = Paragraph(text, style)
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, y - height)
    return y - height


def page_one(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(FOREST)
    c.rect(0, PAGE_H - 58 * mm, PAGE_W, 58 * mm, stroke=0, fill=1)

    rounded_label(c, 18 * mm, PAGE_H - 24 * mm, 48 * mm, "Source packet", MINT, FOREST)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(18 * mm, PAGE_H - 39 * mm, "Luma Veil Skin Tint")
    c.setFont("Helvetica", 11)
    c.drawString(18 * mm, PAGE_H - 48 * mm, "Product specification and launch evidence dossier")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(18 * mm, PAGE_H - 75 * mm, "Authoritative product record")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9.5)
    c.drawString(18 * mm, PAGE_H - 82 * mm, "Document owner: Product Operations  |  Record ID: LV-2026-004")

    data = [
        ["Field", "Approved value", "Source status"],
        ["Category", "Complexion / SPF", "Verified"],
        ["Shade", "Sunlit 04", "Verified"],
        ["Finish", "Natural satin", "Verified"],
        ["Coverage", "Light, buildable", "Verified"],
        ["Fragrance", "Fragrance free", "Verified"],
    ]
    table = Table(data, colWidths=[38 * mm, 78 * mm, 40 * mm], rowHeights=10 * mm)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 1), (-1, -1), INK),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7DDD9")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    table.wrapOn(c, PAGE_W, PAGE_H)
    table.drawOn(c, 18 * mm, PAGE_H - 148 * mm)

    c.setFillColor(colors.HexColor("#FFF1EC"))
    c.roundRect(18 * mm, PAGE_H - 193 * mm, 174 * mm, 32 * mm, 5 * mm, stroke=0, fill=1)
    rounded_label(c, 25 * mm, PAGE_H - 175 * mm, 38 * mm, "Conflict open", CORAL, colors.white)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(25 * mm, PAGE_H - 184 * mm, "Publication gate: BLOCKED")
    c.setFont("Helvetica", 9.5)
    c.drawString(25 * mm, PAGE_H - 190 * mm, "Marketing says SPF 50. Laboratory certificate confirms SPF 30.")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(18 * mm, PAGE_H - 215 * mm, "Governance instruction")
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=INK,
        alignment=TA_LEFT,
    )
    draw_wrapped(
        c,
        "A human reviewer must select the claim supported by authoritative evidence and record a reason before any public product experience can be configured. Search results and marketing drafts may provide context, but they cannot overwrite the verified product record.",
        18 * mm,
        PAGE_H - 222 * mm,
        174 * mm,
        body,
    )
    footer(c, 1, "Product specification")
    c.showPage()


def page_two(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(CORAL)
    c.circle(PAGE_W - 17 * mm, PAGE_H - 20 * mm, 48 * mm, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.circle(23 * mm, 36 * mm, 33 * mm, stroke=0, fill=1)

    rounded_label(c, 18 * mm, PAGE_H - 27 * mm, 50 * mm, "Marketing draft", colors.white, CORAL)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(18 * mm, PAGE_H - 52 * mm, "Meet your light.")
    c.setFont("Helvetica", 14)
    c.drawString(18 * mm, PAGE_H - 64 * mm, "Luma Veil Skin Tint - Sunlit 04")

    c.setFillColor(colors.white)
    c.roundRect(18 * mm, PAGE_H - 151 * mm, 174 * mm, 68 * mm, 8 * mm, stroke=0, fill=1)
    c.setFillColor(CORAL)
    c.setFont("Helvetica-Bold", 48)
    c.drawString(28 * mm, PAGE_H - 118 * mm, "SPF 50")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(29 * mm, PAGE_H - 133 * mm, "Everyday broad-spectrum protection")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(29 * mm, PAGE_H - 142 * mm, "Draft claim for campaign review - substantiation status not yet checked")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(18 * mm, PAGE_H - 177 * mm, "Campaign talking points")
    bullets = [
        "Natural satin finish that stays skin-like",
        "Light, buildable coverage for flexible wear",
        "Fragrance-free formula",
        "Featured shade: Sunlit 04",
    ]
    y = PAGE_H - 190 * mm
    for line in bullets:
        c.setFillColor(CORAL)
        c.circle(21 * mm, y + 1.3 * mm, 1.3 * mm, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Helvetica", 10.5)
        c.drawString(27 * mm, y, line)
        y -= 10 * mm

    c.setFillColor(colors.HexColor("#FFE2D9"))
    c.roundRect(18 * mm, 29 * mm, 174 * mm, 24 * mm, 4 * mm, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(24 * mm, 43 * mm, "MANDATORY REVIEW NOTE")
    c.setFont("Helvetica", 8.5)
    c.drawString(24 * mm, 36 * mm, "Do not publish SPF 50 until the laboratory certificate supports the same value.")

    footer(c, 2, "Marketing sheet")
    c.showPage()


def page_three(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 40 * mm, PAGE_W, 40 * mm, stroke=0, fill=1)

    rounded_label(c, 18 * mm, PAGE_H - 25 * mm, 62 * mm, "Laboratory certificate", MINT, FOREST)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(18 * mm, PAGE_H - 35 * mm, "Sun protection test summary")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(18 * mm, PAGE_H - 62 * mm, "Certificate LV-SPF-2026-118")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9.5)
    c.drawString(18 * mm, PAGE_H - 70 * mm, "Sample: Luma Veil Skin Tint / Sunlit 04  |  Batch: DEMO-2608")

    data = [
        ["Test", "Measured result", "Assessment"],
        ["Static SPF", "30.4", "Supports SPF 30"],
        ["UVA protection", "Pass", "Meets internal threshold"],
        ["Sample integrity", "Pass", "Accepted for analysis"],
    ]
    table = Table(data, colWidths=[55 * mm, 50 * mm, 57 * mm], rowHeights=12 * mm)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7DDD9")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    table.wrapOn(c, PAGE_W, PAGE_H)
    table.drawOn(c, 18 * mm, PAGE_H - 132 * mm)

    c.setFillColor(MINT)
    c.roundRect(18 * mm, PAGE_H - 187 * mm, 174 * mm, 38 * mm, 6 * mm, stroke=0, fill=1)
    c.setFillColor(FOREST)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(25 * mm, PAGE_H - 163 * mm, "VERIFIED PUBLIC CLAIM: SPF 30")
    c.setFont("Helvetica", 9.5)
    c.drawString(25 * mm, PAGE_H - 173 * mm, "The measured result does not substantiate the SPF 50 marketing draft.")
    c.drawString(25 * mm, PAGE_H - 181 * mm, "Route the conflict to a human reviewer before publication.")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(18 * mm, PAGE_H - 210 * mm, "Authorized interpretation")
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "lab_body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=INK,
        alignment=TA_LEFT,
    )
    draw_wrapped(
        c,
        "Use SPF 30 in the governed product record. Any higher public claim requires separate supporting evidence and a new review decision. This certificate is intentionally synthetic and exists only to test traceable extraction, contradiction handling, and human approval workflows.",
        18 * mm,
        PAGE_H - 218 * mm,
        174 * mm,
        body,
    )

    c.setStrokeColor(MUTED)
    c.line(18 * mm, 38 * mm, 82 * mm, 38 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(18 * mm, 32 * mm, "Synthetic QA Lab - demo certification")

    footer(c, 3, "Laboratory certificate")
    c.showPage()


def build():
    PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(PUBLIC_PDF), pagesize=A4, pageCompression=1)
    c.setTitle("BrandProof Synthetic Demo Dossier")
    c.setAuthor("BrandProof Hackathon Demo")
    c.setSubject("Permission-safe synthetic product evidence packet")
    page_one(c)
    page_two(c)
    page_three(c)
    c.save()
    shutil.copy2(PUBLIC_PDF, OUTPUT_PDF)
    print(PUBLIC_PDF)
    print(OUTPUT_PDF)


if __name__ == "__main__":
    build()
