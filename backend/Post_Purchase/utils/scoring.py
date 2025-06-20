import joblib
import pandas as pd
import os
from pathlib import Path # Import Path
from .schemas import CustomerFeatures

# --- Define paths using pathlib for robustness ---

# Get the directory where the current script (scoring.py) is located
CURRENT_SCRIPT_DIR = Path(__file__).parent

# Navigate from CURRENT_SCRIPT_DIR to the project root, then to ml_models
# CURRENT_SCRIPT_DIR is: /home/prat/hackon/ByteMe_HackOn/backend/Post_Purchase/utils
# .parent goes up to:    /home/prat/hackon/ByteMe_HackOn/backend/Post_Purchase
# .parent.parent goes up to: /home/prat/hackon/ByteMe_HackOn/backend
# .parent.parent.parent goes up to: /home/prat/hackon/ByteMe_HackOn (This is your PROJECT_ROOT)

PROJECT_ROOT = CURRENT_SCRIPT_DIR.parent.parent.parent

# Now, combine PROJECT_ROOT with your 'ml_models' directory
MODEL_DIR = PROJECT_ROOT / "ml_models"

# Define the full paths to your model and scaler files
# Ensure these filenames match exactly what your training script saves
MODEL_PATH = MODEL_DIR / "isolation_forest_model.joblib" # Assuming this is the correct name
SCALER_PATH = MODEL_DIR / "scaler.joblib" # Assuming this is the correct name

# --- End of path definitions ---

class FraudScoringService:
    def __init__(self):
        self.model = None
        self.scaler = None
        try:
            # Add checks for file existence before loading for clearer errors
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
            if not SCALER_PATH.exists():
                raise FileNotFoundError(f"Scaler file not found at: {SCALER_PATH}")

            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            print("Fraud detection model and scaler loaded successfully.")
        except FileNotFoundError as e:
            # This is the error message that gets caught and printed to your console
            print(f"Error: {e} Please run the training script.")
            # The 'detail' in your API response comes from the 'raise RuntimeError' below
        except Exception as e:
            print(f"An unexpected error occurred during model/scaler loading: {e}")
            self.model = None
            self.scaler = None

    def score_customer(self, customer_id: str, features: CustomerFeatures) -> dict:
        if not self.model or not self.scaler:
            # This is the line that generates your "Fraud detection model is not available." detail
            # when self.model or self.scaler is None due to FileNotFoundError or other loading error.
            raise RuntimeError("Fraud detection model is not available.")
            # return {
            #     "customer_id": customer_id,
            #     "error": "Model not loaded."
            # } # You had this return, but the error indicates a RuntimeError is being raised instead.
              # If your FastAPI endpoint handler catches this RuntimeError and converts it to a 503, that's fine.

        # The order of features MUST match the order used during training
        feature_order = [
            'total_invoices', 'total_items', 'total_spend', 'distinct_products',
            'days_as_customer', 'recency', 'total_items_returned', 'total_value_returned',
            'total_return_invoices', 'return_rate_by_items', 'return_rate_by_value',
            'return_rate_by_invoices'
        ]

        # Create a DataFrame from the input features with the correct order
        data = {key: [getattr(features, key)] for key in feature_order}
        df = pd.DataFrame(data)

        # Scale the features
        X_scaled = self.scaler.transform(df)

        # Get the prediction and score
        prediction = self.model.predict(X_scaled)[0] # -1 for anomaly, 1 for normal
        score = self.model.decision_function(X_scaled)[0]

        is_anomaly = bool(prediction == -1)
        assessment = "High risk of refund abuse" if is_anomaly else "Normal activity"

        return {
            "customer_id": customer_id,
            "is_anomaly": is_anomaly,
            "anomaly_score": float(score),
            "assessment": assessment
        }

# Create a single instance to be used by the router
scoring_service = FraudScoringService()