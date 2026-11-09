# Receipt OCR Service

Python backend service for receipt scanning using Tesseract OCR and OpenAI for smart categorization.

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** - [Download](https://www.python.org/)
2. **Tesseract OCR**
   - **Windows**: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)
   - **macOS**: `brew install tesseract`
   - **Linux**: `sudo apt-get install tesseract-ocr`

### Installation

```bash
# 1. Navigate to python-ocr directory
cd python-ocr

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment (optional)
# Edit .env file and add OPENAI_API_KEY for AI categorization
```

### Run the Service

```bash
python app.py
```

Server starts at: **http://localhost:5000**

## 📋 Features

- 📸 Image preprocessing for better OCR accuracy
- 🔍 Tesseract OCR for text extraction
- 🤖 AI-powered categorization using OpenAI GPT-3.5
- 💰 Automatic amount detection
- 🏪 Merchant name extraction
- 🎯 Fallback keyword-based categorization

## Prerequisites

### 1. Install Tesseract OCR

**Windows:**

```bash
# Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
# Run installer and note the installation path (typically C:\Program Files\Tesseract-OCR)
```

**macOS:**

```bash
brew install tesseract
```

**Linux:**

```bash
sudo apt-get install tesseract-ocr
```

### 2. Install Python Dependencies

```bash
cd python-ocr
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add:
# - OPENAI_API_KEY (optional, for AI categorization)
# - TESSERACT_CMD (Windows only, path to tesseract.exe)
```

## Running the Service

```bash
cd python-ocr
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### POST /process-receipt

Upload a receipt image and get extracted transaction details.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `receipt` (image file)

**Response:**

```json
{
  "success": true,
  "data": {
    "amount": 45.99,
    "description": "Starbucks Coffee",
    "category": "Food & Dining",
    "rawText": "Full OCR text...",
    "confidence": "high"
  }
}
```

### GET /health

Check service health status.

**Response:**

```json
{
  "status": "healthy",
  "ai_enabled": true
}
```

## 💡 Tips for Best Results

1. **Good Lighting** - Ensure receipt is well-lit
2. **Flat Surface** - Lay receipt flat, avoid wrinkles
3. **Clear Image** - Use high-resolution photos
4. **Contrast** - Dark text on light background works best
5. **Alignment** - Keep receipt straight in frame

## 🐛 Troubleshooting

**Tesseract not found:**

```bash
# Windows: Set in .env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Or add to PATH
```

**Port already in use:**

```bash
# Change port in app.py (last line):
app.run(debug=True, port=5001, host='0.0.0.0')
```

**Import errors:**

```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 🔗 Integration

This service is designed to work with the Next.js frontend at `http://localhost:3000`.

CORS is enabled for:

- `http://localhost:3000`
- `http://localhost:3001`

Frontend makes POST request to `/process-receipt` with FormData containing receipt image.
