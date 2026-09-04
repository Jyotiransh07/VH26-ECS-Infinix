import os
from leakguard.analysis.analyzer import Analyzer
from leakguard.models.resource import Confidence

def run_benchmark():
    analyzer = Analyzer("leakguard/rules/resources.yaml")
    
    leaks_dir = "tests/fixtures/leaks"
    safe_dir = "tests/fixtures/safe"
    
    tp = 0
    fn = 0
    fp = 0
    tn = 0
    
    # Analyze leaking files
    for file in os.listdir(leaks_dir):
        if not file.endswith('.py'): continue
        path = os.path.join(leaks_dir, file)
        findings = analyzer.analyze_file(path)
        is_leak = any(f.confidence != Confidence.SAFE for f in findings)
        if is_leak:
            tp += 1
        else:
            fn += 1
            
    # Analyze safe files
    for file in os.listdir(safe_dir):
        if not file.endswith('.py'): continue
        path = os.path.join(safe_dir, file)
        findings = analyzer.analyze_file(path)
        is_leak = any(f.confidence != Confidence.SAFE for f in findings)
        if is_leak:
            fp += 1
        else:
            tn += 1
            
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    report = f"""# Benchmark Results

This document contains the automatically generated benchmark results for LeakGuard based on the test fixtures.

## Metrics
- **True Positives (TP)**: {tp} (Leaking files correctly identified)
- **False Negatives (FN)**: {fn} (Leaking files missed)
- **True Negatives (TN)**: {tn} (Safe files correctly identified)
- **False Positives (FP)**: {fp} (Safe files incorrectly flagged)

## Accuracy
- **Precision**: {precision:.2f}
- **Recall**: {recall:.2f}
- **F1 Score**: {f1:.2f}
"""
    os.makedirs("docs", exist_ok=True)
    with open("docs/benchmark.md", "w") as f:
        f.write(report)
        
    print("Benchmark results generated in docs/benchmark.md")
    
if __name__ == "__main__":
    run_benchmark()
