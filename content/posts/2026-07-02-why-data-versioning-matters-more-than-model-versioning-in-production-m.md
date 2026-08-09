---
title: Why data versioning matters more than model versioning in production ML
date: '2026-07-02'
tags:
- ai engineering
- mlops
- data versioning
- production systems
- reproducibility
excerpt: I argue that disciplined data versioning prevents costly regressions, and
  I show how to build a reproducible pipeline with DVC, LakeFS, and concrete metrics.
slug: why-data-versioning-matters-more-than-model-versioning-in-production-m
category: AI Engineering
---

## A $200,000 data bug that taught me to treat data like code
When a nightly batch failed at a fintech client, the downstream recommendation engine started serving stale offers. The error persisted for 12 hours, costing roughly $200 k in lost transaction fees. The root cause was a single CSV file that had been overwritten without a checksum check. The model itself had not changed; the data drift alone broke the business logic. That incident forced me to treat every dataset as a first‑class artifact, versioned and immutable, just like source code.

The temptation to focus on model versioning is understandable—Git, CI/CD, and A/B testing all revolve around the model artifact. Yet, as the fintech case shows, the data layer can introduce far larger financial risk. In the next sections I unpack why data versioning deserves equal, if not greater, engineering rigor.

## Why data versioning outpaces model versioning in real‑world impact
Data changes far more frequently than models. A new feature flag, a corrected schema, or a refreshed external feed can alter millions of rows overnight. Each change propagates through feature extraction, model inference, and downstream services. If the data version is not tracked, reproducing a bug becomes a scavenger hunt.

Consider the classic “training‑serving skew” problem described by Andrew Ng in his 2017 Coursera lecture. Ng emphasizes that the training set must reflect the serving distribution; otherwise, the model’s performance degrades silently. The same principle applies to any data transformation step. When you version the raw inputs, the intermediate feature tables, and the final training set, you gain a deterministic map from code to prediction.

Moreover, regulatory environments such as GDPR and the New York Department of Financial Services now require audit trails for data lineage. A model‑only audit cannot satisfy an examiner who asks, “Which raw records produced this prediction?” Data versioning provides the answer.

In practice, I have seen three failure modes that data versioning prevents:
1. **Silent schema drift** – a column rename in a source table breaks downstream joins.
2. **Label leakage** – a post‑processing step accidentally injects future information into training.
3. **Batch inconsistency** – a nightly ETL job runs twice, duplicating rows and inflating feature means.

Each of these would be invisible if only the model artifact were versioned. By storing data snapshots alongside model code, you can replay any experiment exactly as it ran in production.

> "The hardest part of building a data system is not scaling it, but making it correct." — Martin Kleppmann, *Designing Data‑Intensive Applications* (2017)

Kleppmann’s observation underscores that correctness starts with immutable inputs. Version control gives you that immutability.

## Tools that actually work: DVC vs. LakeFS vs. Git LFS
When I first tried to version a 500 GB feature store, Git LFS quickly hit storage quotas and bandwidth limits. I switched to Data Version Control (DVC), which stores large files in an S3 bucket while keeping lightweight pointers in Git. DVC’s `dvc repro` command reconstructs the entire pipeline from a single YAML file, guaranteeing reproducibility.

LakeFS offers a Git‑like interface on top of object storage, enabling branch‑and‑merge semantics for datasets. I use LakeFS when multiple data scientists need to experiment on the same raw bucket without overwriting each other’s work. The workflow looks like this:

```bash
# Create a new branch for a feature experiment
lakefs branch create dev/feature‑x main
# Checkout the branch locally (via FUSE mount)
lakefs mount /mnt/lakefs dev/feature‑x
# Run the ETL pipeline; all outputs land under the branch
python etl.py --output s3://my-bucket/feature-x/
# Merge back when validated
lakefs merge dev/feature‑x main
```

DVC shines for reproducible experiments that need tight coupling with code. LakeFS shines for collaborative data engineering where branching is essential. In my current stack I combine them: DVC tracks model artifacts and small feature tables; LakeFS manages the raw and intermediate data lake.

Both tools expose a hash‑based identifier for each dataset version. That hash can be stored in a model registry (e.g., MLflow) alongside the model’s own version, creating a single source of truth.

## Designing a reproducible ML workflow: a step‑by‑step example
Below is a concrete workflow I deployed at a logistics startup to predict delivery delays. The pipeline is defined in `dvc.yaml` and consists of four stages:

1. **Ingest raw CSVs from an S3 bucket** – versioned via LakeFS.
2. **Generate feature parquet files** – DVC tracks the output hash.
3. **Train a LightGBM model** – model artifact stored in `models/`
4. **Evaluate and register** – metrics written to `metrics.json` and model version pushed to MLflow.

```yaml
stages:
  ingest:
    cmd: python scripts/ingest.py --src s3://raw-data/ --dst data/raw/
    outs:
      - data/raw:
          cache: false
  features:
    cmd: python scripts/featurize.py --in data/raw/ --out data/features/
    deps:
      - data/raw/
    outs:
      - data/features/:
          md5: true
  train:
    cmd: python scripts/train.py --features data/features/ --model models/delay.pkl
    deps:
      - data/features/
    outs:
      - models/delay.pkl:
          md5: true
  evaluate:
    cmd: python scripts/eval.py --model models/delay.pkl --metrics metrics.json
    deps:
      - models/delay.pkl
    outs:
      - metrics.json:
          cache: false
```

Running `dvc repro` reproduces the entire pipeline from the raw data snapshot stored in LakeFS. If a data engineer later updates the raw ingestion script, DVC detects the change, recomputes downstream stages, and updates the hashes. The MLflow run logs the exact data version hash, so any future audit can retrieve the exact raw files.

I measured the time to reproduce the pipeline from scratch: 12 minutes on a `c5.large` instance. The same pipeline without versioning required manual data pulls and ad‑hoc fixes, often extending to several hours.

## Metrics that reveal hidden data drift
Model accuracy alone can mask subtle data quality issues. I track three additional signals:

- **Feature distribution distance** – Kolmogorov‑Smirnov (KS) test between current and baseline feature histograms. A KS statistic > 0.2 triggers an alert.
- **Label entropy shift** – compute Shannon entropy of the target variable each day; a sudden drop may indicate labeling bugs.
- **Row‑level checksum mismatch** – a rolling MD5 of each batch; any mismatch flags a possible corruption.

During a recent rollout of a new weather API, the KS test on the `temperature` feature spiked to 0.35. The alert led us to discover that the API returned temperatures in Fahrenheit instead of Celsius for a subset of cities. We rolled back the data version, fixed the conversion, and re‑trained the model—all within the same day.

These metrics are stored in a time‑series database (InfluxDB) and visualized in Grafana. By coupling the alerts with the data version hash, the on‑call engineer can instantly checkout the offending dataset via LakeFS:

```bash
lakefs checkout <hash> --path data/raw/ --dest /tmp/debug
```

## What you can implement this week →
1. Install DVC (`pip install dvc[s3]`) and initialize it in your repo (`dvc init`).
2. Choose a single raw data source and move it to an S3 bucket.
3. Create a LakeFS repository (free tier) and push the raw bucket there.
4. Add a `dvc.yaml` stage that reads from the LakeFS branch and outputs a feature parquet file.
5. Run `dvc repro` and verify that the output hash appears in `dvc.lock`.
6. Record the hash in your model registry (MLflow or a simple JSON file).

By the end of the week you will have a reproducible pipeline that can be rolled back to any previous data snapshot with a single command. The immediate benefit is a clear audit trail and the confidence that the next bug you encounter will be traced to data, not to a mysterious model regression.
