import pandas as pd
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import json

print("--- Starting Bulk Review Analysis (No Date) ---")

# --- 1. Load the Sentiment Model ---
print("Loading sentiment analysis model...")
try:
    MODEL = "cardiffnlp/twitter-roberta-base-sentiment"
    tokenizer = AutoTokenizer.from_pretrained(MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL)
    model.eval()
    labels = ['negative', 'neutral', 'positive']
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}. Ensure you have an internet connection.")
    exit()

# --- 2. Load and Prepare the Dataset ---
try:
    df = pd.read_csv("data/amazon.csv")
    print(f"Loaded {df.shape[0]} rows from amazon.csv")
except FileNotFoundError:
    print("Error: 'data/amazon.csv' not found. Please place your dataset in a 'data' folder in the project root.")
    exit()

# Data Cleaning
df = df.dropna(subset=['review_content'])
df['review_title'] = df['review_title'].fillna('')
df['review_content'] = df['review_content'].astype(str).str.strip()
df['review'] = (df['review_title'] + '. ' + df['review_content']).str.strip()
df = df[df['review'].str.len() > 20].reset_index(drop=True)
print(f"Processing {df.shape[0]} valid reviews...")

# --- 3. Define Analysis Functions ---
def get_sentiment(text):
    inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
    return labels[np.argmax(probs)]

def detect_mismatch(row):
    try:
        sentiment = row['sentiment']
        rating = float(row['rating'])
        return 1 if (sentiment == 'negative' and rating >= 4.0) or (sentiment == 'positive' and rating <= 2.0) else 0
    except:
        return 0

# --- 4. Perform Bulk Analysis ---
print("Analyzing sentiment for all reviews... (This may take a while)")
sentiments = []
for i, review in enumerate(df['review']):
    if (i + 1) % 100 == 0:
        print(f"  Processed {i+1}/{df.shape[0]} reviews...")
    sentiments.append(get_sentiment(review))
df['sentiment'] = sentiments

print("Sentiment analysis complete. Flagging mismatches...")
df['is_suspicious'] = df.apply(detect_mismatch, axis=1)

# --- 5. Generate and Save Reports ---
print("Generating reports...")

output_dir = 'backend/data'
os.makedirs(output_dir, exist_ok=True)

# a) Flagged Reviews Report (No Timestamp)
flagged_df = df[df['is_suspicious'] == 1].copy()
report_path = os.path.join(output_dir, 'flagged_reviews_report.json')
# REMOVED timestamp from the saved columns
flagged_df_to_save = flagged_df[['rating', 'sentiment', 'review']]
flagged_df_to_save.to_json(report_path, orient='records', indent=4)
print(f"Found {len(flagged_df)} suspicious reviews. Report saved to {report_path}")

# b) Statistics Report for Pie Chart
stats_counts = df['is_suspicious'].value_counts()
stats_report = {
    'real_count': int(stats_counts.get(0, 0)),
    'fake_count': int(stats_counts.get(1, 0))
}
stats_report_path = os.path.join(output_dir, 'review_stats_report.json')
with open(stats_report_path, 'w') as f:
    json.dump(stats_report, f, indent=4)
print(f"Generated aggregate stats. Report saved to {stats_report_path}")

print("\n--- Bulk analysis complete! ---")