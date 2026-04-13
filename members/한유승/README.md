# 한유승 — 모델 실험 폴더

## 담당 실험
- 실험 비교 분석 및 결과 종합
- `compare_runs.py` 실행 → 4개 실험 결과표 생성
- 웹 대시보드 결과 업데이트

---

## 실행에 필요한 파일 목록

### 공통 코드 (루트)
| 파일 | 역할 |
|------|------|
| `model.py` | 모델 정의 (결과 로드 시 필요) |
| `dataset.py` | 데이터 로더 |
| `evaluate.py` | 평가 지표 계산 |
| `compare_runs.py` | 여러 실험 결과 비교표 생성 |
| `xai.py` | Grad-CAM 재생성 |
| `requirements.txt` | 패키지 목록 |

### 결과 파일 (각자 실험 완료 후 수집)
| 경로 | 내용 |
|------|------|
| `output/aihub/A_densenet121_ce/result.json` | 실험 A 결과 (박상훈) |
| `output/aihub/B_densenet121_focal/result.json` | 실험 B 결과 (박상훈) |
| `output/aihub/C_efficientnet_focal/result.json` | 실험 C 결과 (강민구) |
| `output/aihub/D_densenet121_focal_full/result.json` | 실험 D 결과 (신희원) |

> 각자 실험 완료 후 `output/aihub/` 폴더를 Git push 하거나 공유 드라이브에 업로드

### 대시보드
| 파일 | 역할 |
|------|------|
| `바이블코딩/dashboard.py` | Streamlit 대시보드 |

---

## 실행 방법

```bash
# 환경 설치
pip install -r requirements.txt

# 전체 실험 결과 비교표 생성
python compare_runs.py

# 대시보드 실행
streamlit run 바이블코딩/dashboard.py
```

---

## result.json 구조 (참고)
```json
{
  "test_acc": 0.856,
  "test_f1": 0.841,
  "per_class_f1": {
    "기쁨": 0.91, "당황": 0.82, "분노": 0.85,
    "불안": 0.79, "상처": 0.77, "슬픔": 0.83, "중립": 0.88
  },
  "backbone": "densenet121",
  "loss": "focal",
  "epochs_trained": 28
}
```
