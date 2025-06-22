import os
import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

# Resolve paths relative to this script
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "logo_dataset")
MODEL_PATH = os.path.join(PROJECT_ROOT, "assets", "logo_classifier.pth")

# Create output folder if not exist
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EPOCHS = 12
BATCH_SIZE = 16
LR = 1e-3

# 🧠 Basic augmentations for generalization
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor()
])

# Dataset
dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

# Model setup
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, len(dataset.classes))
model = model.to(DEVICE)

# Loss + optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

best_acc = 0.0

# Training loop
print(f"🟡 Training on {len(dataset.classes)} classes ({dataset.class_to_idx})")
for epoch in range(EPOCHS):
    model.train()
    total, correct, running_loss = 0, 0, 0.0
    for imgs, labels in loader:
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, preds = outputs.max(1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    acc = correct / total
    print(f"✅ Epoch {epoch+1}/{EPOCHS} - Loss: {running_loss:.4f} - Accuracy: {acc:.4f}")
    
    if acc > best_acc:
        best_acc = acc
        print(f"New best accuracy: {best_acc:.4f} - Saving model...")

        # Save the model state
        torch.save(model.state_dict(), MODEL_PATH)

# Save model
torch.save(model.state_dict(), MODEL_PATH)
print(f"🎉 Model saved to {MODEL_PATH}")
