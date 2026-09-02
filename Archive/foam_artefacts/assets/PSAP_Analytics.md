# PSAP Analytics 

## Infrastructure

I think that this should all be built in a Docker container or something similar that can be deployed as an all-in-one solution.

Right now, I recommend a Python environment. My default is 3.13 at this point. Python has been chosen over R because I expect that more potential users will have expereince with Python over R or Julia. This choice also will encourage customization by customers to ensure this is what they need.

Building the Python environment, I use uv because it really has simplified the process to the point that it is almost trivial.

```bash
cd ~/projects

uv init project_name

cd project_name

uv venv

source .venv/bin/activate
```

Violá, you're done. Now everything is set up.

This leaves you a file structure that should be updated to look like this:

```
.
├── .venv/
|-- data/
|   |-- raw/
|   |-- clean/
|   |-- output_files/
├── docs/
│   ├── setup.md
│   ├── usage.md
│   └── README.md
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
│   └── test_main.py
├── .gitignore
|__ pyproejct.toml
|-- uv.lock
└── LICENSE
```

After that is created, then I suggest adding in the libraries. Thankfully, that is relatively easy.

```bash
uv add pandas polars numpy scipy scikit-learn arrow seaborn matplotlib statsmodels plotly duckdb timecopilot ruff ty pyodbc mssql-python boltons jupyter marimo streamlit

uv lock
```

My choices can be explained below:

- **pandas**: This is the normal standard for creating dataframes. For this work, the standard *should* be enough. If you have a larger PSAP, like LA or NYC, then polars could be a better choice.
- **polars**: This is mainly for *much greater* data volume. *Most* PSAPS will never need this, but for a mega-centre, this could be handy to prevent slow down when crunching data.
- **numpy**: This is the defacto standard for mathematical operations for Python. If you extend my work, you're going to need it.
- **scipy**: This extends numpy with additional statistical and advanced mathematical functions. It is helpful for advanced statistical properties.
- **scikit-learn**: This library works for regression and other advanced modeling options. It's easier to work with than TensorFlow or PyTorch, so it's a quicker go to library.
- **arrow**: Like lubridate for R, this can work with date & times. It can do that work in real language or in mathematical terms.
- **matplotlib**: This is the go to standard for python graphics.
- **seaborn**: This sits on top of and enhances matplotlib.
- **plotly**: I like this one better because it emphasizes the use of the Grammar of Graphics theory. This allows you to build more detailed graphics using a clear and consistent vocabulary. 
- **statsmodels**: This library gives additional statistical models for use in analyses.
- **duckdb**: I use this to process csv files or dataframes and use a SQL dialect to ask questions about the data. This can also grab data from other sources and make dataframes from those.
- **timecopilot**: This is a zero-shot time forecasting library. For this project, this is going to be used to create some basic forecasts that can be embeded in reports.
- **ruff**: This is a Python linter that was developed by the same people that created uv. Linting files is a good way to ensure that your code is well-written and more safe/secure.
- **ty**: This library will help ensure type safety in the data. This will prevent issues by conversion with types.
- **pyodbc**: This is library that can be used to draw data directly from a database and prepare it for use, programatically, in Python.
- **mssql-python**: This is a library and driver to access Microsoft SQL Server databases from Python.
- **boltons**: This library has a lot of functions that are not in basic Python, but should have been.
- **jupyter**: This is the standard notebook library for Python and very useful, especially Jupyter Lab for creating reproducible workflows. Notebooks are also good for experimentation.
- **marimo**: This is a different notebook system. It promises to be more responsive and require less rerunning cells when values changed.
- **streamlit**: This is a standard for building dashboards and interactive visualizations.
  
*I am interested seeing what [grplot](https://grplot.readthedocs.io/en/latest/) may do in this situation. The examples look fascinating.

### Ingestion and Cleaning

There should be at least two datasets for any week. The first will come from the CAD and will be used to evaluate service call generation and how well the PSAP operates. The second will come from the phone handling system and will be used for volume forecasting and for standards complience with [NENA STA-020](https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/nena-sta-020.1-2020_911_call.pdf).

SQLAlchemy may be invoked to attach to a database instance and execute a pre-defined query such as [[assets/eda_project/week_report_raw.sql]] to get the raw data. It should then deposit that csv file in the raw folder for the ingestion and cleaning process to begin.

After the cleaning steps outlined here, the analytical datasets should be moved to the clean folder. Any other output such as outliers or other call lists can be output to the output_files folder for follow up.

```python
df_raw = pd_read_csv(./data/raw/week08_raw.csv)
df_raw.head(10)
df_raw.tail(10)
# Get basic info
# Get dataset shape
print("Dataset shape:", df_raw.shape, "\n")

# Display column names
print("Column names:", df_raw.columns.tolist(), "\n")

```

This code will give us the general size and shape of the data prior to the cleaning process.

#### Cleaning

The first cleaning step would be to go through the file to find the number of missing rows. The code below is an example of how to accomplish that.

```python
# Count the number of missing values in each column
missing_values_count = df_raw.isnull().sum()

# Print the result
print(missing_values_count)
```

Depending on where the missing data is located, we will need to adress it in some fashion. Because this is CAD data and reflects actual service calls, it is a bigger challenge to remove rows from the dataset. So different amelioration techniques must be investgated and applied. One option, for numeric variables, is to ignore the missing numeric values when calculating statistical metrics. For factors/strings, the missing values can be quantified as a percentage of overall values and reported as such.

After addressing missing data, determining the number of data points that are outliers is another important step.
