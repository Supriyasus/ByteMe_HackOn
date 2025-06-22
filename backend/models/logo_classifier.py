import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn.functional as F

# ✅ Match training brand label order
BRAND_LABELS = [
    "nike", "adidas", "puma", "apple", "samsung", "hp", "levis",
    "fila", "reebok", "pepsi", "nestle", "oreo", "coca_cola", "huawei"
]

# 🚀 Load trained ResNet18 logo classifier
def load_logo_model():
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, len(BRAND_LABELS))
    model.load_state_dict(torch.load("assets/logo_classifier.pth", map_location=torch.device('cpu')))
    model.eval()
    return model

# 🔍 Predict logo brand with top-3 probabilities
def predict_brand_logo(image_path):
    model = load_logo_model()
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])

    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = model(img_tensor)
        probs = F.softmax(output, dim=1).squeeze()

        top_probs, top_indices = torch.topk(probs, k=3)
        top_brands = [BRAND_LABELS[i] for i in top_indices.tolist()]
        top_scores = top_probs.tolist()

        predicted_brand = top_brands[0]
        confidence = top_scores[0]

        if confidence < 0.6:
            predicted_brand = "unknown"

        return {
            "predicted_brand": predicted_brand,
            "confidence": round(confidence, 3),
            "top_3_predictions": {
                brand: round(score, 3) for brand, score in zip(top_brands, top_scores)
            }
        }
