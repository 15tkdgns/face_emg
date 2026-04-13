# park_sanghun

## Goal
Build your own emotion classifier and compete with other members.
Modify `model.py` freely — any architecture, any trick.

---

## Folder Structure
```
park_sanghun/
├── model.py       ← YOUR model (edit freely)
├── README.md      ← this file
├── config.yaml    ← your training config (create this)
└── results/       ← your output (create after training)
    ├── best_model.pth
    ├── result.json
    └── confusion_matrix.png
```

---

## Shared Files You Need (from project root)
| File | Role |
|------|------|
| `dataset.py` | Data loader (BibleDataset / AiHubDataset) |
| `train.py` | Training loop |
| `evaluate.py` | Accuracy / F1 / confusion matrix |
| `losses.py` | Focal Loss |
| `experiment.py` | Full pipeline runner (optional) |
| `requirements.txt` | Package list |

---

## Data Path
```
G:/내 드라이브/aihub_cropped/
├── train/{기쁨,당황,분노,불안,상처,슬픔,중립}/  ← training images (max 16K/class)
└── val/  {기쁨,당황,분노,불안,상처,슬픔,중립}/  ← validation images
```

---

## How to Run

### Option A — use experiment.py with a config
```bash
# 1. Create your config (copy and edit an existing one)
cp configs/aihub_A_densenet121_ce.yaml park_sanghun/config.yaml

# 2. Edit park_sanghun/config.yaml:
#    output_dir: park_sanghun/results

# 3. Train
python experiment.py --config park_sanghun/config.yaml
```

### Option B — write your own training script
```bash
python park_sanghun/train_custom.py   # if you write one
```

---

## Rules
- Only edit files inside your own folder + `park_sanghun/model.py`
- Do NOT modify shared root files (dataset.py, train.py, etc.)
- Save your best checkpoint to `park_sanghun/results/best_model.pth`
- Record final test accuracy and F1 in `park_sanghun/results/result.json`

---

## Comparison Metric
Final ranking is based on **test accuracy** and **macro F1** on the shared AI Hub validation set.
