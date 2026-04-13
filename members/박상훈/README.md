# 박상훈 — 모델 실험 폴더

## 담당 실험
- AI Hub 데이터 전처리 파이프라인 구축
- 실험 A: DenseNet121 + CrossEntropy
- 실험 B: DenseNet121 + Focal Loss

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
| `aihub/prepare.py` | 위 데이터 생성 스크립트 |

### 실험 config
| 파일 | 내용 |
|------|------|
| `configs/aihub_A_densenet121_ce.yaml` | 실험 A 설정 |
| `configs/aihub_B_densenet121_focal.yaml` | 실험 B 설정 |

---

## 실행 방법

```bash
# 환경 설치
pip install -r requirements.txt

# 데이터 전처리 (최초 1회)
python aihub/prepare.py --out "G:/내 드라이브/aihub_cropped" --max_per_class 16000

# 실험 A 실행
python experiment.py --config configs/aihub_A_densenet121_ce.yaml

# 실험 B 실행
python experiment.py --config configs/aihub_B_densenet121_focal.yaml
```

---

## 결과물 위치
`output/aihub/A_densenet121_ce/` — best_model.pth, result.json, confusion_matrix.png, grad_cam/
`output/aihub/B_densenet121_focal/` — 동일 구조
