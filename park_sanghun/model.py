"""
park_sanghun/model.py
---------------------
Define your own EmotionClassifier here.
You can use any architecture, loss, or trick you want.
The only requirement: the class must be named EmotionClassifier
and implement forward(x) -> logits (shape: [B, num_classes]).
"""
import torch
import torch.nn as nn
from torchvision import models


class EmotionClassifier(nn.Module):
    def __init__(self, num_classes: int = 7, pretrained: bool = True):
        super().__init__()
        # --- TODO: replace or modify the backbone below ---
        weights = 'DEFAULT' if pretrained else None
        backbone = models.densenet121(weights=weights)
        in_feat = backbone.classifier.in_features   # 1024
        backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_feat, num_classes),
        )
        self.net = backbone

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
