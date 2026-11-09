"""
Flask API for AI Budget Advisor
Provides endpoints for generating budget suggestions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from budget_advisor import AIBudgetAdvisor
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    os.getenv('NEXTAUTH_URL', 'http://localhost:3000'),
    'http://localhost:3001'
])

# Initialize AI Advisor
advisor = AIBudgetAdvisor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Budget Advisor',
        'version': '1.0.0'
    })

@app.route('/analyze-budget', methods=['POST'])
def analyze_budget():
    """
    Analyze transactions and generate budget suggestions
    
    Expected JSON body:
    {
        "transactions": [
            {"date": "2025-11-01", "amount": 100, "category": "Food", "type": "expense"},
            ...
        ],
        "monthlyIncome": 5000  // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'transactions' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing transactions data'
            }), 400
        
        transactions = data['transactions']
        monthly_income = data.get('monthlyIncome')
        
        if len(transactions) < 5:
            return jsonify({
                'success': False,
                'error': 'Need at least 5 transactions for analysis'
            }), 400
        
        # Generate budget suggestions
        result = advisor.generate_budget_suggestions(transactions, monthly_income)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analyze_budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/spending-analysis', methods=['POST'])
def spending_analysis():
    """
    Analyze spending patterns without budget suggestions
    """
    try:
        data = request.get_json()
        
        if not data or 'transactions' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing transactions data'
            }), 400
        
        transactions = data['transactions']
        
        if len(transactions) < 3:
            return jsonify({
                'success': False,
                'error': 'Need at least 3 transactions for analysis'
            }), 400
        
        # Analyze spending patterns
        analysis = advisor.analyze_spending_patterns(transactions)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"Error in spending_analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("🤖 AI Budget Advisor Service Starting...")
    print("=" * 60)
    print(f"✅ Server ready on http://localhost:5001")
    print(f"🌐 CORS enabled for: {os.getenv('NEXTAUTH_URL', 'http://localhost:3000')}")
    print("=" * 60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
