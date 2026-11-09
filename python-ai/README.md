# AI Budget Advisor Service

AI-powered budget suggestions using Gradient Boosted Decision Trees.

## Features

- 📊 **Spending Pattern Analysis** - Analyzes historical transactions
- 🤖 **ML-Powered Predictions** - Uses Gradient Boosting Regressor
- 💡 **Smart Insights** - Personalized financial recommendations
- 📈 **Category-wise Budgets** - Detailed budget for each spending category
- 🎯 **50/30/20 Rule** - Applies with AI adjustments based on patterns

## Setup

### 1. Create Virtual Environment

```bash
cd python-ai
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**

```bash
venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Service

```bash
python app.py
```

The service will start on **http://localhost:5001**

## API Endpoints

### POST `/analyze-budget`

Generate AI-powered budget suggestions based on transaction history.

**Request Body:**

```json
{
  "transactions": [
    {
      "date": "2025-11-01",
      "amount": 5000,
      "category": "Salary",
      "type": "income"
    },
    {
      "date": "2025-11-05",
      "amount": 1200,
      "category": "Housing",
      "type": "expense"
    }
  ],
  "monthlyIncome": 5000
}
```

**Response:**

```json
{
  "success": true,
  "monthly_income": 5000,
  "current_spending": 3420,
  "recommended_budgets": {
    "essentials": 2500,
    "lifestyle": 1500,
    "savings": 1000
  },
  "category_budgets": {
    "Housing": {
      "current_spending": 1200,
      "suggested_budget": 1260,
      "difference": 60,
      "category_type": "essential"
    }
  },
  "ai_insights": [
    {
      "type": "success",
      "title": "Savings Opportunity",
      "message": "By following these suggestions, you could save $280 per month!"
    }
  ],
  "confidence_score": 85.5
}
```

### POST `/spending-analysis`

Get spending pattern analysis without budget suggestions.

**Request Body:**

```json
{
  "transactions": [...]
}
```

**Response:**

```json
{
  "success": true,
  "analysis": {
    "category_breakdown": [...],
    "avg_monthly_spending": 3420,
    "spending_variance": 245.5,
    "spending_trend": "increasing",
    "total_transactions": 45
  }
}
```

## How It Works

### 1. Feature Engineering

- Extracts time-based features (month, day of week, week of month)
- Aggregates spending by category and period
- Calculates statistics (mean, sum, count, std deviation)

### 2. Gradient Boosting Model

- Uses scikit-learn's `GradientBoostingRegressor`
- Separate models for income and expense prediction
- 100 estimators with learning rate 0.1
- Max depth of 3 to prevent overfitting

### 3. Budget Allocation Strategy

- **50/30/20 Rule Base:**
  - 50% for Essentials (housing, utilities, food)
  - 30% for Lifestyle (entertainment, dining)
  - 20% for Savings
- **AI Adjustments:**
  - Increases savings if spending trend is rising
  - Adjusts category budgets based on historical patterns
  - Provides personalized recommendations

### 4. Insights Generation

- Identifies high spending alerts
- Detects spending inconsistencies
- Suggests areas for improvement
- Calculates savings potential

## Integration with Next.js

### Frontend API Call Example

```typescript
// app/actions/budget.ts
export async function getAIBudgetSuggestions(userId: string) {
  const transactions = await getTransactions(userId);

  const response = await fetch("http://localhost:5001/analyze-budget", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactions: transactions.map((t) => ({
        date: t.date.toISOString().split("T")[0],
        amount: t.amount,
        category: t.category,
        type: t.type,
      })),
      monthlyIncome: 5000,
    }),
  });

  return await response.json();
}
```

## Model Performance

- **Confidence Score:** Based on transaction count (0-100%)
- **Minimum Data:** 5 transactions for analysis
- **Optimal Data:** 50+ transactions for best accuracy
- **Categories Supported:** All standard expense/income categories

## Technologies Used

- **NumPy** - Numerical computing
- **Pandas** - Data manipulation
- **scikit-learn** - Machine learning models
- **Flask** - REST API framework
- **Joblib** - Model serialization

## Future Enhancements

- [ ] Deep learning models (LSTM for time series)
- [ ] Anomaly detection for unusual spending
- [ ] Predictive alerts before overspending
- [ ] Multi-month forecasting
- [ ] Category recommendation engine
- [ ] Comparative analysis with similar users

## Testing

Run the standalone test:

```bash
python budget_advisor.py
```

This will generate sample analysis with mock transaction data.

---

**Built with ❤️ using scikit-learn and Gradient Boosting**
