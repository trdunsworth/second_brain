
## Book Shelf

```dataview
TABLE author, rating, date_read
FROM "Books"
WHERE type = "book-review"
SORT rating DESC
```

## Research Log

```dataview
TABLE source, method, status
FROM "Research"
WHERE type = "research-note"
SORT date DESC
```

