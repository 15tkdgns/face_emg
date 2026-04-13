# 신희원 — 모델 실험 폴더

## 담당 실험
- 실험 D: DenseNet121 + Focal Loss + **전체 데이터** (클래스 불균형 그대로 사용)

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
| `G:/내 드라이브/aihub_cropped/train/{감정}/` | AI Hub 학습 이미지 전체 (클래스별 16K~60K) |
| `G:/내 드라이브/aihub_cropped/val/{감정}/` | AI Hub 검증 이미지 |

> 실험 D는 `max_per_class: 0` (언더샘플링 없음) — 전체 데이터 사용으로 학습 시간이 다른 실험보다 길 수 있음

### 실험 config
| 파일 | 내용 |
|------|------|
| `configs/aihub_D_densenet121_focal_full.yaml` | 실험 D 설정 (epochs=20, 전체 데이터) |

---

## 실행 방법

```bash
# 환경 설치
pip install -r requirements.txt

# 실험 D 실행
python experiment.py --config configs/aihub_D_densenet121_focal_full.yaml
```

---

## 결과물 위치
`output/aihub/D_densenet121_focal_full/` — best_model.pth, result.json, confusion_matrix.png, grad_cam/

---

## 실험 D 특이사항
- 다른 실험(A/B/C)은 클래스당 최대 16,000장으로 언더샘플링
- 실험 D는 전체 데이터 사용 (기쁨·분노 ~16K, 나머지 ~60K)
- 클래스 불균형을 Focal Loss의 감마(γ=2.0)로 처리
- 언더샘플링 없이 더 많은 데이터로 학습했을 때 성능 차이 비교가 목적
