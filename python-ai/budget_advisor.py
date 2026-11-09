"""
AI Budget Suggestion System using Gradient Boosting
Analyzes spending patterns and suggests personalized budgets
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime, timedelta
import json

class AIBudgetAdvisor:
    def __init__(self):
        self.income_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        self.expense_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, transactions_df):
        """
        Extract features from transaction data
        """
        # Time-based features
        transactions_df['date'] = pd.to_datetime(transactions_df['date'])
        transactions_df['month'] = transactions_df['date'].dt.month
        transactions_df['day_of_week'] = transactions_df['date'].dt.dayofweek
        transactions_df['week_of_month'] = (transactions_df['date'].dt.day - 1) // 7 + 1
        
        # Aggregate by month and category
        monthly_stats = transactions_df.groupby(['month', 'category', 'type']).agg({
            'amount': ['sum', 'mean', 'count', 'std']
        }).reset_index()
        
        monthly_stats.columns = ['_'.join(col).strip('_') for col in monthly_stats.columns]
        
        return monthly_stats
    
    def train(self, transactions_data):
        """
        Train the model on historical transaction data
        transactions_data: list of dicts with keys: date, amount, category, type
        """
        if len(transactions_data) < 10:
            return {
                'success': False,
                'error': 'Need at least 10 transactions to train the model'
            }
        
        df = pd.DataFrame(transactions_data)
        
        # Separate income and expenses
        income_df = df[df['type'] == 'income'].copy()
        expense_df = df[df['type'] == 'expense'].copy()
        
        if len(income_df) < 3 or len(expense_df) < 3:
            return {
                'success': False,
                'error': 'Need at least 3 income and 3 expense transactions'
            }
        
        # Prepare features
        income_features = self.prepare_features(income_df)
        expense_features = self.prepare_features(expense_df)
        
        # Train income model
        if len(income_features) > 0:
            X_income = income_features[['month', 'amount_count', 'amount_mean']]
            y_income = income_features['amount_sum']
            X_income_scaled = self.scaler.fit_transform(X_income)
            self.income_model.fit(X_income_scaled, y_income)
        
        # Train expense model
        if len(expense_features) > 0:
            X_expense = expense_features[['month', 'amount_count', 'amount_mean']]
            y_expense = expense_features['amount_sum']
            X_expense_scaled = self.scaler.transform(X_expense)
            self.expense_model.fit(X_expense_scaled, y_expense)
        
        self.is_trained = True
        
        return {
            'success': True,
            'message': 'Model trained successfully'
        }
    
    def analyze_spending_patterns(self, transactions_data):
        """
        Analyze historical spending to identify patterns
        """
        df = pd.DataFrame(transactions_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Category-wise analysis
        category_stats = df[df['type'] == 'expense'].groupby('category').agg({
            'amount': ['sum', 'mean', 'count']
        }).reset_index()
        
        category_stats.columns = ['category', 'total_spent', 'avg_transaction', 'frequency']
        category_stats['percentage'] = (category_stats['total_spent'] / category_stats['total_spent'].sum()) * 100
        
        # Monthly trends
        df['month'] = df['date'].dt.to_period('M')
        monthly_spending = df[df['type'] == 'expense'].groupby('month')['amount'].sum()
        
        # Calculate variance and trend
        spending_variance = monthly_spending.std()
        spending_trend = 'increasing' if monthly_spending.diff().mean() > 0 else 'decreasing'
        
        return {
            'category_breakdown': category_stats.to_dict('records'),
            'avg_monthly_spending': float(monthly_spending.mean()) if not pd.isna(monthly_spending.mean()) else 0.0,
            'spending_variance': float(spending_variance) if not pd.isna(spending_variance) else 0.0,
            'spending_trend': spending_trend,
            'total_transactions': len(df[df['type'] == 'expense'])
        }
    
    def generate_budget_suggestions(self, transactions_data, income_amount=None):
        """
        Generate AI-powered budget suggestions based on spending patterns
        """
        analysis = self.analyze_spending_patterns(transactions_data)
        
        df = pd.DataFrame(transactions_data)
        
        # Calculate average monthly income
        if income_amount is None:
            income_transactions = df[df['type'] == 'income']
            if len(income_transactions) > 0:
                income_amount = income_transactions['amount'].sum() / max(len(income_transactions.groupby(pd.to_datetime(income_transactions['date']).dt.to_period('M'))), 1)
            else:
                income_amount = 5000  # Default fallback
        
        # Calculate current spending
        current_monthly_spending = analysis['avg_monthly_spending']
        
        # Apply 50/30/20 rule with AI adjustments
        essential_budget = income_amount * 0.50  # Needs
        lifestyle_budget = income_amount * 0.30  # Wants
        savings_budget = income_amount * 0.20    # Savings
        
        # Adjust based on spending patterns
        if analysis['spending_trend'] == 'increasing':
            # Recommend more aggressive savings
            savings_budget = income_amount * 0.25
            lifestyle_budget = income_amount * 0.25
        
        # Category-wise budget suggestions
        category_budgets = {}
        essential_categories = ['Housing', 'Utilities', 'Food', 'Transportation', 'Healthcare', 'Groceries']
        lifestyle_categories = ['Entertainment', 'Dining', 'Shopping', 'Travel', 'Subscription']
        
        for cat_data in analysis['category_breakdown']:
            category = cat_data['category']
            current_spending = cat_data['total_spent'] / max(len(df.groupby(pd.to_datetime(df['date']).dt.to_period('M'))), 1)
            
            if category in essential_categories:
                # Essential: suggest current spending or slightly lower
                suggested = min(current_spending * 1.05, essential_budget * 0.2)
            elif category in lifestyle_categories:
                # Lifestyle: suggest 10-20% reduction
                suggested = current_spending * 0.85
            else:
                # Other: moderate approach
                suggested = current_spending * 0.95
            
            category_budgets[category] = {
                'current_spending': round(float(current_spending), 2),
                'suggested_budget': round(float(suggested), 2),
                'difference': round(float(suggested - current_spending), 2),
                'category_type': 'essential' if category in essential_categories else 'lifestyle'
            }
        
        # AI insights and recommendations
        insights = []
        
        if current_monthly_spending > income_amount * 0.9:
            insights.append({
                'type': 'warning',
                'title': 'High Spending Alert',
                'message': f'You\'re spending {(current_monthly_spending/income_amount)*100:.1f}% of your income. Consider reducing non-essential expenses.'
            })
        
        if analysis['spending_variance'] > current_monthly_spending * 0.3:
            insights.append({
                'type': 'info',
                'title': 'Inconsistent Spending',
                'message': 'Your monthly spending varies significantly. Creating consistent budgets can help stabilize finances.'
            })
        
        # Find top spending categories
        sorted_categories = sorted(analysis['category_breakdown'], key=lambda x: x['total_spent'], reverse=True)
        if len(sorted_categories) > 0:
            top_category = sorted_categories[0]
            if top_category['percentage'] > 30:
                insights.append({
                    'type': 'tip',
                    'title': f'Focus on {top_category["category"]}',
                    'message': f'{top_category["category"]} accounts for {top_category["percentage"]:.1f}% of your spending. Small reductions here can have big impact.'
                })
        
        # Savings potential
        potential_savings = sum([cat['difference'] for cat in category_budgets.values() if cat['difference'] < 0])
        if abs(potential_savings) > income_amount * 0.05:
            insights.append({
                'type': 'success',
                'title': 'Savings Opportunity',
                'message': f'By following these suggestions, you could save ${abs(potential_savings):.2f} per month!'
            })
        
        return {
            'success': True,
            'monthly_income': round(float(income_amount), 2) if not pd.isna(income_amount) else 0.0,
            'current_spending': round(float(current_monthly_spending), 2) if not pd.isna(current_monthly_spending) else 0.0,
            'recommended_budgets': {
                'essentials': round(float(essential_budget), 2),
                'lifestyle': round(float(lifestyle_budget), 2),
                'savings': round(float(savings_budget), 2)
            },
            'category_budgets': category_budgets,
            'spending_analysis': {
                'trend': analysis['spending_trend'],
                'variance': round(float(analysis['spending_variance']), 2) if not pd.isna(analysis['spending_variance']) else 0.0,
                'total_transactions': analysis['total_transactions']
            },
            'ai_insights': insights,
            'confidence_score': min(len(transactions_data) / 50, 1.0) * 100  # 0-100%
        }
    
    def save_model(self, filepath='budget_advisor_model.pkl'):
        """Save trained model to disk"""
        if self.is_trained:
            joblib.dump({
                'income_model': self.income_model,
                'expense_model': self.expense_model,
                'scaler': self.scaler,
                'is_trained': self.is_trained
            }, filepath)
            return {'success': True, 'message': f'Model saved to {filepath}'}
        return {'success': False, 'error': 'Model not trained yet'}
    
    def load_model(self, filepath='budget_advisor_model.pkl'):
        """Load trained model from disk"""
        try:
            data = joblib.load(filepath)
            self.income_model = data['income_model']
            self.expense_model = data['expense_model']
            self.scaler = data['scaler']
            self.is_trained = data['is_trained']
            return {'success': True, 'message': 'Model loaded successfully'}
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Example usage and testing
if __name__ == '__main__':
    # Sample transaction data
    sample_transactions = [
        {'date': '2025-10-01', 'amount': 5000, 'category': 'Salary', 'type': 'income'},
        {'date': '2025-10-05', 'amount': 1200, 'category': 'Housing', 'type': 'expense'},
        {'date': '2025-10-08', 'amount': 300, 'category': 'Groceries', 'type': 'expense'},
        {'date': '2025-10-10', 'amount': 150, 'category': 'Utilities', 'type': 'expense'},
        {'date': '2025-10-12', 'amount': 80, 'category': 'Entertainment', 'type': 'expense'},
        {'date': '2025-10-15', 'amount': 200, 'category': 'Transportation', 'type': 'expense'},
        {'date': '2025-10-18', 'amount': 120, 'category': 'Dining', 'type': 'expense'},
        {'date': '2025-10-20', 'amount': 250, 'category': 'Shopping', 'type': 'expense'},
        {'date': '2025-10-25', 'amount': 100, 'category': 'Healthcare', 'type': 'expense'},
        {'date': '2025-11-01', 'amount': 5000, 'category': 'Salary', 'type': 'income'},
        {'date': '2025-11-05', 'amount': 1200, 'category': 'Housing', 'type': 'expense'},
        {'date': '2025-11-08', 'amount': 320, 'category': 'Groceries', 'type': 'expense'},
        {'date': '2025-11-10', 'amount': 160, 'category': 'Utilities', 'type': 'expense'},
        {'date': '2025-11-12', 'amount': 90, 'category': 'Entertainment', 'type': 'expense'},
        {'date': '2025-11-15', 'amount': 220, 'category': 'Transportation', 'type': 'expense'},
    ]
    
    # Initialize advisor
    advisor = AIBudgetAdvisor()
    
    # Generate suggestions
    result = advisor.generate_budget_suggestions(sample_transactions, income_amount=5000)
    
    print("=" * 60)
    print("AI BUDGET ADVISOR - ANALYSIS RESULTS")
    print("=" * 60)
    print(f"\nMonthly Income: ${result['monthly_income']:,.2f}")
    print(f"Current Spending: ${result['current_spending']:,.2f}")
    print(f"Spending Rate: {(result['current_spending']/result['monthly_income'])*100:.1f}%")
    
    print("\n📊 RECOMMENDED BUDGET ALLOCATION:")
    print("-" * 60)
    budgets = result['recommended_budgets']
    print(f"  Essentials (50%): ${budgets['essentials']:,.2f}")
    print(f"  Lifestyle (30%):  ${budgets['lifestyle']:,.2f}")
    print(f"  Savings (20%):    ${budgets['savings']:,.2f}")
    
    print("\n💰 CATEGORY-WISE BUDGET SUGGESTIONS:")
    print("-" * 60)
    for category, data in result['category_budgets'].items():
        diff_symbol = "💚" if data['difference'] < 0 else "⚠️"
        print(f"{diff_symbol} {category}:")
        print(f"   Current: ${data['current_spending']:,.2f}")
        print(f"   Suggested: ${data['suggested_budget']:,.2f}")
        print(f"   Impact: ${data['difference']:,.2f}")
        print()
    
    print("🤖 AI INSIGHTS:")
    print("-" * 60)
    for insight in result['ai_insights']:
        emoji = {'warning': '⚠️', 'info': 'ℹ️', 'tip': '💡', 'success': '✅'}
        print(f"{emoji.get(insight['type'], '•')} {insight['title']}")
        print(f"   {insight['message']}\n")
    
    print(f"Confidence Score: {result['confidence_score']:.1f}%")
    print("=" * 60)
