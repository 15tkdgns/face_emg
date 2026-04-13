# 강민구 — 모델 실험 폴더

## 담당 실험
- 실험 C: EfficientNet-B0 + Focal Loss (16K/class)

---

## 실행에 필요한 파일 목록

### 공통 코드 (루트)
| 파일 | 역할 |
|------|------|
| `model.py` | EfficientNet-B0 / DenseNet121 모델 정의 |
| `dataset.py` | BibleDataset / AiHubDataset 데이터 로더 |
| `train.py` | 학습 루프 (lr scheduler, early stopping) |
| `evaluate.py` | 정확도 / F1 / confusion matrix 계산 |
| `experiment.py` | config yaml 기반 전체 파이프라인 실행 |
| `losses.py` | Focal Loss 구현 |
| `xai.py` | Grad-CAM 시각화 |
| `requirements.txt` | 패키지 목록 |

### 데이터
| 경로 | 내용 |
|------|------|
| `G:/내 드라이브/aihub_cropped/train/{감정}/` | AI Hub 학습 이미지 (224×224 face crop) |
| `G:/내 드라이브/aihub_cropped/val/{감정}/` | AI Hub 검증 이미지 |

> 데이터가 없으면 박상훈에게 `aihub/prepare.py` 실행 결과물을 공유 받거나 동일 경로에 직접 배치

### 실험 config
| 파일 | 내용 |
|------|------|
| `configs/aihub_C_efficientnet_focal.yaml` | 실험 C 설정 |

---

## 실행 방법

```bash
# 환경 설치
pip install -r requirements.txt

# 실험 C 실행
python experiment.py --config configs/aihub_C_efficientnet_focal.yaml
```

---

## 결과물 위치
`output/aihub/C_efficientnet_focal/` — best_model.pth, result.json, confusion_matrix.png, grad_cam/

---

## EfficientNet-B0 구조 요약
```
입력 224×224×3
→ Stem Conv (3×3, 32ch)
→ MBConv Blocks × 16 (16ch → 320ch, SE + DropConnect)
→ Head Conv 1×1 (1280ch)
→ Global Avg Pool → 1280-dim
→ Dropout(0.3) → Linear(1280→7)
→ Softmax → 7개 감정
```
