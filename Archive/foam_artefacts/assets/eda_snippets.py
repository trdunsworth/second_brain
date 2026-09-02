import pandas as pd
import numpy as np
import scipy as sp
import plotly as ply
import seaborn as sns
import duckdb as db
import matplotlib.pyplot as plt
import sklearn as sk

# Will also need to use either marimo or jupyter for notebooks, uv, ruff ,and ty in the background for type safety, proper linting, and environment management Also add timecopilot for forecasting (Keep Nixtla free tools handy as well) Tensor flow in the background for other high intensity work. 

# Import the dataset:
df = pd.read_csv("new_csv_file.csv")
df.head()
df.tail()

# Get basic info
# Get dataset shape
print("Dataset shape:", df.shape, "\n")

# Display column names
print("Column names:", df.columns.tolist(), "\n")

# Check data types and missing values
print("Dataset info:")
df.info()

# Count unique values in a column
print(df['column'].value_counts())

# Display data types of columns
print(df.dtypes)

# Convert data types
df['numeric_column'] = pd.to_numeric(df['numeric_column'])

# First summary statistics
print("Summary statistics:")
print(df.describe().to_string(), "\n")

for col_name in ['Grade','StudyHours']:
    col = df_students[col_name]
    rng = col.max() - col.min()
    var = col.var()
    std = col.std()
    print('\n{}:\n - Range: {:.2f}\n - Variance: {:.2f}\n - Std.Dev: {:.2f}'.format(col_name, rng, var, std))

import scipy.stats as stats

# Get the Grade column
col = df_students['Grade']

# get the density
density = stats.gaussian_kde(col)

# Plot the density
col.plot.density()

# Get the mean and standard deviation
s = col.std()
m = col.mean()

# Annotate 1 stdev
x1 = [m-s, m+s]
y1 = density(x1)
plt.plot(x1,y1, color='magenta')
plt.annotate('1 std (68.26%)', (x1[1],y1[1]))

# Annotate 2 stdevs
x2 = [m-(s*2), m+(s*2)]
y2 = density(x2)
plt.plot(x2,y2, color='green')
plt.annotate('2 std (95.45%)', (x2[1],y2[1]))

# Annotate 3 stdevs
x3 = [m-(s*3), m+(s*3)]
y3 = density(x3)
plt.plot(x3,y3, color='orange')
plt.annotate('3 std (99.73%)', (x3[1],y3[1]))

# Show the location of the mean
plt.axvline(col.mean(), color='cyan', linestyle='dashed', linewidth=1)

plt.axis('off')

plt.show()

# Threshold passing
passes = pd.Series(df_students['Grade'] >= 60)
df_students = pd.concat([df_students, passes.rename('Pass')], axis=1)

# Counts and group means
df_students.groupby('Pass').Name.count()
df_students.groupby('Pass')[['StudyHours','Grade']].mean()

# Now use that in a plot....
# Create a bar plot of name vs grade
plt.bar(x=df_students.Name, height=df_students.Grade, color='orange')

# Create a figure for 2 subplots (1 row, 2 columns)
fig, ax = plt.subplots(1, 2, figsize = (12,5))

# Create a bar plot of name vs grade on the first axis
ax[0].bar(x=df_students.Name, height=df_students.Grade, color='orange')
ax[0].set_title('Grades')
ax[0].set_xticklabels(df_students.Name, rotation=90)

# Create a pie chart of pass counts on the second axis
pass_counts = df_students['Pass'].value_counts()
ax[1].pie(pass_counts, labels=pass_counts)
ax[1].set_title('Passing Grades')
ax[1].legend(pass_counts.keys().tolist())

# Add a title to the Figure
fig.suptitle('Student Data')

# Show the figure
fig.show()

# Plot two variable side to side
df_students.plot(x='Name', y=['Grade','StudyHours'], kind='bar', figsize=(8,5))

# Now Min/Max scale
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
df_norm = df_students[['Name','Grade','StudyHours']].copy()
df_norm[['Grade','StudyHours']] = scaler.fit_transform(df_norm[['Grade','StudyHours']])
df_norm.plot(x='Name', y=['Grade','StudyHours'], kind='bar', figsize=(8,5))

# TODO: Create a custom summary description including skewness, kurtosis, and variance.

# This is a quick example of building this out quickly. Should do this in seaborn or plotly
df.hist(figsize=(12, 8), bins=50, edgecolor="black")  
plt.suptitle("Distribution of Numeric Features", fontsize=14)  
plt.show()

# Scatterplot with pyplot and seaborn
plt.figure(figsize=(8, 5))  
sns.scatterplot(x=df["para2"], y=df["price"], alpha=0.5)  
plt.title("Relationship Between para2 and Price")  
plt.xlabel("para2")  
plt.ylabel("Price")  
plt.show()

# Box plot for outliers.... Yeah right!
plt.figure(figsize=(8, 5))  
sns.boxplot(y=df["price"])  
plt.title("Boxplot of Price: Detecting Outliers")  
plt.show()

# Compute correlation matrix
correlation_matrix = df.corr()

# Visualize correlation matrix
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm')
plt.show()

# Outlier Detection
z_scores = stats.zscore(df['numeric_column'])
outliers = df[(z_scores > 3) | (z_scores < -3)]

# Count missing values
print("Missing values per column:")
print(df.isnull().sum(), "\n")

# Amerlioration
# Drops
df_cleaned = df.dropna()
print("Missing values after dropping:", df_cleaned.isnull().sum().sum())

# Median fill in
df_filled = df.fillna(df.median())
print("Missing values after filling:", df_filled.isnull().sum().sum())

# Convert Categorical to Numeric
days_of_week = {'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7}
df["dow"] = df["dow"].map(days_of_week)

print("Updated 'dow' column:")
print(df["dow"].head())

# Skrub options:
# Basic reporting
from skrub import TableReport
TableReport(df)

# ydata-profiling EDA options
# import ydata profiling
from ydata_profiling import ProfileReport

# create report
profile = ProfileReport(df)

# save report as html
profile.to_file("report.html")

# display report in notebook
from IPython.display import IFrame
IFrame(src='test.html', width='100%', height='1000')

# Correlation Analyses
# Compute correlation matrix
correlation_matrix = df.corr()

# Visualize correlation matrix
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm')
plt.show()
