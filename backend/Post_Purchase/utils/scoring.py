import joblib
import pandas as pd
import os
from .schemas import CustomerFeatures # Note the relative import

# Define the paths relative to the project structure
MODEL_DIR = os.path.join(os.getcwd(), "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

class FraudScoringService:
    def __init__(self):
        try:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            print("Fraud detection model and scaler loaded successfully.")
        except FileNotFoundError:
            print(f"Error: Model or scaler not found. Please run the training script.")
            self.model = None
            self.scaler = None

    def score_customer(self, customer_id: str, features: CustomerFeatures) -> dict:
        if not self.model or not self.scaler:
            return {
                "customer_id": customer_id,
                "error": "Model not loaded."
            }
        
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