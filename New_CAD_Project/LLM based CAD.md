
My thought is to create a new CAD in Rust using PostgreSQL in the background. That way the JSON data structure for EIDOs can be preserved and leveraged. According to LLM resources, read I need to verify the results, I can do this the way that I want which is nice to note.

I am thinking about [Rust](https://rust-lang.org/) as the main programming language. I'm looking at [PostgreSQL](https://www.postgresql.org/) as the database with this [Awesome PostgreSQL](https://github.com/dhamaniasad/awesome-postgres) list to ensure that I get it right. I want to use the [[NENA-STA-021.1.1 EIDO JSON_AllCRBallot.pdf]] standard to build the data processing because I can use JSON and tabular data side to side. The data movement mechanisms will come from [[NENA-STA-024.1.1-2025_EIDO_C.pdf]] because that is also a good working standard. 

Karl is suggesting [timescaledb](https://github.com/timescale/timescaledb) but I'm not convinced that this is the right approach. I don't disagree that a data lakehouse would be a good solution, but a time series oriented db is not always the right answer.

