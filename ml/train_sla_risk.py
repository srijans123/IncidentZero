#!/usr/bin/env python3
"""ml/train_sla_risk.py: Train Landmark SLA Breach Risk Predictor and export to ONNX."""
import hashlib, json, pathlib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
try:
    from sklearn.frozen import FrozenEstimator
    HAS_FROZEN = True
except ImportError:
    HAS_FROZEN = False
from sklearn.metrics import average_precision_score, roc_auc_score, brier_score_loss
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType

FEATURE_COLS = [
    "priority_ord", "service_tier_ord", "category_id_ord",
    "assignee_load_ratio", "assignee_median_ttr_min",
    "reassign_count", "reopen_count", "pending_user_minutes",
    "elapsed_ratio", "child_count", "hour_of_day",
    "day_of_week", "is_business_hours", "linked_to_master"
]

def train_and_export(csv_path: pathlib.Path, out_onnx: pathlib.Path, out_metrics: pathlib.Path):
    raw_bytes = csv_path.read_bytes()
    dataset_sha256 = hashlib.sha256(raw_bytes).hexdigest()
    df = pd.read_csv(csv_path).sort_values("landmark_ts")
    n = len(df)
    train_df, val_df, test_df = df.iloc[:int(0.67*n)], df.iloc[int(0.67*n):int(0.83*n)], df.iloc[int(0.83*n):]

    X_train, y_train = train_df[FEATURE_COLS].to_numpy(np.float32), train_df["breached"].to_numpy(np.int32)
    X_val,   y_val   = val_df[FEATURE_COLS].to_numpy(np.float32),   val_df["breached"].to_numpy(np.int32)
    X_test,  y_test  = test_df[FEATURE_COLS].to_numpy(np.float32),  test_df["breached"].to_numpy(np.int32)

    base_clf = HistGradientBoostingClassifier(max_iter=200, learning_rate=0.05, max_leaf_nodes=31, random_state=42)
    base_clf.fit(X_train, y_train)
    if HAS_FROZEN:
        calibrated = CalibratedClassifierCV(FrozenEstimator(base_clf), method="isotonic")
    else:
        calibrated = CalibratedClassifierCV(base_clf, method="isotonic", cv="prefit")
    calibrated.fit(X_val, y_val)

    probs_test = calibrated.predict_proba(X_test)[:, 1]
    baseline_score = test_df["elapsed_ratio"].to_numpy(np.float32)

    metrics = {
        "dataset_sha256": dataset_sha256,
        "test_rows": int(len(test_df)),
        "baseline_pr_auc": round(float(average_precision_score(y_test, baseline_score)), 4),
        "model_pr_auc": round(float(average_precision_score(y_test, probs_test)), 4),
        "model_roc_auc": round(float(roc_auc_score(y_test, probs_test)), 4),
        "model_brier": round(float(brier_score_loss(y_test, probs_test)), 4),
    }
    out_metrics.parent.mkdir(parents=True, exist_ok=True)
    out_metrics.write_text(json.dumps(metrics, indent=2))

    initial_type = [("float_input", FloatTensorType([None, len(FEATURE_COLS)]))]
    onx = to_onnx(
        calibrated,
        initial_types=initial_type,
        target_opset=17,
        options={id(calibrated): {"zipmap": False}}
    )
    out_onnx.parent.mkdir(parents=True, exist_ok=True)
    out_onnx.write_bytes(onx.SerializeToString())
