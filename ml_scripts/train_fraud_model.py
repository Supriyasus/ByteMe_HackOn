# ==============================================================================
# File: ml_scripts/train_fraud_model.py
# Description: This script performs the full pipeline for training the fraud
#              detection model. It loads raw data, engineers customer-level
#              features, trains an Isolation Forest model, and saves the
#              model and scaler for use in the API.
# ==============================================================================

import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import IsolationForest
import joblib
import os

# ==============================================================================
# PART 1: DATA PREPARATION AND FEATURE ENGINEERING
# ==============================================================================

print("--- Starting Data Preparation and Feature Engineering ---")

# --- 1. Data Loading ---
try:
    df = pd.read_excel('data/online_retail_II.xlsx')
except FileNotFoundError:
    print("Error: Dataset files not found. Please download 'online_retail_II.zip' from UCI,")
    print("extract it, and place the CSV files in a 'data/' directory.")
    exit()


print(f"Successfully loaded and combined datasets. Total transactions: {len(df)}")


# --- 2. Data Cleaning ---
print("\n--- Cleaning Data ---")
df.rename(columns={
    'Invoice': 'InvoiceNo', 'StockCode': 'StockCode', 'Description': 'Description',
    'Quantity': 'Quantity', 'InvoiceDate': 'InvoiceDate', 'Price': 'UnitPrice',
    'Customer ID': 'CustomerID', 'Country': 'Country'
}, inplace=True)
df.dropna(subset=['CustomerID'], inplace=True)
df['CustomerID'] = df['CustomerID'].astype(int)
df.drop_duplicates(inplace=True)
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
df['TotalValue'] = df['Quantity'] * df['UnitPrice']
df['IsReturn'] = df['InvoiceNo'].str.startswith('C', na=False)
df = df[~((df['IsReturn']) & (df['Quantity'] > 0))]
df = df[~((~df['IsReturn']) & (df['Quantity'] < 0))]
df = df[df['UnitPrice'] > 0]
print("Finished cleaning.")


# --- 3. Feature Engineering at the Customer Level ---
print("\n--- Engineering Customer-Level Features ---")
snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
customer_df = df.groupby('CustomerID').agg({
    'InvoiceDate': [('first_purchase_date', 'min'), ('last_purchase_date', 'max')],
    'InvoiceNo': 'nunique', 'Quantity': 'sum', 'TotalValue': 'sum', 'StockCode': 'nunique'
}).reset_index()
customer_df.columns = ['CustomerID', 'first_purchase_date', 'last_purchase_date', 'total_invoices', 'total_items', 'total_spend', 'distinct_products']
customer_df['days_as_customer'] = (snapshot_date - customer_df['first_purchase_date']).dt.days
customer_df['recency'] = (snapshot_date - customer_df['last_purchase_date']).dt.days

returns_df = df[df['IsReturn']]
customer_returns = returns_df.groupby('CustomerID').agg({
    'Quantity': 'sum', 'TotalValue': 'sum', 'InvoiceNo': 'nunique'
}).reset_index().rename(columns={'Quantity': 'total_items_returned', 'TotalValue': 'total_value_returned', 'InvoiceNo': 'total_return_invoices'})

customer_df = pd.merge(customer_df, customer_returns, on='CustomerID', how='left')
customer_df.fillna(0, inplace=True)
customer_df['total_items_returned'] = abs(customer_df['total_items_returned'])
customer_df['total_value_returned'] = abs(customer_df['total_value_returned'])

total_items_purchased = customer_df['total_items'] + customer_df['total_items_returned']
customer_df['return_rate_by_items'] = customer_df['total_items_returned'] / (total_items_purchased + 1)
customer_df['return_rate_by_value'] = customer_df['total_value_returned'] / (customer_df['total_spend'] + customer_df['total_value_returned'] + 1)
customer_df['return_rate_by_invoices'] = customer_df['total_return_invoices'] / (customer_df['total_invoices'] + 1)
print("Feature engineering complete.")

# Optional: Save the intermediate feature set for inspection
# output_path = 'data/customer_features.csv'
# customer_df.to_csv(output_path, index=False)


# ==============================================================================
# PART 2: MODEL TRAINING
# ==============================================================================

print("\n--- Starting Model Training ---")

# --- 1. Select Features for Modeling ---
features_for_model = [
    'total_invoices', 'total_items', 'total_spend', 'distinct_products', 'days_as_customer',
    'recency', 'total_items_returned', 'total_value_returned', 'total_return_invoices',
    'return_rate_by_items', 'return_rate_by_value', 'return_rate_by_invoices'
]
X = customer_df[features_for_model]

# --- 2. Scale the Features ---
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)
print("Features selected and scaled.")

# --- 3. Train the Isolation Forest Model ---
print("Training Isolation Forest model...")
iso_forest = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)
iso_forest.fit(X_scaled)
print("Model training complete.")

# --- 4. Get Predictions and Analyze Results ---
customer_df['anomaly_score'] = iso_forest.decision_function(X_scaled)
customer_df['is_anomaly'] = iso_forest.predict(X_scaled)
suspicious_customers = customer_df[customer_df['is_anomaly'] == -1].sort_values('anomaly_score')
print("\n--- TOP SUSPICIOUS CUSTOMERS DETECTED ---")
print(f"Found {len(suspicious_customers)} potential anomalous customers.")
print(suspicious_customers[['CustomerID', 'anomaly_score', 'return_rate_by_items', 'total_value_returned', 'total_spend']].head(15))

# --- 5. Save the Model and Scaler for the API ---
output_dir = 'ml_models'
os.makedirs(output_dir, exist_ok=True)
joblib.dump(iso_forest, os.path.join(output_dir, 'isolation_forest_model.joblib'))
joblib.dump(scaler, os.path.join(output_dir, 'scaler.joblib'))
print(f"\nSuccessfully saved the model and scaler to the '{output_dir}' directory.")
print("\n--- SCRIPT COMPLETE ---")


# --- ADD THIS SECTION TO SAVE THE RESULTS FOR THE API ---
print("\n--- Saving results for API consumption ---")
# Define the path to the data directory in the backend
# This makes it easy for the FastAPI server to find it
backend_data_path = 'backend/data'
os.makedirs(backend_data_path, exist_ok=True) 

# Save the top 20 suspicious customers to a JSON file
report_path = os.path.join(backend_data_path, 'suspicious_customers_report.json')
suspicious_customers.head(20).to_json(report_path, orient='records')

print(f"Saved top 20 suspicious customers report to '{report_path}'")