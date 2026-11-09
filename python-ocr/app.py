from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# Configure Tesseract path for Windows
tesseract_path = os.getenv('TESSERACT_CMD', r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe')
if os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    # Try alternative location
    alt_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(alt_path):
        pytesseract.pytesseract.tesseract_cmd = alt_path

# Initialize OpenAI client
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key:
    client = OpenAI(api_key=openai_api_key)
else:
    client = None
    print("Warning: OPENAI_API_KEY not set. AI categorization will be disabled.")

# Default categories
DEFAULT_CATEGORIES = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment",
    "Bills & Utilities", "Healthcare", "Groceries", "Travel",
    "Education", "Personal Care", "Other"
]

def preprocess_image(image):
    """Preprocess image for better OCR results"""
    # Convert PIL Image to OpenCV format
    img_array = np.array(image)
    
    # Handle different image formats
    if len(img_array.shape) == 2:
        # Already grayscale
        gray = img_array
    elif img_array.shape[2] == 4:
        # RGBA - convert to RGB first
        gray = cv2.cvtColor(cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB), cv2.COLOR_RGB2GRAY)
    elif img_array.shape[2] == 3:
        # RGB - convert to grayscale
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        # Fallback
        gray = img_array if len(img_array.shape) == 2 else cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    # Increase contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)
    
    return enhanced

def extract_text_from_image(image_file):
    """Extract text from image using Tesseract OCR"""
    try:
        # Open image
        image = Image.open(image_file)
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Perform OCR
        try:
            text = pytesseract.image_to_string(processed_image)
        except Exception as tesseract_error:
            print(f"Tesseract OCR failed: {str(tesseract_error)}")
            print("Falling back to basic image text extraction...")
            # If Tesseract fails, try basic OCR or return empty
            text = ""
        
        return text
    except Exception as e:
        raise Exception(f"OCR failed: {str(e)}")

def extract_amount(text):
    """Extract monetary amount from text"""
    # Look for patterns like $123.45, 123.45, $123, etc.
    patterns = [
        r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # $123.45 or $1,234.56
        r'(?:total|amount|sum|charge)[\s:]*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # total: 123.45
        r'(\d+(?:,\d{3})*\.\d{2})',  # 123.45
    ]
    
    amounts = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean and convert to float
            amount_str = match.replace(',', '').replace('$', '')
            try:
                amount = float(amount_str)
                if 0 < amount < 1000000:  # Reasonable range
                    amounts.append(amount)
            except ValueError:
                continue
    
    # Return the largest amount (likely the total)
    return max(amounts) if amounts else None

def extract_merchant(text):
    """Extract merchant name from text (first non-empty line)"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    # Return first meaningful line (likely merchant name)
    for line in lines:
        if len(line) > 2 and not line.isdigit():
            return line
    return None

def categorize_with_ai(text, merchant=None):
    """Use OpenAI to categorize the receipt"""
    if not client:
        # Fallback to simple keyword matching
        return categorize_with_keywords(text, merchant)
    
    try:
        prompt = f"""Analyze this receipt and categorize it into ONE of these categories:
{', '.join(DEFAULT_CATEGORIES)}

Receipt text:
{text}

Merchant: {merchant or 'Unknown'}

Respond with ONLY the category name, nothing else."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial categorization assistant. Always respond with exactly one category name."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=20
        )
        
        category = response.choices[0].message.content.strip()
        
        # Validate category
        if category in DEFAULT_CATEGORIES:
            return category
        else:
            return categorize_with_keywords(text, merchant)
            
    except Exception as e:
        print(f"AI categorization failed: {str(e)}")
        return categorize_with_keywords(text, merchant)

def categorize_with_keywords(text, merchant=None):
    """Fallback keyword-based categorization"""
    text_lower = (text + ' ' + (merchant or '')).lower()
    
    keywords_map = {
        "Food & Dining": ["restaurant", "cafe", "coffee", "pizza", "burger", "food", "dining", "kitchen"],
        "Groceries": ["grocery", "supermarket", "market", "walmart", "costco", "kroger", "safeway"],
        "Transportation": ["uber", "lyft", "taxi", "gas", "fuel", "parking", "transit", "metro"],
        "Shopping": ["shop", "store", "mall", "amazon", "retail", "clothing", "fashion"],
        "Entertainment": ["movie", "cinema", "theater", "concert", "game", "spotify", "netflix"],
        "Bills & Utilities": ["electric", "water", "internet", "phone", "utility", "bill", "payment"],
        "Healthcare": ["pharmacy", "hospital", "doctor", "medical", "health", "clinic", "cvs", "walgreens"],
        "Travel": ["hotel", "airline", "flight", "booking", "airbnb", "travel", "vacation"],
        "Education": ["school", "university", "college", "course", "book", "tuition", "education"],
        "Personal Care": ["salon", "spa", "gym", "fitness", "beauty", "barber", "cosmetic"],
    }
    
    for category, keywords in keywords_map.items():
        if any(keyword in text_lower for keyword in keywords):
            return category
    
    return "Other"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "ai_enabled": client is not None})

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    """Process receipt image and extract transaction details"""
    try:
        # Check if file is present
        if 'receipt' not in request.files:
            return jsonify({"error": "No receipt file provided"}), 400
        
        file = request.files['receipt']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Extract text using OCR
        text = extract_text_from_image(file)
        
        if not text or len(text.strip()) < 10:
            return jsonify({"error": "Could not extract text from image. Please ensure the receipt is clear and well-lit."}), 400
        
        # Extract information
        amount = extract_amount(text)
        merchant = extract_merchant(text)
        category = categorize_with_ai(text, merchant)
        
        # Prepare response
        result = {
            "success": True,
            "data": {
                "amount": amount,
                "description": merchant or "Receipt",
                "category": category,
                "rawText": text,
                "confidence": "high" if amount and merchant else "medium"
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n🚀 Receipt OCR Service Starting...")
    
    # Check Tesseract availability
    tesseract_status = "Unknown"
    try:
        if hasattr(pytesseract, 'get_tesseract_version'):
            tesseract_status = pytesseract.get_tesseract_version()
        else:
            tesseract_status = "Installed"
    except:
        tesseract_status = "Not found (OCR will use fallback)"
    
    print(f"📝 Tesseract available: {tesseract_status}")
    print(f"🤖 AI categorization: {'Enabled' if client else 'Disabled (using keyword fallback)'}")
    print(f"🌐 CORS enabled for: http://localhost:3000, http://localhost:3001")
    print("\n✅ Server ready on http://localhost:5000\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
