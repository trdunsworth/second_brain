# Python EDA Basics

## Overview
This notebook provides a basic foundation in Exploratory Data Analysis (EDA) and other quick functions in Python so you don''t have to re-create the wheel in each assignment. You can just copy and paste what you need.

## Library Installation and Imports
First, let''s install the necessary packages and import them:

# Uncomment to install packages if needed
# !pip install pandas numpy matplotlib seaborn scipy scikit-learn statsmodels plotly missingno joypy

# Core libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import statsmodels.api as sm
from statsmodels.graphics.gofplots import qqplot
import scipy.stats as stats
import missingno as msno
from sklearn.model_selection import train_test_split
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats
import warnings
import joypy  # For ridgeline plots

# Set plot style and size
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)
warnings.filterwarnings('ignore')

## Creating the Dataset
# Replace with your own file path
# df = pd.read_csv("/path/to/your/file.csv")

# For demonstration, let's create a sample dataset
# In real use, you would replace this with your actual data loading code
np.random.seed(42)
n = 1000
date_range = pd.date_range(start='2022-01-01', periods=n, freq='30min')
data = {
    'Response_Date': date_range,
    'TimeToQueue': np.random.exponential(scale=5, size=n),
    'TimeToDispatch': np.random.exponential(scale=8, size=n),
    'CallProcessTime': np.random.exponential(scale=10, size=n),
    'PhoneTime': np.random.exponential(scale=12, size=n),
    'TurnoutTime': np.random.exponential(scale=7, size=n),
    'TransitTime': np.random.exponential(scale=15, size=n),
    'TimeAtScene': np.random.exponential(scale=30, size=n),
    'EventTime': np.random.exponential(scale=45, size=n),
    'Year': np.random.choice([2021, 2022], size=n),
    'WeekNo': np.random.randint(1, 53, size=n),
    'Day': np.random.randint(1, 32, size=n),
    'Hour': np.random.randint(0, 24, size=n),
    'Priority_Number': np.random.randint(1, 6, size=n),
    'DOW': np.random.choice(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], size=n),
    'Shift': np.random.choice(['Morning', 'Evening', 'Night'], size=n)
}

df = pd.DataFrame(data)

# Make a small percentage of values negative to mimic the original dataset
for col in ['TimeToQueue', 'TimeToDispatch', 'CallProcessTime', 'PhoneTime', 'TurnoutTime', 'TransitTime', 'TimeAtScene', 'EventTime']:
    mask = np.random.choice([True, False], size=n, p=[0.01, 0.99])
    df.loc[mask, col] = -df.loc[mask, col]

# Add some NaN values
df.loc[np.random.choice(n, 2), 'TimeToQueue'] = np.nan

## Data Cleaning and Exploration

# Show basic info about the dataframe
print(f"Number of rows: {len(df)}")
df.head(10)

# Column names and data types
print("\nColumn names:")
print(df.columns.tolist())
print("\nData types:")
df.dtypes

# Convert categorical variables to category dtype (similar to factor in R)
categorical_vars = ['Year', 'WeekNo', 'Day', 'Hour', 'Priority_Number', 'DOW', 'Shift']
for var in categorical_vars:
    df[var] = df[var].astype('category')

# Ensure DOW is ordered properly (equivalent to factor with levels in R)
dow_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
df['DOW'] = pd.Categorical(df['DOW'], categories=dow_order, ordered=True)

# Visualize missing values
msno.matrix(df)
plt.title('Missing Values Visualization')
plt.show()

# Check for missing values
print("\nMissing values per column:")
print(df.isna().sum())

# Remove rows with missing values
df = df.dropna()
print(f"\nRows after removing NaNs: {len(df)}")

# Remove negative values in time variables
time_columns = ['TimeToQueue', 'TimeToDispatch', 'CallProcessTime', 'PhoneTime', 
                'TurnoutTime', 'TransitTime', 'TimeAtScene', 'EventTime']

for col in time_columns:
    df = df[df[col] >= 0]

print(f"Rows after removing negative time values: {len(df)}")

## Creating Test and Training Sets

# Use 80% of data set as training set and 20% as test set
np.random.seed(42)
train, test = train_test_split(df, test_size=0.2)

print(f"Training set size: {len(train)}")
print(f"Test set size: {len(test)}")

## Summary Statistics

# Summary for all numeric variables
print("\nSummary statistics for all numeric variables:")
df.describe()

# Summary for time variables only
time_vars = ['TimeToQueue', 'TimeToDispatch', 'CallProcessTime', 'PhoneTime', 
             'TurnoutTime', 'TransitTime', 'TimeAtScene', 'EventTime']
print("\nSummary statistics for time variables:")
df[time_vars].describe()

# Custom summary function (similar to the R dplyr::summarize)
def custom_summary(data, column):
    return pd.DataFrame({
        'count': len(data),
        'min': data[column].min(),
        'sd_low': data[column].quantile(0.05),
        'q1': data[column].quantile(0.25),
        'median': data[column].median(),
        'mean': data[column].mean(),
        'q3': data[column].quantile(0.75),
        'sd_hi': data[column].quantile(0.95),
        'max': data[column].max(),
        'std_dev': data[column].std(),
        'mad': stats.median_abs_deviation(data[column])
    }, index=[0])

# Summary for TimeToQueue
summary1 = custom_summary(df, 'TimeToQueue')
print("\nCustom summary for TimeToQueue:")
summary1

# Group by DOW and summarize
summary2 = df.groupby('DOW').apply(lambda x: custom_summary(x, 'TimeToQueue')).reset_index(level=1, drop=True)
print("\nTimeToQueue summary by day of week:")
summary2

# Contingency table (similar to tabyl in R)
count1 = pd.crosstab(df['DOW'], df['Shift'])
print("\nContingency table of DOW vs Shift:")
count1

## Graphics

# Bar plot
plt.figure(figsize=(12, 6))
dow_counts = df['DOW'].value_counts().sort_index()
plt.bar(dow_counts.index, dow_counts.values, color=sns.color_palette("viridis", 7))
plt.title('Count of calls per day of the week')
plt.ylabel('Count')
plt.show()

# Using Seaborn (more similar to ggplot2)
plt.figure(figsize=(12, 6))
sns.countplot(data=df, x='DOW', palette='Dark2')
plt.title('Count of calls per day of the week')
plt.ylabel('Count')
plt.show()

# Density Plot
plt.figure(figsize=(12, 6))
sns.kdeplot(data=df, x='TimeToQueue', fill=True, color='#1c5789', alpha=0.8)
plt.title('Density Plot of Calltaker Setup Time')
plt.show()

# Histogram
plt.figure(figsize=(12, 6))
plt.hist(df['TimeToQueue'], bins=30, density=True, alpha=0.7, color='white', edgecolor='black')
sns.kdeplot(data=df, x='TimeToQueue', color='blue', lw=2)
plt.title('Histogram with Density of TimeToQueue')
plt.show()

# QQ Plot
plt.figure(figsize=(12, 6))
fig = sm.qqplot(df['TimeToQueue'], line='s')
plt.title('QQ Plot of TimeToQueue')
plt.show()

# Box and Whisker Plot
plt.figure(figsize=(12, 6))
sns.boxplot(x='DOW', y='TimeToQueue', data=df, palette='viridis')
plt.title('Boxplot of TimeToQueue by Day')
plt.show()

# Ridgeline Plot (Joy Plot) showing call count by Hour and DOW
# Method 1: Using joypy package
plt.figure(figsize=(14, 10))
# Convert Hour to numeric for plotting (if it's categorical)
df['Hour_num'] = df['Hour'].astype(int)
# Create the ridgeline plot
fig, axes = joypy.joyplot(
    data=df,
    by='DOW',
    column='Hour_num',
    ylim='own',
    figsize=(14, 10),
    hist=True,
    bins=24,
    overlap=0.4,
    background='w',
    grid=True,
    range_style='own',
    x_range=[0, 23],
    title='Call Distribution by Hour Across Days of Week',
    colormap=plt.cm.viridis
)
plt.show()

# Method 2: Using seaborn's FacetGrid for a similar effect
# Create a figure for each day of the week
plt.figure(figsize=(14, 12))
g = sns.FacetGrid(df, row='DOW', height=2, aspect=4)
g.map(sns.histplot, 'Hour_num', kde=True, bins=24)
g.set_titles('{row_name}')
g.fig.suptitle('Call Distribution by Hour Across Days of Week', fontsize=16)
plt.subplots_adjust(top=0.92, hspace=0.3)
plt.show()

# Method 3: Alternative approach using KDE plots
plt.figure(figsize=(14, 10))
# Create a separate KDE plot for each day
for i, day in enumerate(dow_order):
    day_data = df[df['DOW'] == day]
    # Plot with vertical offset for each day
    sns.kdeplot(
        data=day_data, 
        x='Hour_num',
        fill=True,
        alpha=0.6,
        linewidth=1.5,
        label=day,
        clip=(0, 23)
    )

plt.title('Call Distribution by Hour Across Days of Week')
plt.xlabel('Hour of Day')
plt.ylabel('Density')
plt.legend(title='Day of Week')
plt.xticks(range(0, 24, 2))
plt.xlim(0, 23)
plt.grid(True, alpha=0.3)
plt.show()

## Normality Tests

print("\nNormality Tests for TimeToQueue:")
# Shapiro-Wilk Test
# Note: Only works for n between 3 and 5000
shapiro_sample = df['TimeToQueue'].sample(min(5000, len(df['TimeToQueue'])))
stat, p = stats.shapiro(shapiro_sample)
print(f'Shapiro-Wilk: statistic={stat:.4f}, p-value={p:.4e}')

# Kolmogorov-Smirnov Test
stat, p = stats.kstest(df['TimeToQueue'], 'norm', args=(df['TimeToQueue'].mean(), df['TimeToQueue'].std()))
print(f'Kolmogorov-Smirnov: statistic={stat:.4f}, p-value={p:.4e}')

# D'Agostino's K^2 Test
stat, p = stats.normaltest(df['TimeToQueue'])
print(f"D'Agostino's K^2: statistic={stat:.4f}, p-value={p:.4e}")

# Anderson-Darling Test
result = stats.anderson(df['TimeToQueue'], dist='norm')
print(f'Anderson-Darling: statistic={result.statistic:.4f}')
for i in range(len(result.critical_values)):
    sl, cv = result.significance_level[i], result.critical_values[i]
    if result.statistic < cv:
        print(f'  {sl}%: {cv:.3f} - data looks normal (fail to reject H0)')
    else:
        print(f'  {sl}%: {cv:.3f} - data does not look normal (reject H0)')

## Outlier Identification

# Z-score method
z_scores = np.abs(stats.zscore(df['TimeToQueue']))
outliers_z = df[z_scores > 3]
print(f"\nNumber of outliers (Z-score method): {len(outliers_z)}")

# IQR method
Q1 = df['TimeToQueue'].quantile(0.25)
Q3 = df['TimeToQueue'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
outliers_iqr = df[(df['TimeToQueue'] < lower_bound) | (df['TimeToQueue'] > upper_bound)]
print(f"Number of outliers (IQR method): {len(outliers_iqr)}")

# Display some outliers
print("\nSample of outliers:")
if len(outliers_iqr) > 0:
    print(outliers_iqr[['TimeToQueue', 'DOW', 'Hour']].head())
else:
    print("No outliers found with IQR method")

# Visualize outliers
plt.figure(figsize=(12, 6))
sns.boxplot(x=df['TimeToQueue'])
plt.title('Boxplot Showing Outliers in TimeToQueue')
plt.show()
