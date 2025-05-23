"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

// Tipos de monedas soportadas
export type CurrencyCode = "USD" | "EUR" | "JPY" | "GBP" | "AUD" | "CAD" | "DOP"

// Información de cada moneda
export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  rate: number // Tasa de cambio con respecto a USD (1 USD = X moneda)
  decimals: number
}

// Idiomas soportados
export type LanguageCode = "en" | "es"

// Información de cada idioma
export interface LanguageInfo {
  code: LanguageCode
  name: string
}

// Configuración del usuario
export interface UserSettings {
  language: LanguageCode
  currency: CurrencyCode
  theme: "light" | "dark" | "system"
}

// Información de las monedas
export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.92, decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 150.14, decimals: 0 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79, decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52, decimals: 2 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36, decimals: 2 },
  DOP: { code: "DOP", symbol: "RD$", name: "Dominican Peso", rate: 58.75, decimals: 2 },
}

// Información de los idiomas
export const languages: Record<LanguageCode, LanguageInfo> = {
  en: { code: "en", name: "English" },
  es: { code: "es", name: "Español" },
}

// Configuración por defecto
const defaultSettings: UserSettings = {
  language: "en",
  currency: "USD",
  theme: "light",
}

// Clave para almacenar la configuración en localStorage
const SETTINGS_STORAGE_KEY = "finance_app_settings"

// Interfaz del contexto
interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: Date) => string
  translate: (key: string) => string
  translations: Record<string, string>
}

// Crear el contexto
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Traducciones
const translationData: Record<LanguageCode, Record<string, string>> = {
  en: {
    // General
    "app.name": "Finance Tracker",
    "app.description": "Track your income, expenses and financial goals",

    // Navigation
    "nav.overview": "Overview",
    "nav.transactions": "Transactions",
    "nav.ai_insights": "AI Insights",
    "nav.accounts": "Accounts",
    "nav.settings": "Settings",
    "nav.dashboard": "Dashboard",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.total_balance": "Total Balance",
    "dashboard.across_accounts": "Across all accounts",
    "dashboard.income": "Income",
    "dashboard.total_income": "Total income",
    "dashboard.expenses": "Expenses",
    "dashboard.total_expenses": "Total expenses",
    "dashboard.savings_rate": "Savings Rate",
    "dashboard.of_income": "Of your income",
    "dashboard.monthly_overview": "Monthly Overview",
    "dashboard.recent_transactions": "Recent Transactions",
    "dashboard.latest_activities": "Your latest financial activities",
    "dashboard.no_transactions": "No transactions yet.",
    "dashboard.view_all": "View all transactions",
    "dashboard.this_month": "This month",
    "dashboard.monthly_average": "Monthly average",
    "dashboard.income_vs_expenses": "Income vs expenses over time",
    "dashboard.detailed_view": "Detailed View",
    "dashboard.current_month_balance": "Current month balance",
    "dashboard.export_data": "Export Data",
    "dashboard.total_transactions": "Total transactions",
    "dashboard.add_new": "Add new",
    "dashboard.back": "Back",
    "dashboard.overview": "Overview",
    "dashboard.categories": "Categories",
    "dashboard.trends": "Trends",
    "dashboard.selected_period": "Selected period",
    "dashboard.net_balance": "Net Balance",
    "dashboard.balance": "Balance",
    "dashboard.monthly_comparison": "Monthly comparison",
    "dashboard.distribution_by_category": "Distribution by category",
    "dashboard.highest_spending_categories": "Highest spending categories",
    "dashboard.expense_categories": "Expense Categories",
    "dashboard.top_expenses": "Top Expenses",
    "dashboard.spending_trends": "Spending Trends",
    "dashboard.monthly_spending_evolution": "Monthly spending evolution",
    "dashboard.expense_ratio": "Expense Ratio",
    "dashboard.monthly_expenses": "Monthly Expenses",
    "budget.savings_rate": "Savings Rate",
    "dashboard.performance": "Performance",
    "dashboard.allocation": "Asset Allocation",
    "dashboard.market_insight": "Market Insight",
    "dashboard.market_insight_text":
      "Markets are showing positive trends with technology and healthcare sectors leading the growth. Consider diversifying your portfolio.",
    "dashboard.chart_placeholder": "Interactive chart will be displayed here",
    "dashboard.us_stocks": "US Stocks",
    "dashboard.international_stocks": "International Stocks",
    "dashboard.bonds": "Bonds",
    "dashboard.cash": "Cash",
    "dashboard.disclaimer": "Investment Disclaimer",
    "dashboard.disclaimer_text":
      "Past performance is not indicative of future results. Investments involve risk and may lose value.",
    "dashboard.start_small": "Start Small",
    "dashboard.start_small_desc": "Begin with a small amount you can afford to invest regularly.",
    "dashboard.automate": "Automate Investments",
    "dashboard.automate_desc": "Set up automatic transfers to your investment account.",
    "dashboard.diversify": "Diversify",
    "dashboard.diversify_desc": "Spread your investments across different asset classes.",
    "dashboard.stay_course": "Stay the Course",
    "dashboard.stay_course_desc": "Avoid reacting to short-term market fluctuations.",
    "dashboard.recommended_funds": "Recommended Funds",
    "dashboard.based_on_profile": "Based on your risk profile and goals",
    "dashboard.top_pick": "Top Pick",
    "dashboard.recommended": "Recommended",
    "dashboard.investment_strategy": "Investment Strategy",
    "dashboard.personalized_approach": "Personalized approach for your financial goals",
    "dashboard.historical_performance": "Historical Performance",
    "dashboard.past_performance": "How investments have performed over time",
    "dashboard.recommended_allocation": "Recommended Allocation",
    "dashboard.optimal_distribution": "Optimal distribution of your investment portfolio",
    "dashboard.high": "High",
    "dashboard.medium": "Medium",
    "dashboard.low": "Low",
    "dashboard.risk": "Risk Level",
    "dashboard.liquidity": "Liquidity",
    "dashboard.diversification": "Diversification",
    "dashboard.market_overview": "Market Overview",
    "dashboard.current_market_conditions": "Current market conditions and trends",

    // Transactions
    "transactions.title": "Transactions",
    "transactions.add": "Add Transaction",
    "transactions.all": "All Transactions",
    "transactions.total": "transactions total",
    "transactions.income": "Income",
    "transactions.expenses": "Expenses",
    "transactions.average": "Average Transaction",
    "transactions.per_transaction": "Per transaction",
    "transactions.search": "Search transactions...",
    "transactions.type": "Transaction Type",
    "transactions.month": "Month",
    "transactions.all_months": "All Months",
    "transactions.all_transactions": "All Transactions",
    "transactions.not_found": "No transactions found.",
    "transactions.transaction_list": "Transaction List",
    "transactions.filter_description": "Filter and manage your transactions",
    "transactions.showing": "Showing",
    "transactions.entries": "entries",
    "transactions.export_csv": "Export CSV",
    "transactions.largest": "Largest",
    "transactions.this_period": "This period",
    "transactions.transfer_successful": "Transfer Successful",
    "transactions.payment_successful": "Payment Successful",
    "transactions.income_recorded": "Income Recorded",
    "transactions.expense_recorded": "Expense Recorded",
    "transactions.transaction_successful": "Transaction Successful",

    // Transaction Form
    "transaction.details": "Transaction Details",
    "transaction.enter_details": "Enter the details of your new transaction",
    "transaction.update_details": "Update the details of your transaction",
    "transaction.type": "Transaction Type",
    "transaction.expense": "Expense",
    "transaction.income": "Income",
    "transaction.amount": "Amount",
    "transaction.description": "Description",
    "transaction.description_placeholder": "e.g. Grocery shopping",
    "transaction.category": "Category",
    "transaction.select_category": "Select a category",
    "transaction.date": "Date",
    "transaction.account": "Account",
    "transaction.select_account": "Select an account",
    "transaction.notes": "Notes (Optional)",
    "transaction.notes_placeholder": "Additional details about this transaction",
    "transaction.cancel": "Cancel",
    "transaction.save": "Save Transaction",
    "transaction.update": "Update Transaction",
    "transaction.actions": "Actions",

    // Categories
    "category.food": "Food & Dining",
    "category.transportation": "Transportation",
    "category.housing": "Housing",
    "category.utilities": "Utilities",
    "category.entertainment": "Entertainment",
    "category.health": "Health & Fitness",
    "category.shopping": "Shopping",
    "category.personal": "Personal Care",
    "category.education": "Education",
    "category.travel": "Travel",
    "category.salary": "Salary",
    "category.investment": "Investment",
    "category.other": "Other",
    "category.transfer": "Transfer",

    // Accounts
    "account.checking": "Checking Account",
    "account.savings": "Savings Account",
    "account.credit": "Credit Card",
    "account.cash": "Cash",
    "accounts.view_account_details": "View account details",
    "accounts.from": "From",
    "accounts.to": "To",
    "accounts.from": "From",
    "accounts.to": "To",

    // AI Insights
    "ai.title": "AI Insights",
    "ai.predictions": "Predictions",
    "ai.anomalies": "Spending Anomalies",
    "ai.savings": "Savings Goals",
    "ai.categorize": "Auto-Categorize",
    "ai.insights": "Insights",
    "ai.future_predictions": "Future Financial Predictions",
    "ai.based_on_history": "AI-powered predictions based on your historical data",
    "ai.income_expense_forecast": "Income & Expense Forecast",
    "ai.next_months_forecast": "Next 3 Months Forecast",
    "ai.predicted_income": "Predicted Monthly Income",
    "ai.predicted_expenses": "Predicted Monthly Expenses",
    "ai.predicted_categories": "Predicted Expense Categories",
    "ai.next_month": "Next month",
    "ai.spending_anomalies": "Spending Anomalies",
    "ai.unusual_patterns": "Categories with unusual spending patterns",
    "ai.no_anomalies": "No spending anomalies detected this month.",
    "ai.consistent_patterns": "Your spending patterns are consistent with previous months.",
    "ai.increase_from_last": "increase from last month",
    "ai.average_spending": "Average spending",
    "ai.current_spending": "Current spending",
    "ai.savings_goal": "Recommended Savings Goal",
    "ai.savings_recommendation": "AI-powered savings recommendation",
    "ai.per_month": "per month",
    "ai.current_savings": "Current savings this month",
    "ai.of_goal": "of goal",
    "ai.of_income": "of income",
    "ai.no_goal": "No savings goal recommended at this time.",
    "ai.potential_savings": "Potential savings opportunities",
    "ai.auto_categorize": "Auto-Categorize Transaction",
    "ai.suggest_category": "Let AI suggest a category based on the description",
    "ai.enter_description": "Enter transaction description...",
    "ai.suggested_category": "Suggested Category",
    "ai.alternative_categories": "Alternative categories",
    "ai.categorize": "Categorize",
    "ai.processing": "Processing...",
    "ai.high_confidence": "High confidence",
    "ai.medium_confidence": "Medium confidence",
    "ai.low_confidence": "Low confidence",
    "ai.categorization_explanation":
      "The AI analyzes the description to suggest the most appropriate category based on keywords and patterns.",
    "ai.financial_insights": "Financial Insights",
    "ai.personalized_analysis": "Personalized analysis of your financial patterns",
    "ai.spending_trends": "Spending Trends",
    "ai.top_expenses": "Top Expense Categories",
    "ai.no_trends": "Not enough data to analyze trends.",
    "ai.no_expenses": "No expense data available.",
    "ai.analyzing_data": "Analyzing your financial data",
    "ai.please_wait": "Please wait while we generate insights...",
    "ai.prediction_confidence": "Prediction Confidence",
    "ai.no_prediction_data": "Not enough data for predictions",
    "ai.stable": "Stable",
    "ai.decrease_from_last": "decrease from last month",
    "ai.recommended_amount": "Recommended amount",
    "ai.goal_timeline": "Goal timeline",
    "ai.months": "months",
    "ai.budget_optimization": "Budget Optimization",
    "ai.budget_explanation":
      'You could reduce your spending in "Entertainment" by 15% without significantly affecting your lifestyle, saving approximately $75 per month.',
    "ai.investment_recommendation": "Recommended Investment",
    "ai.investment_explanation":
      "With your current financial profile, you could consider investing $200 monthly in an index fund to build long-term wealth.",
    "ai.investment_type": "Investment type",
    "ai.index_fund": "Index fund",
    "ai.time_horizon": "Time horizon",
    "ai.long_term": "Long term",
    "anomaly.additional_income": "Additional Income Detected",
    "anomaly.income_explanation": "You've received an income of $350 that doesn't match your usual income patterns.",
    "anomaly.amount": "Amount",
    "anomaly.unused_subscription": "Unused Subscription",
    "anomaly.subscription_explanation":
      "You're paying $12.99 monthly for a service you haven't used in the last 3 months.",
    "anomaly.monthly_cost": "Monthly cost",
    "anomaly.last_used": "Last used",
    "anomaly.months_ago": "months ago",
    "anomaly.food_explanation": 'Your spending in "Restaurants" this month is 35% higher than your monthly average.',
    "ai.try_example": "Try an example",
    "category.main_expense":
      "Your main expense category is {category}, representing {percentage}% of your total expenses.",
    "category.expense_increase": "Your expenses in {category} have increased by {percentage}% in the last 3 months.",
    "category.expense_decrease":
      "You have reduced your expenses in {category} by {percentage}% in the last 3 months. Good job!",
    "savings.excellent": "Excellent work! You are saving {percentage}% of your income, which is a healthy rate.",
    "savings.good":
      "You are saving {percentage}% of your income. Consider increasing your savings rate to 20% to improve your financial health.",
    "savings.negative":
      "Your expenses exceed your income in the last 3 months. Consider reviewing your budget to avoid debt.",
    "debt.credit_card": "Credit Card",
    "debt.personal_loan": "Personal Loan",
    "debt.reduction_strategy": "Debt Reduction Strategy",
    "debt.personalized_plan": "Personalized plan to get debt-free faster",
    "debt.strategy_recommendation": "Strategy Recommendation",
    "debt.snowball_method":
      "Snowball Method: Pay off smallest debts first to gain psychological momentum.",
    "debt.recommended_for_you": "Recommended for you",
    "debt.your_debts": "Your Debts",
    "debt.interest_rate": "interest rate",
    "debt.high_priority": "High Priority",
    "debt.medium_priority": "Medium Priority",
    "debt.steps_to_reduce": "Steps to Reduce Your Debt",
    "debt.prioritize": "Prioritize your debts",
    "debt.focus_highest_interest": "Focus first on the credit card with 18% interest.",
    "debt.minimum_payments": "Minimum payment on all",
    "debt.make_minimum": "Make the minimum payment on all your debts to avoid late fees.",
    "debt.extra_payments": "Extra payments to priority debt",
    "debt.allocate_extra": "Allocate any extra money to the highest interest debt.",
    "debt.move_to_next": "Move to the next one",
    "debt.after_paying_first": "Once the first debt is paid off, direct that payment to the next one.",
    "debt.create_strategy": "Create Debt Strategy",
    "debt.debt_reduction_strategy": "Debt Reduction Strategy",
    "debt.reduce_high_interest": "Reduce High-Interest Debt",
    "debt.credit_card_explanation":
      "Your credit card has an 18% interest rate. Prioritize paying this debt before others with lower interest to save money in the long run.",
    "debt.prioritize_your_debts": "Prioritize your debts",
    "debt.focus_first_credit_card": "Focus first on the credit card with 18% interest.",
    "debt.minimum_payment_on_all": "Minimum payment on all",
    "debt.make_minimum_payment": "Make the minimum payment on all your debts to avoid late fees.",
    "debt.extra_payments_to_priority": "Extra payments to priority debt",
    "debt.allocate_extra_money": "Allocate any extra money to the highest interest debt.",
    "debt.move_to_the_next": "Move to the next one",
    "debt.once_first_debt_paid": "Once the first debt is paid off, direct that payment to the next one.",
    "debt.create_payment_strategy": "Create Payment Strategy",
    "ai.data_analysis_explanation":
      "Based on your financial data, we've analyzed patterns to provide personalized insights.",
    "category.savings": "Savings",
    "common.back_to_advice": "Back to Financial Advice",
    "common.spending": "Spending",
    "common.income": "Income",
    "common.savings": "Savings",
    "common.show_details": "Show Details",
    "common.hide_details": "Hide Details",
    "common.view_full_analysis": "View Full Analysis",

    "tips.budget_explanation":
      "80% of your expenses are in housing. Consider redistributing your budget for more financial flexibility and to avoid problems if your income changes.",
    "tips.investment_explanation":
      "With your current savings, you could consider low-risk investments that generate better returns than a traditional savings account and protect you from inflation.",
    "tips.emergency_explanation":
      "It's recommended to have at least 3-6 months of expenses saved for emergencies. Currently you don't have savings for this purpose, which makes you vulnerable to unexpected events.",
    "tips.automation_explanation":
      "Automating your savings will help you reach your financial goals faster. Set up automatic transfers to your savings accounts to build financial discipline.",
    "tips.debt_explanation":
      "Your credit card has an 18% interest rate. Prioritize paying this debt before others with lower interest to save money in the long run and improve your financial health. Every dollar you pay in interest is one less dollar for your financial goals.",

    // Financial Tips
    "tips.financial_tips": "Financial Tips",
    "tips.diversify_spending": "Diversify Your Spending",
    "tips.diversify_spending_desc":
      "Your {category} category represents a large portion of your expenses. Consider reviewing and diversifying your spending.",
    "tips.create_budget": "Create a budget",
    "tips.investment_opportunity": "Investment Opportunity",
    "tips.investment_opportunity_desc":
      "With your excellent savings rate, you could consider investing some of your savings for long-term growth.",
    "tips.explore_investments": "Explore investment options",
    "tips.emergency_fund": "Build an Emergency Fund",
    "tips.emergency_fund_desc":
      "Aim to save 3-6 months of expenses in an easily accessible account for unexpected situations.",
    "tips.start_saving": "Start saving now",
    "tips.automate_savings": "Automate Your Savings",
    "tips.automate_savings_desc":
      "Set up automatic transfers to your savings account on payday to make saving effortless.",
    "tips.set_up_auto": "Set up automatic transfers",
    "tips.reduce_debt": "Reduce High-Interest Debt",
    "tips.reduce_debt_desc": "Focus on paying off high-interest debt first to save money on interest payments.",
    "tips.debt_strategy": "Create a debt payoff strategy",
    "debt.credit_card": "Credit Card",
    "debt.personal_loan": "Personal Loan",
    "debt.reduction_strategy": "Debt Reduction Strategy",
    "debt.personalized_plan": "Personalized plan to get debt-free faster",
    "debt.strategy_recommendation": "Strategy Recommendation",
    "debt.snowball_method":
      "Snowball Method: Pay off smallest debts first to gain psychological momentum.",
    "debt.recommended_for_you": "Recommended for you",
    "debt.your_debts": "Your Debts",
    "debt.interest_rate": "interest rate",
    "debt.high_priority": "High Priority",
    "debt.medium_priority": "Medium Priority",
    "debt.steps_to_reduce": "Steps to Reduce Your Debt",
    "debt.prioritize": "Prioritize your debts",
    "debt.focus_highest_interest": "Focus first on the credit card with 18% interest.",
    "debt.minimum_payments": "Minimum payment on all",
    "debt.make_minimum": "Make the minimum payment on all your debts to avoid late fees.",
    "debt.extra_payments": "Extra payments to priority debt",
    "debt.allocate_extra": "Allocate any extra money to the highest interest debt.",
    "debt.move_to_next": "Move to the next one",
    "debt.after_paying_first": "Once the first debt is paid off, direct that payment to the next one.",
    "debt.create_strategy": "Create Debt Strategy",
    "debt.debt_reduction_strategy": "Debt Reduction Strategy",
    "debt.reduce_high_interest": "Reduce High-Interest Debt",
    "debt.credit_card_explanation":
      "Your credit card has an 18% interest rate. Prioritize paying this debt before others with lower interest to save money in the long run.",
    "debt.prioritize_your_debts": "Prioritize your debts",
    "debt.focus_first_credit_card": "Focus first on the credit card with 18% interest.",
    "debt.minimum_payment_on_all": "Minimum payment on all",
    "debt.make_minimum_payment": "Make the minimum payment on all your debts to avoid late fees.",
    "debt.extra_payments_to_priority": "Extra payments to priority debt",
    "debt.allocate_extra_money": "Allocate any extra money to the highest interest debt.",
    "debt.move_to_the_next": "Move to the next one",
    "debt.once_first_debt_paid": "Once the first debt is paid off, direct that payment to the next one.",
    "debt.create_payment_strategy": "Create Payment Strategy",
    "ai.data_analysis_explanation":
      "Based on your financial data, we've analyzed patterns to provide personalized insights.",
    "category.savings": "Savings",
    "common.back_to_advice": "Back to Financial Advice",
    "common.spending": "Spending",
    "common.income": "Income",
    "common.savings": "Savings",
    "common.show_details": "Show Details",
    "common.hide_details": "Hide Details",
    "common.view_full_analysis": "View Full Analysis",

    "tips.budget_explanation":
      "80% of your expenses are in housing. Consider redistributing your budget for more financial flexibility and to avoid problems if your income changes.",
    "tips.investment_explanation":
      "With your current savings, you could consider low-risk investments that generate better returns than a traditional savings account and protect you from inflation.",
    "tips.emergency_explanation":
      "It's recommended to have at least 3-6 months of expenses saved for emergencies. Currently you don't have savings for this purpose, which makes you vulnerable to unexpected events.",
    "tips.automation_explanation":
      "Automating your savings will help you reach your financial goals faster. Set up automatic transfers to your savings accounts to build financial discipline.",
    "tips.debt_explanation":
      "Your credit card has an 18% interest rate. Prioritize paying this debt before others with lower interest to save money in the long run and improve your financial health. Every dollar you pay in interest is one less dollar for your financial goals.",

    // Settings
    "settings.title": "Settings",
    "settings.preferences": "Preferences",
    "settings.customize": "Customize your experience",
    "settings.language": "Language",
    "settings.select_language": "Select your preferred language",
    "settings.theme": "Theme",
    "settings.select_theme": "Select your preferred theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.currency": "Currency",
    "settings.select_currency": "Select your preferred currency",
    "settings.save": "Save Settings",
    "settings.saved": "Settings saved successfully",

    // Alerts
    "alert.confirm": "Are you sure?",
    "alert.delete_transaction": "This action cannot be undone. This will permanently delete the transaction.",
    "alert.cancel": "Cancel",
    "alert.delete": "Delete",
    "alert.success": "Success",
    "alert.error": "Error",
    "alert.transaction_added": "Transaction added successfully",
    "alert.transaction_updated": "Transaction updated successfully",
    "alert.enter_description": "Please enter a description",
    "alert.enter_amount": "Please enter a valid amount",

    // Accounts
    "accounts.title": "Accounts",
    "accounts.add_account": "Add Account",
    "accounts.transfer": "Transfer",
    "accounts.transfer_funds": "Transfer Funds",
    "accounts.transfer_description": "Transfer money between your accounts",
    "accounts.from_account": "From Account",
    "accounts.to_account": "To Account",
    "accounts.amount": "Amount",
    "accounts.description": "Description",
    "accounts.optional": "optional",
    "accounts.transfer_description_placeholder": "e.g. Monthly savings transfer",
    "accounts.cancel": "Cancel",
    "accounts.select_account": "Select an account",
    "accounts.select_from_account": "Please select a source account",
    "accounts.select_to_account": "Please select a destination account",
    "accounts.same_account": "Source and destination accounts cannot be the same",
    "accounts.enter_valid_amount": "Please enter a valid amount",
    "accounts.insufficient_funds": "Insufficient funds in the source account",
    "accounts.transfer_success": "Funds transferred successfully",
    "accounts.transfer_from": "Transfer from",
    "accounts.transfer_to": "Transfer to",
    "accounts.to": "to",
    "accounts.account_activity": "Account Activity",
    "accounts.activity_description": "Income, expenses and balance over time",
    "accounts.account_stats": "Account Statistics",
    "accounts.stats_description": "Key metrics for this account",
    "accounts.total_income": "Total Income",
    "accounts.total_expenses": "Total Expenses",
    "accounts.average_income": "Average Income",
    "accounts.average_expense": "Average Expense",
    "accounts.transaction_count": "Transaction Count",
    "accounts.income": "Income",
    "accounts.expenses": "Expenses",
    "accounts.detailed_analytics": "Detailed Analytics",
    "accounts.recent_transactions": "Recent Transactions",
    "accounts.recent_transactions_description": "Your latest transactions for this account",
    "accounts.account_summary": "Account Summary",
    "accounts.summary_description": "Overview of your account activity",
    "accounts.rename_account": "Rename Account",
    "accounts.rename_description": "Change the display name of this account",
    "accounts.account_name": "Account Name",
    "accounts.account_name_placeholder": "e.g. My Checking Account",
    "accounts.save": "Save",
    "accounts.no_transactions": "No transactions for this account yet.",
    "accounts.search_transactions": "Search transactions...",
    "accounts.transaction_type": "Transaction Type",
    "accounts.all_transactions": "All Transactions",
    "accounts.no_matching_transactions": "No matching transactions found.",
    "accounts.date": "Date",
    "accounts.description": "Description",
    "accounts.category": "Category",
    "accounts.amount": "Amount",
    "accounts.monthly_comparison": "Monthly Comparison",
    "accounts.expense_categories": "Expense Categories",
    "accounts.net_flow": "Net Cash Flow",
    "accounts.top_expenses": "Top Expenses",
    "accounts.no_expenses_this_month": "No expenses recorded this month.",
    "accounts.balance": "Balance",
    "accounts.no_data": "No data available",
    "accounts.back": "Back",
    "accounts.overview": "Overview",
    "accounts.categories": "Categories",
    "accounts.transactions": "Transactions",
    "accounts.current_balance": "Current Balance",
    "accounts.as_of_today": "As of today",
    "accounts.total_income": "Total Income",
    "accounts.total_expenses": "Total Expenses",
    "accounts.net_flow": "Net Flow",
    "accounts.selected_period": "Selected period",
    "accounts.distribution_by_category": "Distribution by category",
    "accounts.highest_spending_categories": "Highest spending categories",
    "accounts.expense_categories": "Expense Categories",
    "accounts.balance": "Balance",

    // Export
    "export.export_pdf": "Export PDF",
    "export.export_summary": "Export Financial Summary",
    "export.select_sections": "Select the sections you want to include in your PDF report",
    "export.transactions_section": "Transactions",
    "export.accounts_section": "Accounts",
    "export.ai_insights_section": "AI Insights",
    "export.dashboard_section": "Dashboard Overview",
    "export.generating": "Generating...",
    "export.download": "Download PDF",
    "export.success": "Export Successful",
    "export.file_ready": "Your PDF file is ready to download",

    // Theme
    "theme.switch_to_light": "Switch to light mode",
    "theme.switch_to_dark": "Switch to dark mode",

    // Common
    "common.close": "Close",

    "budget.title": "Budget Planner",
    "budget.subtitle": "Plan and manage your monthly expenses",
    "budget.overview": "Overview",
    "budget.detailed": "Detailed",
    "budget.monthly_income": "Monthly Income",
    "budget.income_description": "Enter your total monthly income after taxes",
    "budget.total_income": "Total Income",
    "budget.savings_goal": "Savings Goal",
    "budget.allocation": "Budget Allocation",
    "budget.allocation_description": "How your income is distributed across categories",
    "budget.customize": "Customize Categories",
    "budget.categories": "Budget Categories",
    "budget.categories_description": "Customize your budget categories and allocations",
    "budget.category": "Category",
    "budget.percentage": "Percentage",
    "budget.amount": "Amount",
    "budget.add_category": "Add Category",
    "budget.back_to_overview": "Back to Overview",
    "budget.save_budget": "Save Budget",
    "budget.create_budget": "Create Budget",
    "budget.detailed_budget": "Detailed Budget",
    "budget.distribute_expenses": "Distribute your expenses intelligently",
    "budget.customize_categories": "Customize each category of your budget",
    "budget.main_categories": "Main Categories",
    "budget.suggested": "Suggested",
    "budget.create_detailed": "Create Detailed Budget",
    "budget.savings_goal_percent": "Savings Goal (%)",
    "common.cancel": "Cancel",
    "common.back": "Back",

    "automate.title": "Automate Savings",
    "automate.subtitle": "Set up automatic transfers to reach your goals faster",
    "automate.setup": "Setup Automatic Savings",
    "automate.from_account": "From Account",
    "automate.to_account": "To Account",
    "automate.amount": "Amount",
    "automate.frequency": "Frequency",
    "automate.start_date": "Start Date",
    "automate.end_date": "End Date (Optional)",
    "automate.description": "Description",
    "automate.save": "Save Automation",
    "automate.weekly": "Weekly",
    "automate.biweekly": "Bi-weekly",
    "automate.monthly": "Monthly",
    "automate.quarterly": "Quarterly",
    "automate.existing": "Existing Automations",
    "automate.no_automations": "No automations set up yet",
    "automate.next_transfer": "Next Transfer",
    "automate.edit": "Edit",
    "automate.delete": "Delete",
    "automate.emergency_fund": "Emergency Fund",
    "automate.vacation_fund": "Vacation Fund",

    "debt.create_strategy": "Create Debt Reduction Strategy",

    "budget.summary": "Budget Summary",
    "budget.summary_description": "Overview of your budget allocation",
    "budget.total_expenses": "Total Expenses",
    "budget.savings_amount": "Savings Amount",
    "budget.recommended_savings_rate": "Financial experts recommend saving 15-20% of income",
    "budget.suggested": "Suggested",

    "investments.title": "Investment Opportunities",
    "investments.subtitle": "Explore ways to grow your wealth",
    "dashboard.market_insight": "Market Insight",
    "dashboard.market_insight_text":
      "Markets are showing positive trends with technology and healthcare sectors leading the growth. Consider diversifying your portfolio.",
    "dashboard.chart_placeholder": "Interactive chart will be displayed here",
    "dashboard.us_stocks": "US Stocks",
    "dashboard.international_stocks": "International Stocks",
    "dashboard.bonds": "Bonds",
    "dashboard.cash": "Cash",
    "dashboard.disclaimer": "Investment Disclaimer",
    "dashboard.disclaimer_text":
      "Past performance is not indicative of future results. Investments involve risk and may lose value.",
    "dashboard.start_small": "Start Small",
    "dashboard.start_small_desc": "Begin with a small amount you can afford to invest regularly.",
    "dashboard.automate": "Automate Investments",
    "dashboard.automate_desc": "Set up automatic transfers to your investment account.",
    "dashboard.diversify": "Diversify",
    "dashboard.diversify_desc": "Spread your investments across different asset classes.",
    "dashboard.stay_course": "Stay the Course",
    "dashboard.stay_course_desc": "Avoid reacting to short-term market fluctuations.",
    "dashboard.recommended_funds": "Recommended Funds",
    "dashboard.based_on_profile": "Based on your risk profile and goals",
    "dashboard.top_pick": "Top Pick",
    "dashboard.recommended": "Recommended",
    "dashboard.investment_strategy": "Investment Strategy",
    "dashboard.personalized_approach": "Personalized approach for your financial goals",
    "dashboard.historical_performance": "Historical Performance",
    "dashboard.past_performance": "How investments have performed over time",
    "dashboard.recommended_allocation": "Recommended Allocation",
    "dashboard.optimal_distribution": "Optimal distribution of your investment portfolio",
    "dashboard.high": "High",
    "dashboard.medium": "Medium",
    "dashboard.low": "Low",
    "dashboard.risk": "Risk Level",
    "dashboard.liquidity": "Liquidity",
    "dashboard.diversification": "Diversification",
    "dashboard.market_overview": "Market Overview",
    "dashboard.current_market_conditions": "Current market conditions and trends",

    // Predicciones
    "predictions.ai_predictions": "AI Predictions",
    "predictions.next_month_forecast": "Next Month Forecast",
    "predictions.predicted_spending": "Predicted Spending",
    "predictions.predicted_income": "Predicted Income",
    "predictions.predicted_savings": "Predicted Savings",
    "predictions.compared_to": "Compared to",
    "predictions.category_breakdown": "Category Breakdown",
    "predictions.income_sources": "Income Sources",
    "predictions.savings_goal": "Savings Goal",
    "predictions.of_monthly_goal": "of monthly goal",
    "predictions.optimize_savings": "Optimize Savings",
    "predictions.view_detailed_spending_analysis": "View detailed spending analysis",

    // Común
    "common.spending": "Spending",
    "common.income": "Income",
    "common.savings": "Savings",
    "common.show_details": "Show Details",
    "common.hide_details": "Hide Details",
    "common.view_full_analysis": "View Full Analysis",

    "ai.year": "year",
    "ai.years": "years",

    "automate.setup_description": "Configure automatic transfers between your accounts",
    "automate.description_placeholder": "e.g. Monthly savings for vacation",
    "automate.existing_description": "Your scheduled automatic transfers",
    "automate.no_automations_description": "Set up automatic transfers to reach your financial goals faster",
    "automate.new_automation": "New Automation",

    "common.back": "Back",

    // Traducciones para los componentes de automatización y consejos financieros
    "automation.subtitle": "Set up automatic transfers to reach your goals faster",
    "automation.setup_autosave": "Set Up Automatic Savings",
    "automation.setup_description": "Configure recurring transfers to your savings account",
    "automation.frequency": "Frequency",
    "automation.select_frequency": "Select frequency",
    "automation.weekly": "Weekly",
    "automation.biweekly": "Bi-weekly",
    "automation.monthly": "Monthly",
    "automation.quarterly": "Quarterly",
    "automation.target_goal": "Target Goal",
    "automation.select_goal": "Select goal",
    "automation.auto_adjust": "Auto Adjust Savings",
    "automation.auto_adjust_description": "Automatically adjust savings amount based on income",
    "automation.summary": "Summary",
    "automation.estimated_results": "Estimated results based on your setup",
    "automation.monthly_saving": "Monthly Saving",
    "automation.yearly_saving": "Yearly Saving",
    "automation.goal_target": "Goal Target",
    "automation.time_to_goal": "Time to Goal",
    "automation.benefit_title": "Automate Your Financial Success",
    "automation.benefit_description":
      "By setting up automatic savings, you're more likely to stick to your plan and reach your goals faster",
    "automation.setup_autosave": "Set Up Automatic Savings",
    "automation.tips_title": "Tips for Successful Automation",
    "automation.tips_description": "Make the most of your automated savings plan",
    "automation.tip_1_title": "Start Small and Increase Gradually",
    "automation.tip_1_description": "Begin with a comfortable amount and gradually increase it as your income grows",
    "automation.tip_2_title": "Time Transfers with Payday",
    "automation.tip_2_description": "Schedule transfers to happen right after you get paid to ensure consistency",
    "automation.tip_3_title": "Review and Adjust Regularly",
    "automation.tip_3_description": "Review your automated savings every 3-6 months and adjust as needed",

    // Traducciones para metas financieras
    "goals.emergency_fund": "Emergency Fund",
    "goals.vacation": "Vacation",
    "goals.down_payment": "Home Down Payment",
    "goals.retirement": "Retirement",
    "goals.education": "Education",

    // Traducciones para inversiones
    "investments.title": "Investment Portfolio",
    "investments.subtitle": "Manage and track your investments",
    "investments.portfolio_summary": "Portfolio Summary",
    "investments.current_investments": "Current investment holdings",
    "investments.total_value": "Total Value",
    "investments.average_return": "Average Return",
    "investments.projected_value": "Projected Value",
    "investments.in_years": "In 5 years",
    "investments.this_month": "This month",
    "investments.last_year": "Last year",
    "investments.overview": "Overview",
    "investments.your_investments": "Your Investments",
    "investments.current_holdings": "Current investment holdings",
    "investments.view_allocation": "View Asset Allocation",
    "investments.portfolio_distribution": "How your portfolio is distributed",
    "investments.total": "Total",
    "investments.view_performance": "View Performance",
    "investments.historical_returns": "Historical investment returns",
    "investments.back_to_overview": "Back to Overview",
    "investments.stock_fund": "Stock Index Fund",
    "investments.bond_fund": "Bond Fund",
    "investments.real_estate": "Real Estate",
    "investments.cash": "Cash",
    "investments.risk.very_low": "Very Low Risk",
    "investments.risk.low": "Low Risk",
    "investments.risk.medium": "Medium Risk",
    "investments.risk.high": "High Risk",
    "investments.risk.very_high": "Very High Risk",
    "investments.ytd_return": "YTD Return",
    "investments.one_year_return": "1 Year Return",
    "investments.three_year_return": "3 Year Return",
    "investments.five_year_return": "5 Year Return",
    "investments.opportunities": "Investment Opportunities",
    "investments.personalized_recommendations": "Personalized recommendations based on your profile",
    "investments.index_fund_recommendation": "S&P 500 Index Fund",
    "investments.index_fund_description": "Low-cost fund that tracks the performance of the S&P 500 index",
    "investments.dividend_stocks": "Dividend Stocks",
    "investments.dividend_description": "Companies that regularly distribute a portion of earnings to shareholders",
    "investments.expected_return": "Expected Return",
    "investments.recommended_allocation": "Recommended",
    "investments.explore_recommendations": "Explore Investment Recommendations",

    // Correcciones para las traducciones incorrectas
    "dashboard.monthly_expenses": "Monthly Expenses",
    "budget.savings_rate": "Savings Rate",
    "dashboard.performance": "Performance",
    "dashboard.allocation": "Asset Allocation",

    // Y sus equivalentes en español
    "dashboard.monthly_expenses": "Gastos Mensuales",
    "budget.savings_rate": "Tasa de Ahorro",
    "dashboard.performance": "Rendimiento",
    "dashboard.allocation": "Distribución de Activos",

    // AI insufficient data messages
    "ai.insufficient_data_title": "Not Enough Data",
    "ai.insufficient_data_description": "We need at least 10 transactions to provide accurate AI insights. Please add more transactions to unlock this feature.",
  },
  es: {
    // General
    "app.name": "Gestor de Finanzas",
    "app.description": "Controla tus ingresos, gastos y objetivos financieros",

    // Navigation
    "nav.overview": "Resumen",
    "nav.transactions": "Transacciones",
    "nav.ai_insights": "Análisis IA",
    "nav.accounts": "Cuentas",
    "nav.settings": "Configuración",
    "nav.dashboard": "Panel Principal",

    // Dashboard
    "dashboard.title": "Panel Principal",
    "dashboard.total_balance": "Balance Total",
    "dashboard.across_accounts": "En todas las cuentas",
    "dashboard.income": "Ingresos",
    "dashboard.total_income": "Ingresos totales",
    "dashboard.expenses": "Gastos",
    "dashboard.total_expenses": "Gastos totales",
    "dashboard.savings_rate": "Tasa de Ahorro",
    "dashboard.of_income": "De tus ingresos",
    "dashboard.monthly_overview": "Resumen Mensual",
    "dashboard.recent_transactions": "Transacciones Recientes",
    "dashboard.latest_activities": "Tus últimas actividades financieras",
    "dashboard.no_transactions": "Aún no hay transacciones.",
    "dashboard.view_all": "Ver todas las transacciones",
    "dashboard.this_month": "Este mes",
    "dashboard.monthly_average": "Promedio mensual",
    "dashboard.income_vs_expenses": "Ingresos vs gastos a lo largo del tiempo",
    "dashboard.detailed_view": "Vista Detallada",
    "dashboard.current_month_balance": "Balance del mes actual",
    "dashboard.export_data": "Exportar Datos",
    "dashboard.total_transactions": "Total de transacciones",
    "dashboard.add_new": "Añadir nueva",
    "dashboard.back": "Volver",
    "dashboard.overview": "Resumen",
    "dashboard.categories": "Categorías",
    "dashboard.trends": "Tendencias",
    "dashboard.selected_period": "Período seleccionado",
    "dashboard.net_balance": "Balance Neto",
    "dashboard.balance": "Balance",
    "dashboard.monthly_comparison": "Comparación mensual",
    "dashboard.distribution_by_category": "Distribución por categoría",
    "dashboard.highest_spending_categories": "Categorías con mayor gasto",
    "dashboard.expense_categories": "Categorías de Gastos",
    "dashboard.top_expenses": "Principales Gastos",
    "dashboard.spending_trends": "Tendencias de Gasto",
    "dashboard.monthly_spending_evolution": "Evolución mensual de gastos",
    "dashboard.expense_ratio": "Ratio de Gastos",
    "dashboard.monthly_expenses": "Gastos Mensuales",
    "budget.savings_rate": "Tasa de Ahorro",
    "dashboard.performance": "Rendimiento",
    "dashboard.allocation": "Distribución de Activos",

    // Transactions
    "transactions.title": "Transacciones",
    "transactions.add": "Añadir Transacción",
    "transactions.all": "Todas las Transacciones",
    "transactions.total": "transacciones en total",
    "transactions.income": "Ingresos",
    "transactions.expenses": "Gastos",
    "transactions.average": "Transacción Promedio",
    "transactions.per_transaction": "Por transacción",
    "transactions.search": "Buscar transacciones...",
    "transactions.type": "Tipo de Transacción",
    "transactions.month": "Mes",
    "transactions.all_months": "Todos los Meses",
    "transactions.all_transactions": "Todas las Transacciones",
    "transactions.not_found": "No se encontraron transacciones.",
    "transactions.transaction_list": "Lista de Transacciones",
    "transactions.filter_description": "Filtra y administra tus transacciones",
    "transactions.showing": "Mostrando",
    "transactions.entries": "entradas",
    "transactions.export_csv": "Exportar CSV",
    "transactions.largest": "Mayor",
    "transactions.this_period": "Este período",
    "transactions.transfer_successful": "Transferencia Exitosa",
    "transactions.payment_successful": "Pago Exitoso",
    "transactions.income_recorded": "Ingreso Registrado",
    "transactions.expense_recorded": "Gasto Registrado",
    "transactions.transaction_successful": "Transacción Exitosa",

    // Transaction Form
    "transaction.details": "Detalles de la Transacción",
    "transaction.enter_details": "Ingresa los detalles de tu nueva transacción",
    "transaction.update_details": "Actualiza los detalles de tu transacción",
    "transaction.type": "Tipo de Transacción",
    "transaction.expense": "Gasto",
    "transaction.income": "Ingreso",
    "transaction.amount": "Monto",
    "transaction.description": "Descripción",
    "transaction.description_placeholder": "ej. Compra de comestibles",
    "transaction.category": "Categoría",
    "transaction.select_category": "Selecciona una categoría",
    "transaction.date": "Fecha",
    "transaction.account": "Cuenta",
    "transaction.select_account": "Selecciona una cuenta",
    "transaction.notes": "Notas (Opcional)",
    "transaction.notes_placeholder": "Detalles adicionales sobre esta transacción",
    "transaction.cancel": "Cancelar",
    "transaction.save": "Guardar Transacción",
    "transaction.update": "Actualizar Transacción",
    "transaction.actions": "Acciones",

    // Categories
    "category.food": "Alimentación",
    "category.transportation": "Transporte",
    "category.housing": "Vivienda",
    "category.utilities": "Servicios",
    "category.entertainment": "Entretenimiento",
    "category.health": "Salud y Bienestar",
    "category.shopping": "Compras",
    "category.personal": "Cuidado Personal",
    "category.education": "Educación",
    "category.travel": "Viajes",
    "category.salary": "Salario",
    "category.investment": "Inversión",
    "category.other": "Otros",
    "category.transfer": "Transferencia",

    // Accounts
    "account.checking": "Cuenta Corriente",
    "account.savings": "Cuenta de Ahorros",
    "account.credit": "Tarjeta de Crédito",
    "account.cash": "Efectivo",
    "accounts.view_account_details": "Ver detalles de la cuenta",
    "accounts.from": "Desde",
    "accounts.to": "Hacia",
    "accounts.from": "Desde",
    "accounts.to": "Hacia",

    // AI Insights
    "ai.title": "Análisis de IA",
    "ai.predictions": "Predicciones",
    "ai.anomalies": "Anomalías de Gasto",
    "ai.savings": "Objetivos de Ahorro",
    "ai.categorize": "Auto-Categorización",
    "ai.insights": "Perspectivas",
    "ai.future_predictions": "Predicciones Financieras Futuras",
    "ai.based_on_history": "Predicciones basadas en IA según tu historial",
    "ai.income_expense_forecast": "Pronóstico de Ingresos y Gastos",
    "ai.next_months_forecast": "Pronóstico para los Próximos 3 Meses",
    "ai.predicted_income": "Ingresos Mensuales Previstos",
    "ai.predicted_expenses": "Gastos Mensuales Previstos",
    "ai.predicted_categories": "Categorías de Gastos Previstas",
    "ai.next_month": "Próximo mes",
    "ai.spending_anomalies": "Anomalías de Gasto",
    "ai.unusual_patterns": "Categorías con patrones de gasto inusuales",
    "ai.no_anomalies": "No se detectaron anomalías de gasto este mes.",
    "ai.consistent_patterns": "Tus patrones de gasto son consistentes con los meses anteriores.",
    "ai.increase_from_last": "de aumento desde el mes pasado",
    "ai.average_spending": "Gasto promedio",
    "ai.current_spending": "Gasto actual",
    "ai.savings_goal": "Objetivo de Ahorro Recomendado",
    "ai.savings_recommendation": "Recomendación de ahorro basada en IA",
    "ai.per_month": "por mes",
    "ai.current_savings": "Ahorros actuales este mes",
    "ai.of_goal": "del objetivo",
    "ai.of_income": "de tus ingresos",
    "ai.no_goal": "No se recomienda un objetivo de ahorro en este momento.",
    "ai.potential_savings": "Oportunidades potenciales de ahorro",
    "ai.auto_categorize": "Auto-Categorizar Transacción",
    "ai.suggest_category": "Deja que la IA sugiera una categoría basada en la descripción",
    "ai.enter_description": "Ingresa la descripción de la transacción...",
    "ai.suggested_category": "Categoría Sugerida",
    "ai.alternative_categories": "Categorías alternativas",
    "ai.categorize": "Categorizar",
    "ai.processing": "Procesando...",
    "ai.high_confidence": "Alta confianza",
    "ai.medium_confidence": "Confianza media",
    "ai.low_confidence": "Baja confianza",
    "ai.categorization_explanation":
      "La IA analiza la descripción para sugerir la categoría más apropiada basada en palabras clave y patrones.",
    "ai.financial_insights": "Perspectivas Financieras",
    "ai.personalized_analysis": "Análisis personalizado de tus patrones financieros",
    "ai.spending_trends": "Tendencias de Gasto",
    "ai.top_expenses": "Principales Categorías de Gasto",
    "ai.no_trends": "No hay suficientes datos para analizar tendencias.",
    "ai.no_expenses": "No hay datos de gastos disponibles.",
    "ai.analyzing_data": "Analizando tus datos financieros",
    "ai.please_wait": "Por favor espera mientras generamos perspectivas...",
    "ai.prediction_confidence": "Confianza de la Predicción",
    "ai.no_prediction_data": "No hay suficientes datos para predicciones",
    "ai.stable": "Estable",
    "ai.decrease_from_last": "de disminución desde el mes pasado",
    "ai.recommended_amount": "Cantidad recomendada",
    "ai.goal_timeline": "Plazo del objetivo",
    "ai.months": "meses",
    "ai.budget_optimization": "Optimización de Presupuesto",
    "ai.budget_explanation":
      'Podrías reducir tus gastos en "Entretenimiento" en un 15% sin afectar significativamente tu estilo de vida, ahorrando aproximadamente €75 al mes.',
    "ai.investment_recommendation": "Inversión Recomendada",
    "ai.investment_explanation":
      "Con tu perfil financiero actual, podrías considerar invertir €200 mensuales en un fondo indexado para construir un patrimonio a largo plazo.",
    "ai.investment_type": "Tipo de inversión",
    "ai.index_fund": "Fondo indexado",
    "ai.time_horizon": "Horizonte temporal",
    "ai.long_term": "Largo plazo",
    "anomaly.additional_income": "Ingreso Adicional Detectado",
    "anomaly.income_explanation":
      "Has recibido un ingreso de €350 que no coincide con tus patrones habituales de ingresos.",
    "anomaly.amount": "Cantidad",
    "anomaly.unused_subscription": "Suscripción no Utilizada",
    "anomaly.subscription_explanation":
      "Estás pagando €12.99 mensuales por un servicio que no has utilizado en los últimos 3 meses.",
    "anomaly.monthly_cost": "Costo mensual",
    "anomaly.last_used": "Último uso",
    "anomaly.months_ago": "meses atrás",
    "anomaly.food_explanation": 'Tu gasto en "Restaurantes" este mes es un 35% mayor que tu promedio mensual.',
    "ai.try_example": "Probar un ejemplo",
    "category.main_expense":
      "Tu categoría principal de gasto es {category}, representando el {percentage}% de tus gastos totales.",
    "category.expense_increase": "Tus gastos en {category} han aumentado un {percentage}% en los últimos 3 meses.",
    "category.expense_decrease":
      "Has reducido tus gastos en {category} un {percentage}% en los últimos 3 meses. ¡Buen trabajo!",
    "savings.excellent":
      "¡Excelente trabajo! Estás ahorrando el {percentage}% de tus ingresos, lo cual es una tasa saludable.",
    "savings.good":
      "Estás ahorrando el {percentage}% de tus ingresos. Considera aumentar tu tasa de ahorro al 20% para mejorar tu salud financiera.",
    "savings.negative":
      "Tus gastos superan tus ingresos en los últimos 3 meses. Considera revisar tu presupuesto para evitar endeudamiento.",
    "debt.credit_card": "Tarjeta de Crédito",
    "debt.personal_loan": "Préstamo Personal",
    "debt.reduction_strategy": "Estrategia de Reducción de Deuda",
    "debt.personalized_plan": "Plan personalizado para liberarte de deudas más rápido",
    "debt.strategy_recommendation": "Recomendación de Estrategia",
    "debt.snowball_method":
      "Método de la Bola de Nieve: Paga primero las deudas más pequeñas para ganar impulso psicológico.",
    "debt.recommended_for_you": "Recomendado para ti",
    "debt.your_debts": "Tus Deudas",
    "debt.interest_rate": "de interés",
    "debt.high_priority": "Alta Prioridad",
    "debt.medium_priority": "Prioridad Media",
    "debt.steps_to_reduce": "Pasos para Reducir tu Deuda",
    "debt.prioritize": "Prioriza tus deudas",
    "debt.focus_highest_interest": "Enfócate primero en la tarjeta de crédito con 18% de interés.",
    "debt.minimum_payments": "Pago mínimo en todas",
    "debt.make_minimum": "Realiza el pago mínimo en todas tus deudas para evitar cargos por mora.",
    "debt.extra_payments": "Pagos extra a la deuda prioritaria",
    "debt.allocate_extra": "Destina cualquier dinero adicional a la deuda con mayor interés.",
    "debt.move_to_next": "Avanza a la siguiente",
    "debt.after_paying_first": "Una vez pagada la primera deuda, dirige ese pago a la siguiente.",
    "debt.create_strategy": "Crear Estrategia de Deuda",
    "debt.debt_reduction_strategy": "Estrategia de Reducción de Deuda",
    "debt.reduce_high_interest": "Reduce la Deuda de Alto Interés",
    "debt.credit_card_explanation":
      "Tu tarjeta de crédito tiene un interés del 18%. Prioriza pagar esta deuda antes que otras con menor interés para ahorrar dinero a largo plazo.",
    "debt.prioritize_your_debts": "Prioriza tus deudas",
    "debt.focus_first_credit_card": "Enfócate primero en la tarjeta de crédito con 18% de interés.",
    "debt.minimum_payment_on_all": "Pago mínimo en todas",
    "debt.make_minimum_payment": "Realiza el pago mínimo en todas tus deudas para evitar cargos por mora.",
    "debt.extra_payments_to_priority": "Pagos extra a la deuda prioritaria",
    "debt.allocate_extra_money": "Destina cualquier dinero adicional a la deuda con mayor interés.",
    "debt.move_to_the_next": "Avanza a la siguiente",
    "debt.once_first_debt_paid": "Una vez pagada la primera deuda, dirige ese pago a la siguiente.",
    "debt.create_payment_strategy": "Crear Estrategia de Pago",
    "ai.data_analysis_explanation":
      "Basado en tus datos financieros, hemos analizado patrones para proporcionar información personalizada.",
    "category.savings": "Ahorros",
    "common.back_to_advice": "Volver a Consejos Financieros",
    "common.spending": "Gastos",
    "common.income": "Ingresos",
    "common.savings": "Ahorros",
    "common.show_details": "Mostrar Detalles",
    "common.hide_details": "Ocultar Detalles",
    "common.view_full_analysis": "Ver Análisis Completo",

    "tips.budget_explanation":
      "El 80% de tus gastos están en vivienda. Considera redistribuir tu presupuesto para tener más flexibilidad financiera y evitar problemas si tus ingresos cambian.",
    "tips.investment_explanation":
      "Con tus ahorros actuales, podrías considerar inversiones de bajo riesgo que generen mejores rendimientos que una cuenta de ahorros tradicional y te protejan de la inflación.",
    "tips.emergency_explanation":
      "Se recomienda tener al menos 3-6 meses de gastos guardados para emergencias. Actualmente no tienes ahorros para este propósito, lo que te hace vulnerable a imprevistos.",
    "tips.automation_explanation":
      "Automatizar tus ahorros te ayudará a alcanzar tus metas financieras más rápido. Configura transferencias automáticas a tus cuentas de ahorro para construir disciplina financiera.",
    "tips.debt_explanation":
      "Tu tarjeta de crédito tiene un interés del 18%. Prioriza pagar esta deuda antes que otras con menor interés para ahorrar dinero a largo plazo y mejorar tu salud financiera. Cada peso que pagas en intereses es uno menos para tus metas financieras.",

    // Financial Tips
    "tips.financial_tips": "Consejos Financieros",
    "tips.diversify_spending": "Diversifica tus Gastos",
    "tips.diversify_spending_desc":
      "Tu categoría de {category} representa una gran parte de tus gastos. Considera revisar y diversificar tus gastos.",
    "tips.create_budget": "Crear un presupuesto",
    "tips.investment_opportunity": "Oportunidad de Inversión",
    "tips.investment_opportunity_desc":
      "Con tu excelente tasa de ahorro, podrías considerar invertir parte de tus ahorros para un crecimiento a largo plazo.",
    "tips.explore_investments": "Explorar opciones de inversión",
    "tips.emergency_fund": "Crea un Fondo de Emergencia",
    "tips.emergency_fund_desc":
      "Intenta ahorrar de 3 a 6 meses de gastos en una cuenta de fácil acceso para situaciones inesperadas.",
    "tips.start_saving": "Comienza a ahorrar ahora",
    "tips.automate_savings": "Automatiza tus Ahorros",
    "tips.automate_savings_desc":
      "Configura transferencias automáticas a tu cuenta de ahorros en el día de pago para hacer que ahorrar sea más fácil.",
    "tips.set_up_auto": "Configurar transferencias automáticas",
    "tips.reduce_debt": "Reduce la Deuda de Alto Interés",
    "tips.reduce_debt_desc": "Concéntrate en pagar primero las deudas con alto interés para ahorrar dinero en pagos de intereses.",
    "tips.debt_strategy": "Crear una estrategia de pago de deudas",

    // Settings
    "settings.title": "Configuración",
    "settings.preferences": "Preferencias",
    "settings.customize": "Personaliza tu experiencia",
    "settings.language": "Idioma",
    "settings.select_language": "Selecciona tu idioma preferido",
    "settings.theme": "Tema",
    "settings.select_theme": "Selecciona tu tema preferido",
    "settings.light": "Claro",
    "settings.dark": "Oscuro",
    "settings.system": "Sistema",
    "settings.currency": "Moneda",
    "settings.select_currency": "Selecciona tu moneda preferida",
    "settings.save": "Guardar Configuración",
    "settings.saved": "Configuración guardada exitosamente",

    // Alerts
    "alert.confirm": "¿Estás seguro?",
    "alert.delete_transaction": "Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción.",
    "alert.cancel": "Cancelar",
    "alert.delete": "Eliminar",
    "alert.success": "Éxito",
    "alert.error": "Error",
    "alert.transaction_added": "Transacción añadida exitosamente",
    "alert.transaction_updated": "Transacción actualizada exitosamente",
    "alert.enter_description": "Por favor ingresa una descripción",
    "alert.enter_amount": "Por favor ingresa un monto válido",

    // Accounts
    "accounts.title": "Cuentas",
    "accounts.add_account": "Añadir Cuenta",
    "accounts.transfer": "Transferir",
    "accounts.transfer_funds": "Transferir Fondos",
    "accounts.transfer_description": "Transferir dinero entre tus cuentas",
    "accounts.from_account": "Cuenta de Origen",
    "accounts.to_account": "Cuenta de Destino",
    "accounts.amount": "Monto",
    "accounts.description": "Descripción",
    "accounts.optional": "opcional",
    "accounts.transfer_description_placeholder": "ej. Transferencia mensual de ahorros",
    "accounts.cancel": "Cancelar",
    "accounts.select_account": "Selecciona una cuenta",
    "accounts.select_from_account": "Por favor selecciona una cuenta de origen",
    "accounts.select_to_account": "Por favor selecciona una cuenta de destino",
    "accounts.same_account": "Las cuentas de origen y destino no pueden ser la misma",
    "accounts.enter_valid_amount": "Por favor ingresa un monto válido",
    "accounts.insufficient_funds": "Fondos insuficientes en la cuenta de origen",
    "accounts.transfer_success": "Fondos transferidos exitosamente",
    "accounts.transfer_from": "Transferencia desde",
    "accounts.transfer_to": "Transferencia a",
    "accounts.to": "a",
    "accounts.account_activity": "Actividad de la Cuenta",
    "accounts.activity_description": "Ingresos, gastos y balance a lo largo del tiempo",
    "accounts.account_stats": "Estadísticas de la Cuenta",
    "accounts.stats_description": "Métricas clave para esta cuenta",
    "accounts.total_income": "Ingresos Totales",
    "accounts.total_expenses": "Gastos Totales",
    "accounts.average_income": "Ingreso Promedio",
    "accounts.average_expense": "Gasto Promedio",
    "accounts.transaction_count": "Número de Transacciones",
    "accounts.income": "Ingresos",
    "accounts.expenses": "Gastos",
    "accounts.detailed_analytics": "Análisis Detallado",
    "accounts.recent_transactions": "Transacciones Recientes",
    "accounts.recent_transactions_description": "Tus últimas transacciones para esta cuenta",
    "accounts.account_summary": "Resumen de la Cuenta",
    "accounts.summary_description": "Visión general de la actividad de tu cuenta",
    "accounts.rename_account": "Renombrar Cuenta",
    "accounts.rename_description": "Cambiar el nombre de visualización de esta cuenta",
    "accounts.account_name": "Nombre de la Cuenta",
    "accounts.account_name_placeholder": "ej. Mi Cuenta Corriente",
    "accounts.save": "Guardar",
    "accounts.no_transactions": "Aún no hay transacciones para esta cuenta.",
    "accounts.search_transactions": "Buscar transacciones...",
    "accounts.transaction_type": "Tipo de Transacción",
    "accounts.all_transactions": "Todas las Transacciones",
    "accounts.no_matching_transactions": "No se encontraron transacciones coincidentes.",
    "accounts.date": "Fecha",
    "accounts.description": "Descripción",
    "accounts.category": "Categoría",
    "accounts.amount": "Monto",
    "accounts.monthly_comparison": "Comparación Mensual",
    "accounts.expense_categories": "Categorías de Gastos",
    "accounts.net_flow": "Flujo Neto de Efectivo",
    "accounts.top_expenses": "Principales Gastos",
    "accounts.no_expenses_this_month": "No se han registrado gastos este mes.",
    "accounts.balance": "Balance",
    "accounts.no_data": "No hay datos disponibles",
    "accounts.back": "Volver",
    "accounts.overview": "Resumen",
    "accounts.categories": "Categorías",
    "accounts.transactions": "Transacciones",
    "accounts.current_balance": "Balance Actual",
    "accounts.as_of_today": "A día de hoy",
    "accounts.total_income": "Ingresos Totales",
    "accounts.total_expenses": "Gastos Totales",
    "accounts.net_flow": "Flujo Neto",
    "accounts.selected_period": "Período seleccionado",
    "accounts.distribution_by_category": "Distribución por categoría",
    "accounts.highest_spending_categories": "Categorías con mayor gasto",
    "accounts.expense_categories": "Categorías de Gastos",
    "accounts.balance": "Balance",

    // Export
    "export.export_pdf": "Exportar PDF",
    "export.export_summary": "Exportar Resumen Financiero",
    "export.select_sections": "Selecciona las secciones que deseas incluir en tu informe PDF",
    "export.transactions_section": "Transacciones",
    "export.accounts_section": "Cuentas",
    "export.ai_insights_section": "Análisis de IA",
    "export.dashboard_section": "Resumen General",
    "export.generating": "Generando...",
    "export.download": "Descargar PDF",
    "export.success": "Exportación Exitosa",
    "export.file_ready": "Tu archivo PDF está listo para descargar",

    // Theme
    "theme.switch_to_light": "Cambiar a modo claro",
    "theme.switch_to_dark": "Cambiar a modo oscuro",

    // Common
    "common.close": "Cerrar",

    "budget.title": "Planificador de Presupuesto",
    "budget.subtitle": "Planifica y gestiona tus gastos mensuales",
    "budget.overview": "Resumen",
    "budget.detailed": "Detallado",
    "budget.monthly_income": "Ingreso Mensual",
    "budget.income_description": "Ingresa tu ingreso mensual total después de impuestos",
    "budget.total_income": "Ingreso Total",
    "budget.savings_goal": "Meta de Ahorro",
    "budget.allocation": "Distribución del Presupuesto",
    "budget.allocation_description": "Cómo se distribuye tu ingreso entre categorías",
    "budget.customize": "Personalizar Categorías",
    "budget.categories": "Categorías de Presupuesto",
    "budget.categories_description": "Personaliza tus categorías de presupuesto y asignaciones",
    "budget.category": "Categoría",
    "budget.percentage": "Porcentaje",
    "budget.amount": "Monto",
    "budget.add_category": "Añadir Categoría",
    "budget.back_to_overview": "Volver al Resumen",
    "budget.save_budget": "Guardar Presupuesto",
    "budget.create_budget": "Crear Presupuesto",
    "budget.detailed_budget": "Presupuesto Detallado",
    "budget.distribute_expenses": "Distribuye tus gastos de manera inteligente",
    "budget.customize_categories": "Personaliza cada categoría de tu presupuesto",
    "budget.main_categories": "Categorías Principales",
    "budget.suggested": "Sugerido",
    "budget.create_detailed": "Crear Presupuesto Detallado",
    "budget.savings_goal_percent": "Meta de Ahorro (%)",
    "common.cancel": "Cancelar",
    "common.back": "Volver",

    "automate.title": "Automatizar Ahorros",
    "automate.subtitle": "Configura transferencias automáticas para alcanzar tus metas más rápido",
    "automate.setup": "Configurar Ahorros Automáticos",
    "automate.from_account": "Desde Cuenta",
    "automate.to_account": "A Cuenta",
    "automate.amount": "Monto",
    "automate.frequency": "Frecuencia",
    "automate.start_date": "Fecha de Inicio",
    "automate.end_date": "Fecha de Fin (Opcional)",
    "automate.description": "Descripción",
    "automate.save": "Guardar Automatización",
    "automate.weekly": "Semanal",
    "automate.biweekly": "Quincenal",
    "automate.monthly": "Mensual",
    "automate.quarterly": "Trimestral",
    "automate.existing": "Automatizaciones Existentes",
    "automate.no_automations": "Aún no hay automatizaciones configuradas",
    "automate.next_transfer": "Próxima Transferencia",
    "automate.edit": "Editar",
    "automate.delete": "Eliminar",
    "automate.emergency_fund": "Fondo de Emergencia",
    "automate.vacation_fund": "Fondo para Vacaciones",

    "debt.create_strategy": "Crear Estrategia de Reducción de Deuda",

    "budget.summary": "Resumen de Presupuesto",
    "budget.summary_description": "Visión general de la asignación de tu presupuesto",
    "budget.total_expenses": "Gastos Totales",
    "budget.savings_amount": "Cantidad de Ahorro",
    "budget.recommended_savings_rate": "Los expertos financieros recomiendan ahorrar 15-20% de los ingresos",
    "budget.suggested": "Sugerido",

    "investments.title": "Oportunidades de Inversión",
    "investments.subtitle": "Explora formas de hacer crecer tu patrimonio",
    "dashboard.market_insight": "Perspectiva del Mercado",
    "dashboard.market_insight_text":
      "Los mercados muestran tendencias positivas con los sectores de tecnología y salud liderando el crecimiento. Considera diversificar tu cartera.",
    "dashboard.chart_placeholder": "Aquí se mostrará un gráfico interactivo",
    "dashboard.us_stocks": "Acciones de EE.UU.",
    "dashboard.international_stocks": "Acciones Internacionales",
    "dashboard.bonds": "Bonos",
    "dashboard.cash": "Efectivo",
    "dashboard.disclaimer": "Aviso de Inversión",
    "dashboard.disclaimer_text":
      "El rendimiento pasado no garantiza resultados futuros. Las inversiones implican riesgo y pueden perder valor.",
    "dashboard.start_small": "Comienza Pequeño",
    "dashboard.start_small_desc": "Empieza con una pequeña cantidad que puedas invertir regularmente.",
    "dashboard.automate": "Automatiza Inversiones",
    "dashboard.automate_desc": "Configura transferencias automáticas a tu cuenta de inversión.",
    "dashboard.diversify": "Diversifica",
    "dashboard.diversify_desc": "Distribuye tus inversiones en diferentes clases de activos.",
    "dashboard.stay_course": "Mantén el Rumbo",
    "dashboard.stay_course_desc": "Evita reaccionar a las fluctuaciones del mercado a corto plazo.",
    "dashboard.recommended_funds": "Fondos Recomendados",
    "dashboard.based_on_profile": "Basado en tu perfil de riesgo y objetivos",
    "dashboard.top_pick": "Mejor Opción",
    "dashboard.recommended": "Recomendado",
    "dashboard.investment_strategy": "Estrategia de Inversión",
    "dashboard.personalized_approach": "Enfoque personalizado para tus objetivos financieros",
    "dashboard.historical_performance": "Rendimiento Histórico",
    "dashboard.past_performance": "Cómo han rendido las inversiones a lo largo del tiempo",
    "dashboard.recommended_allocation": "Asignación Recomendada",
    "dashboard.optimal_distribution": "Distribución óptima de tu cartera de inversión",
    "dashboard.high": "Alto",
    "dashboard.medium": "Medio",
    "dashboard.low": "Bajo",
    "dashboard.risk": "Nivel de Riesgo",
    "dashboard.liquidity": "Liquidez",
    "dashboard.diversification": "Diversificación",
    "dashboard.market_overview": "Panorama del Mercado",
    "dashboard.current_market_conditions": "Condiciones actuales del mercado y tendencias",

    // Predicciones
    "predictions.ai_predictions": "Predicciones de IA",
    "predictions.next_month_forecast": "Pronóstico del Próximo Mes",
    "predictions.predicted_spending": "Gasto Previsto",
    "predictions.predicted_income": "Ingreso Previsto",
    "predictions.predicted_savings": "Ahorro Previsto",
    "predictions.compared_to": "Comparado con",
    "predictions.category_breakdown": "Desglose por Categoría",
    "predictions.income_sources": "Fuentes de Ingreso",
    "predictions.savings_goal": "Meta de Ahorro",
    "predictions.of_monthly_goal": "de la meta mensual",
    "predictions.optimize_savings": "Optimizar Ahorros",
    "predictions.view_detailed_spending_analysis": "Ver análisis detallado de gastos",

    // Común
    "common.spending": "Gastos",
    "common.income": "Ingresos",
    "common.savings": "Ahorros",
    "common.show_details": "Mostrar Detalles",
    "common.hide_details": "Ocultar Detalles",
    "common.view_full_analysis": "Ver Análisis Completo",

    "ai.year": "año",
    "ai.years": "años",

    "automate.setup_description": "Configura transferencias automáticas entre tus cuentas",
    "automate.description_placeholder": "ej. Ahorro mensual para vacaciones",
    "automate.existing_description": "Tus transferencias automáticas programadas",
    "automate.no_automations_description":
      "Configura transferencias automáticas para alcanzar tus metas financieras más rápido",
    "automate.new_automation": "Nueva Automatización",

    "common.back": "Volver",

    // Traducciones para los componentes de automatización y consejos financieros
    "automation.subtitle": "Configura transferencias automáticas para alcanzar tus metas más rápido",
    "automation.setup_autosave": "Configurar Ahorros Automáticos",
    "automation.setup_description": "Configura transferencias recurrentes a tu cuenta de ahorros",
    "automation.frequency": "Frecuencia",
    "automation.select_frequency": "Seleccionar frecuencia",
    "automation.weekly": "Semanal",
    "automation.biweekly": "Quincenal",
    "automation.monthly": "Mensual",
    "automation.quarterly": "Trimestral",
    "automation.target_goal": "Meta Objetivo",
    "automation.select_goal": "Seleccionar meta",
    "automation.auto_adjust": "Ajuste Automático de Ahorros",
    "automation.auto_adjust_description": "Ajustar automáticamente la cantidad de ahorro según los ingresos",
    "automation.summary": "Resumen",
    "automation.estimated_results": "Resultados estimados basados en tu configuración",
    "automation.monthly_saving": "Ahorro Mensual",
    "automation.yearly_saving": "Ahorro Anual",
    "automation.goal_target": "Objetivo de la Meta",
    "automation.time_to_goal": "Tiempo para Alcanzar la Meta",
    "automation.benefit_title": "Automatiza Tu Éxito Financiero",
    "automation.benefit_description":
      "Al configurar ahorros automáticos, es más probable que te apegues a tu plan y alcances tus metas más rápido",
    "automation.setup_autosave": "Configurar Ahorros Automáticos",
    "automation.tips_title": "Consejos para una Automatización Exitosa",
    "automation.tips_description": "Aprovecha al máximo tu plan de ahorros automatizado",
    "automation.tip_1_title": "Comienza Pequeño y Aumenta Gradualmente",
    "automation.tip_1_description":
      "Comienza con una cantidad cómoda y auméntala gradualmente a medida que crezcan tus ingresos",
    "automation.tip_2_title": "Programa las Transferencias con el Día de Pago",
    "automation.tip_2_description":
      "Programa las transferencias para que se realicen justo después de que te paguen para garantizar la consistencia",
    "automation.tip_3_title": "Revisa y Ajusta Regularmente",
    "automation.tip_3_description": "Revisa tus ahorros automatizados cada 3-6 meses y ajústalos según sea necesario",

    // Traducciones para metas financieras
    "goals.emergency_fund": "Fondo de Emergencia",
    "goals.vacation": "Vacaciones",
    "goals.down_payment": "Pago Inicial de la Vivienda",
    "goals.retirement": "Jubilación",
    "goals.education": "Educación",

    // Traducciones para inversiones
    "investments.title": "Cartera de Inversiones",
    "investments.subtitle": "Gestiona y rastrea tus inversiones",
    "investments.portfolio_summary": "Resumen de la Cartera",
    "investments.current_investments": "Tenencias de inversión actuales",
    "investments.total_value": "Valor Total",
    "investments.average_return": "Retorno Promedio",
    "investments.projected_value": "Valor Proyectado",
    "investments.in_years": "En 5 años",
    "investments.this_month": "Este mes",
    "investments.last_year": "El año pasado",
    "investments.overview": "Resumen",
    "investments.your_investments": "Tus Inversiones",
    "investments.current_holdings": "Tenencias de inversión actuales",
    "investments.view_allocation": "Ver la Asignación de Activos",
    "investments.portfolio_distribution": "Cómo se distribuye tu cartera",
    "investments.total": "Total",
    "investments.view_performance": "Ver el Rendimiento",
    "investments.historical_returns": "Retornos históricos de la inversión",
    "investments.back_to_overview": "Volver al Resumen",
    "investments.stock_fund": "Fondo de Índice de Acciones",
    "investments.bond_fund": "Fondo de Bonos",
    "investments.real_estate": "Bienes Raíces",
    "investments.cash": "Efectivo",
    "investments.risk.very_low": "Riesgo Muy Bajo",
    "investments.risk.low": "Riesgo Bajo",
    "investments.risk.medium": "Riesgo Medio",
    "investments.risk.high": "Riesgo Alto",
    "investments.risk.very_high": "Riesgo Muy Alto",
    "investments.ytd_return": "Retorno YTD",
    "investments.one_year_return": "1 Year Return",
    "investments.three_year_return": "3 Year Return",
    "investments.five_year_return": "5 Year Return",
    "investments.opportunities": "Oportunidades de Inversión",
    "investments.personalized_recommendations": "Recomendaciones personalizadas basadas en tu perfil",
    "investments.index_fund_recommendation": "Fondo de Índice S&P 500",
    "investments.index_fund_description": "Fondo de bajo costo que rastrea el rendimiento del índice S&P 500",
    "investments.dividend_stocks": "Acciones de Dividendos",
    "investments.dividend_description": "Empresas que distribuyen regularmente una parte de las ganancias a los accionistas",
    "investments.expected_return": "Retorno Esperado",
    "investments.recommended_allocation": "Recomendado",
    "investments.explore_recommendations": "Explorar Recomendaciones de Inversión",

    // Correcciones para las traducciones incorrectas
    "dashboard.monthly_expenses": "Gastos Mensuales",
    "budget.savings_rate": "Tasa de Ahorro",
    "dashboard.performance": "Rendimiento",
    "dashboard.allocation": "Distribución de Activos",

    // Y sus equivalentes en español
    "dashboard.monthly_expenses": "Gastos Mensuales",
    "budget.savings_rate": "Tasa de Ahorro",
    "dashboard.performance": "Rendimiento",
    "dashboard.allocation": "Distribución de Activos",

    // AI insufficient data messages
    "ai.insufficient_data_title": "Datos Insuficientes",
    "ai.insufficient_data_description": "Necesitamos al menos 10 transacciones para proporcionar análisis de IA precisos. Por favor, añade más transacciones para desbloquear esta función.",
  },
}

// Proveedor del contexto
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [translations, setTranslations] = useState<Record<string, string>>(translationData.en)

  // Cargar configuración al iniciar
  useEffect(() => {
    const loadSettings = () => {
      if (typeof window === "undefined") return defaultSettings

      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!savedSettings) return defaultSettings

      try {
        return JSON.parse(savedSettings) as UserSettings
      } catch (error) {
        console.error("Error parsing saved settings:", error)
        return defaultSettings
      }
    }

    const userSettings = loadSettings()
    setSettings(userSettings)
    setTranslations(translationData[userSettings.language])
    setTheme(userSettings.theme)
  }, [setTheme])

  // Actualizar configuración
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    // Actualizar traducciones si cambia el idioma
    if (newSettings.language && newSettings.language !== settings.language) {
      setTranslations(translationData[newSettings.language])
    }

    // Actualizar tema si cambia
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      setTheme(newSettings.theme)
    }

    // Guardar en localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings))
  }

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    const currencyInfo = currencies[settings.currency]

    // Convertir de USD a la moneda seleccionada
    const convertedAmount = amount * currencyInfo.rate

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyInfo.code,
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    }).format(convertedAmount)
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }

    return new Intl.DateTimeFormat(settings.language === "en" ? "en-US" : "es-ES", options).format(date)
  }

  // Traducir texto
  const translate = (key: string) => {
    // For category keys, return just the value without the prefix
    if (key.startsWith("category.")) {
      return translations[key] || key.replace("category.", "");
    }
    
    return translations[key] || key;
  }

  const value = {
    settings,
    updateSettings,
    formatCurrency,
    formatDate,
    translate,
    translations,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// Hook para usar el contexto
export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
