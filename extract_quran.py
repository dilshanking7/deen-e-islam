import fitz
import os

# PDF file
PDF_FILE = "quran-sharif.pdf"

# Output folder
OUTPUT_DIR = "public/quran"

# Quran starts after first 2 pages
START_PAGE = 2

os.makedirs(OUTPUT_DIR, exist_ok=True)

doc = fitz.open(PDF_FILE)

print(f"Total PDF Pages: {len(doc)}")

quran_page = 1

for page_number in range(START_PAGE, len(doc)):
    page = doc.load_page(page_number)

    # High Quality (300 DPI)
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)

    filename = f"{quran_page:03}.png"

    output_file = os.path.join(
        OUTPUT_DIR,
        filename
    )

    pix.save(output_file)

    print(f"Saved: {filename}")

    quran_page += 1

print("=====================================")
print("✅ Extraction Completed!")
print(f"Total Quran Pages: {quran_page - 1}")
print(f"Saved in: {OUTPUT_DIR}")
print("=====================================")