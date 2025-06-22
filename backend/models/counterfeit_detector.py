import clip
import torch
from PIL import Image

from models.logo_classifier import predict_brand_logo

# 📦 Load CLIP once at startup
_device = "cuda" if torch.cuda.is_available() else "cpu"
_model, _preprocess = clip.load("ViT-B/32", device=_device)

# 🔍 Compute CLIP image-text similarity
def compute_image_text_similarity(image_path: str, text: str) -> float:
    try:
        image = _preprocess(Image.open(image_path)).unsqueeze(0).to(_device)
        text_tokens = clip.tokenize([text]).to(_device)

        with torch.no_grad():
            image_features = _model.encode_image(image)
            text_features = _model.encode_text(text_tokens)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)

        similarity = (image_features @ text_features.T).item()
        return round(similarity, 3)
    except Exception as e:
        print(f"[ERROR] CLIP Similarity Failed: {e}")
        return 0.0

# 🧠 Logo prediction and brand matching
def compute_logo_flags(image_path: str, claimed_brand: str) -> dict:
    result = predict_brand_logo(image_path)

    claimed_brand = claimed_brand.strip().lower()
    predicted_brand = result["predicted_brand"]
    confidence = result["confidence"]
    top_3 = result["top_3_predictions"]

    brand_mismatch = predicted_brand != claimed_brand and predicted_brand != "unknown"

    return {
        "predicted_brand": predicted_brand,
        "brand_confidence": confidence,
        "top_3_brand_guesses": top_3,
        "claimed_brand": claimed_brand,
        "brand_mismatch": brand_mismatch
    }
