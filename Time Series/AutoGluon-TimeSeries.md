---
layout: note
type: reference
status: active
created: 2026-11-12
tags:
  - time-series
  - forecasting
  - python
  - automl
  - autogluon
  - model
aliases:
  - AutoGluon Time Series
---

# AutoGluon‑TimeSeries

AutoGluon‑TimeSeries is a lightweight AutoML framework for probabilistic time‑series forecasting built on top of the `gluon-ts` ecosystem. The project, authored by Shchur et al., presents a simple one‑liner interface for training ensembles of statistical, machine‑learning, and deep‑learning models to produce point and quantile forecasts.

## Core Features

- **Ensemble of diverse model families** – combines ETS, dynamic ARIMA, LSTM, Prophet, and more.
- **Probabilistic outputs** – returns median, lower/upper quantiles, and can be configured to any distribution.
- **Three‑line training** – a `StackedEnsemble` wrapper that handles bias‑corrrection, cross‑validation, and model selection.
- **Built‑in evaluation utilities** – support experimental comparison against baselines, e.g. here is an example using `tracts` to compute SMAPE.
- **GPU‑friendly** – optional GPU support for the neural component.

## Citation

> Shchur, O. et al. *AutoGluon–TimeSeries: AutoML for Probabilistic Time Series Forecasting*. 2023. arXiv:2308.05566, https://arxiv.org/abs/2308.05566

## Quickstart (3‑line example)

```python
from autogluon.timeseries import TimeSeriesPredictor

predictor = TimeSeriesPredictor(\
    path='models/autogluon_ts', \
    prediction_length=48, \
    eval_metric='smape', \
    num_trials=20, \
    enable_quantiles=True
)

fitted = predictor.fit(train_data)

predictions = fitted.predict(f \n        .tail(48), \
                             quantiles=[0.1, 0.5, 0.9])
print(predictions.tail())
```

*Explanation* – the `predictor.fit` method automatically searches over the internal search space of candidate models, ensembles them, and trains the final model in about three lines of code, as advertised.

## Running on GPU

```python
predictor = TimeSeriesPredictor(
    path='models/gpu_ts',
    prediction_length=12,
    time_limit=2*60*60,  # 2 hours
    enable_quantiles=True,
    hyperparameters={
        'deeptsa': {'num_epochs': 50, 'epochs_per_iteration': 5}
    },
    gpu=True  # enable GPU training for deep models
)
```

## Further Resources

- Official documentation: https://auto.gluon.ai/stable/index.html
- Tutorial notebook: https://auto.gluon.ai/stable/tutorials/timeseries/index.html
- Code & issue tracker: https://github.com/autogluon/autogluon-timeseries
- AutoGluon‑TimeSeries is part of the broader AutoGluon ecosystem – see the main AutoGluon repo for related tools.

---