# DMA Data Project

## Project Outline

This project is designed to make PSAP analytics easier and more efficient by simplifying the tools needed to make this happen. I think that this needs to be containerized in a Docker container and backboned by Postgres and [DuckDB](https://duckdb.org/) so folks who know a bit of SQL can leverage the basics to start their data. This could also be a ["Data Center in a box"](http://duckdb.org/2022/10/12/modern-data-stack-in-a-box). There are many [resources](https://github.com/davidgasquez/awesome-duckdb) that could extend it. Here are other [projects](https://github.com/topics/duckdb) that make use of it.

The goal is to  be able to have something that can work with Python, SQL, R, or whatever language the user wishes to apply. The reason for SQL is the simplest, it might be the easiest one for entry and is certainly the easiest one that a PSAP can find someone capable of using SQL.

I believe that this can work well for PSAPs in general and should make things much easier to build an analytics framework. I found an interesting use of duckdb on LinkedIn, [SheetQL](https://github.com/uzairmukadam/SheetQL). This has expanded duckdb a little to allow for building a list of queries and then repetitively running them or rerunning them as needed.

I've been talking to the creator and he's interested in my use case.
