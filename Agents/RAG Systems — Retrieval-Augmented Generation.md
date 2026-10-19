---
type: reference
status: active
topic: "Retrieval-Augmented Generation (RAG) — architecture, chunking, embeddings, vector stores, retrieval patterns, evaluation, and Python/R implementation."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - rag
  - python
  - r
  - reference
---

# RAG Systems — Retrieval-Augmented Generation

A comprehensive guide to building RAG systems: architecture, chunking strategies, embeddings, vector stores, retrieval patterns, evaluation, and implementation in Python and R.

---

## Table of Contents

1. [What is RAG?](#what-is-rag)
2. [RAG Architecture](#rag-architecture)
3. [Ingestion Pipeline](#ingestion-pipeline)
4. [Chunking Strategies](#chunking-strategies)
5. [Embeddings](#embeddings)
6. [Vector Stores](#vector-stores)
7. [Retrieval Patterns](#retrieval-patterns)
8. [Advanced RAG Techniques](#advanced-rag-techniques)
9. [RAG with Agents](#rag-with-agents)
10. [Evaluation](#evaluation)
11. [Implementation in Python](#implementation-in-python)
12. [Implementation in R](#implementation-in-r)
13. [Common Failure Modes](#common-failure-modes)
14. [Sources](#sources)

---

## What is RAG?

Retrieval-Augmented Generation (RAG) is a technique that enhances LLM responses by retrieving relevant information from an external knowledge base and injecting it into the prompt. The foundational paper is [Lewis et al., 2020](https://arxiv.org/abs/2005.11401).

### Why RAG?

| Problem | How RAG Solves It |
|---------|-------------------|
| Hallucinations | Grounds responses in retrieved facts |
| Knowledge cutoff | Access to up-to-date information |
| Domain expertise | Inject specialized knowledge without fine-tuning |
| Citation | Can attribute sources to claims |
| Cost | Cheaper than fine-tuning for knowledge updates |

### When to Use RAG vs. Alternatives

| Approach | Best For | When NOT to Use |
|----------|----------|-----------------|
| **RAG** | Large, changing knowledge bases | Small static knowledge (use prompt) |
| **Fine-tuning** | Style/behavior adaptation | Factual knowledge (use RAG) |
| **Long context** | Small docs, high accuracy | Large corpora, cost-sensitive |
| **Agents** | Multi-step reasoning | Simple lookup (use RAG) |

---

## RAG Architecture

### Basic RAG Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        Ingestion (offline)                       │
│                                                                  │
│  Documents → Parse → Chunk → Embed → Store in Vector DB         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Retrieval (online)                        │
│                                                                  │
│  User Query → Embed → Retrieve Top-K Chunks → Inject → Generate  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step

1. **User asks a question**
2. **Query embedding** — convert the question to a vector
3. **Similarity search** — find the K most similar chunks in the vector store
4. **Context construction** — assemble retrieved chunks into a prompt
5. **Generation** — LLM generates an answer using the retrieved context

### Minimal RAG in Python

```python
from openai import OpenAI
import chromadb

# Setup
client = OpenAI()
chroma = chromadb.Client()
collection = chroma.get_or_create_collection("docs")

def ask(question: str) -> str:
    # 1. Retrieve
    results = collection.query(query_texts=[question], n_results=5)
    context = "\n\n".join(results["documents"][0])
    
    # 2. Generate
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Answer using only the provided context. If the answer isn't in the context, say 'I don't know.'"},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
    )
    return response.choices[0].message.content
```

---

## Ingestion Pipeline

The ingestion pipeline processes raw documents into searchable chunks.

### Document Loading

```python
# PDF
from langchain_community.document_loaders import PyPDFLoader
loader = PyPDFLoader("document.pdf")
pages = loader.load()

# Markdown
from langchain_community.document_loaders import MarkdownLoader
loader = MarkdownLoader("notes.md")
docs = loader.load()

# Web
from langchain_community.document_loaders import WebBaseLoader
loader = WebBaseLoader("https://example.com")
docs = loader.load()

# Database
import duckdb
con = duckdb.connect("analytics.db")
df = con.execute("SELECT * FROM documents").fetchdf()
# Convert DataFrame rows to documents
```

### LlamaIndex Ingestion Pipeline

```python
from llama_index.core import Document
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
import qdrant_client

# Create pipeline
pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=50),
        OpenAIEmbedding(),
    ],
    vector_store=QdrantVectorStore(
        client=qdrant_client.QdrantClient("http://localhost:6333"),
        collection_name="my_docs",
    ),
)

# Run ingestion
documents = [Document(text="Document content here...")]
nodes = pipeline.run(documents=documents)
```

---

## Chunking Strategies

Chunking determines how documents are split. It has a major impact on retrieval quality.

### Strategies Comparison

| Strategy | Chunk Size | Overlap | Best For |
|----------|-----------|---------|----------|
| **Fixed-size** | 512 tokens | 50 | Simple, fast |
| **Sentence-based** | Variable | 1-2 sentences | Natural language |
| **Recursive** | 1000→500→250 | 50 | Documents with hierarchy |
| **Semantic** | Variable | None | Thematic coherence |
| **Document structure** | Variable | None | Structured docs (HTML, Markdown) |

### Implementation

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter

# Recursive splitter (good default)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", " ", ""],
)
chunks = splitter.split_documents(documents)

# Markdown-aware splitter
md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ],
)
md_chunks = md_splitter.split_text(markdown_text)
```

### Chunking Best Practices

1. **Preserve context** — include section headers in each chunk
2. **Overlap prevents boundary misses** — 10-20% overlap is standard
3. **Don't make chunks too small** — the LLM needs enough context
4. **Don't make chunks too large** — dilutes relevance, wastes tokens
5. **Keep metadata** — source file, page number, section title

---

## Embeddings

Embeddings convert text into dense vectors where semantic similarity is preserved.

### Popular Embedding Models

| Model | Dimensions | Provider | Best For |
|-------|-----------|----------|----------|
| `text-embedding-3-small` | 1536 | OpenAI | General purpose, cost-effective |
| `text-embedding-3-large` | 3072 | OpenAI | Higher accuracy |
| `nomic-embed-text` | 768 | Ollama (local) | Privacy, offline |
| `mxbai-embed-large` | 1024 | Ollama (local) | High quality local |
| `BAAI/bge-small-en` | 384 | HuggingFace | Lightweight |
| `sentence-transformers/all-MiniLM` | 384 | HuggingFace | Fast, good quality |

### Generating Embeddings

```python
# OpenAI
from openai import OpenAI
client = OpenAI()

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding

# Ollama (local)
import ollama
def embed_local(text: str) -> list[float]:
    response = ollama.embeddings(model="mxbai-embed-large", prompt=text)
    return response["embedding"]

# Sentence Transformers
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
embeddings = model.encode(["chunk 1", "chunk 2"])
```

### Embedding Best Practices

1. **Use the same model for ingestion and query** — different models produce incompatible vectors
2. **Normalize embeddings** — for cosine similarity
3. **Cache embeddings** — don't re-embed unchanged chunks
4. **Batch embedding calls** — much faster than one at a time
5. **Consider hybrid search** — combine vector + keyword (BM25) for best results

---

## Vector Stores

Vector stores index and search embeddings efficiently.

### Comparison

| Store | Type | Best For | URL |
|-------|------|----------|-----|
| [Chroma](https://docs.trychroma.com/docs/overview/introduction) | Embedded | Local dev, prototyping | `pip install chromadb` |
| [Qdrant](https://qdrant.tech/documentation/) | Standalone | Production, self-hosted | Docker / Cloud |
| [Pinecone](https://www.pinecone.io/learn/retrieval-augmented-generation/) | Managed | Production, serverless | Cloud only |
| [pgvector](https://github.com/pgvector/pgvector) | PostgreSQL extension | Existing PG infrastructure | `CREATE EXTENSION vector` |
| [FAISS](https://github.com/facebookresearch/faiss) | Library | In-memory, research | `pip install faiss-cpu` |
| [DuckDB](https://duckdb.org/docs/stable/extensions/vss) | Embedded | Analytics + vectors | `INSTALL vss` |

### Chroma Example

```python
import chromadb

client = chromadb.Client()
collection = client.get_or_create_collection(
    name="my_docs",
    metadata={"hnsw:space": "cosine"},
)

# Add documents
collection.add(
    ids=["doc1", "doc2"],
    documents=["First chunk of text", "Second chunk of text"],
    metadatas=[{"source": "file1.md"}, {"source": "file2.md"}],
    embeddings=[embed("First chunk of text"), embed("Second chunk of text")],
)

# Query
results = collection.query(
    query_texts=["search query"],
    n_results=5,
    where={"source": "file1.md"},  # metadata filter
)
```

### Qdrant Example

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="my_docs",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

# Insert points
client.upsert(
    collection_name="my_docs",
    points=[
        PointStruct(
            id=1,
            vector=embed("chunk text"),
            payload={"source": "file.md", "page": 1},
        ),
    ],
)

# Search
results = client.search(
    collection_name="my_docs",
    query_vector=embed("search query"),
    limit=5,
    query_filter={"must": [{"key": "source", "match": {"value": "file.md"}}]},
)
```

---

## Retrieval Patterns

### 1. Similarity Search (Basic)

Find the K most similar chunks to the query vector.

```python
results = collection.query(query_texts=[query], n_results=5)
```

### 2. Hybrid Search (Vector + Keyword)

Combine semantic similarity with keyword matching for better recall.

```python
from rank_bm25 import BM25Okapi

# Vector search
vector_results = collection.query(query_texts=[query], n_results=10)

# Keyword search
tokenized_chunks = [chunk.split() for chunk in all_chunks]
bm25 = BM25Okapi(tokenized_chunks)
keyword_scores = bm25.get_scores(query.split())

# Combine with Reciprocal Rank Fusion
def rrf_fusion(vector_results, keyword_results, k=60):
    scores = {}
    for rank, doc_id in enumerate(vector_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    for rank, doc_id in enumerate(keyword_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)
```

### 3. Maximal Marginal Relevance (MMR)

Balance relevance with diversity to avoid redundant chunks.

```python
def mmr(query_embedding, chunk_embeddings, lambda_param=0.5, top_k=5):
    """Select chunks that are relevant to the query but diverse from each other."""
    selected = []
    candidates = list(range(len(chunk_embeddings)))
    
    for _ in range(top_k):
        if not candidates:
            break
        
        # MMR score: λ * relevance - (1-λ) * max_similarity_to_selected
        mmr_scores = []
        for idx in candidates:
            relevance = cosine_similarity(query_embedding, chunk_embeddings[idx])
            if selected:
                max_sim = max(cosine_similarity(chunk_embeddings[idx], chunk_embeddings[s]) for s in selected)
            else:
                max_sim = 0
            mmr_scores.append(lambda_param * relevance - (1 - lambda_param) * max_sim)
        
        best_idx = candidates[mmr_scores.index(max(mmr_scores))]
        selected.append(best_idx)
        candidates.remove(best_idx)
    
    return selected
```

### 4. Parent-Child Retrieval

Index small chunks for precision, but return larger parent chunks for context.

```python
# Index: small chunks (128 tokens) for precise matching
# Retrieve: match on small chunk, return parent chunk (512 tokens)

def parent_child_retrieve(query, small_chunks, parent_chunks, collection):
    # Find matching small chunks
    results = collection.query(query_texts=[query], n_results=3)
    matched_small_ids = results["ids"][0]
    
    # Map to parent chunks
    parent_ids = set()
    for small_id in matched_small_ids:
        parent_id = small_chunks[small_id]["parent_id"]
        parent_ids.add(parent_id)
    
    return [parent_chunks[pid] for pid in parent_ids]
```

### 5. Metadata Filtering

Filter by document metadata before semantic search.

```python
results = collection.query(
    query_texts=[query],
    n_results=5,
    where={
        "$and": [
            {"source": {"$in": ["file1.md", "file2.md"]}},
            {"date": {"$gte": "2026-01-01"}},
        ]
    },
)
```

---

## Advanced RAG Techniques

### Query Transformation

Rewrite the user's query to improve retrieval.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Query expansion** | Generate multiple query variants | Ambiguous queries |
| **HyDE** | Generate hypothetical answer, embed that | Complex questions |
| **Step-back** | Ask a more abstract question | Specific factual queries |
| **Decomposition** | Break complex question into sub-questions | Multi-part questions |

### HyDE (Hypothetical Document Embeddings)

```python
def hyde_retrieve(query: str, collection, llm):
    """Generate a hypothetical answer, use it for retrieval."""
    # 1. Generate hypothetical answer
    hypo_prompt = f"Write a sample answer to this question: {query}"
    hypo_answer = llm.complete(hypo_prompt)
    
    # 2. Embed the hypothetical answer
    hypo_embedding = embed(hypo_answer)
    
    # 3. Retrieve using the hypothetical answer's embedding
    results = collection.query(query_embeddings=[hypo_embedding], n_results=5)
    return results
```

### Reranking

Use a cross-encoder model to re-rank retrieved chunks for better precision.

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query: str, chunks: list[str], top_k: int = 5) -> list[str]:
    pairs = [(query, chunk) for chunk in chunks]
    scores = reranker.predict(pairs)
    
    ranked = sorted(zip(chunks, scores), key=lambda x: x[1], reverse=True)
    return [chunk for chunk, _ in ranked[:top_k]]
```

### Context Window Management

When retrieved context is too large:

```python
def fit_context(chunks: list[str], max_tokens: int = 4000) -> str:
    """Select chunks that fit within the token budget."""
    total = 0
    selected = []
    for chunk in chunks:
        tokens = count_tokens(chunk)
        if total + tokens > max_tokens:
            break
        selected.append(chunk)
        total += tokens
    return "\n\n".join(selected)
```

---

## RAG with Agents

RAG and agents are complementary. Agents use tools; RAG provides knowledge.

### Patterns

| Pattern | Description |
|---------|-------------|
| **RAG as a tool** | Agent calls a `search_knowledge_base` tool |
| **RAG-enhanced system prompt** | Retrieve context before each agent turn |
| **Multi-agent RAG** | Separate agents for retrieval, synthesis, verification |
| **Corrective RAG (CRAG)** | Agent evaluates retrieval quality and re-retrieves if needed |

### RAG as a Tool

```python
@agent.tool
def search_knowledge_base(query: str) -> str:
    """Search the knowledge base for relevant information.
    
    Args:
        query: Search query (best as natural language question)
    
    Returns:
        Relevant passages from the knowledge base.
    """
    results = collection.query(query_texts=[query], n_results=5)
    return "\n\n".join(results["documents"][0])
```

### Corrective RAG (CRAG)

```python
def crag_answer(question: str, collection, llm) -> str:
    # 1. Retrieve
    results = collection.query(query_texts=[question], n_results=5)
    chunks = results["documents"][0]
    
    # 2. Evaluate relevance
    relevance_scores = []
    for chunk in chunks:
        score = llm.evaluate(f"Is this passage relevant to '{question}'? Passage: {chunk}")
        relevance_scores.append(score)
    
    # 3. If low relevance, try web search or different query
    if max(relevance_scores) < 0.5:
        # Fallback: web search or ask for clarification
        return "I couldn't find relevant information. Could you rephrase?"
    
    # 4. Generate answer with relevant chunks
    context = "\n\n".join([c for c, s in zip(chunks, relevance_scores) if s >= 0.5])
    return llm.complete(f"Answer using this context:\n{context}\n\nQuestion: {question}")
```

---

## Evaluation

RAG evaluation measures retrieval quality and generation quality separately.

### Metrics

| Component | Metric | Measures |
|-----------|--------|----------|
| **Retrieval** | Recall@K | Did relevant chunks make it into top-K? |
| **Retrieval** | Precision@K | Are top-K chunks actually relevant? |
| **Retrieval** | MRR | How high is the first relevant result? |
| **Retrieval** | NDCG | Are relevant chunks ranked well? |
| **Generation** | Faithfulness | Is the answer grounded in retrieved context? |
| **Generation** | Answer relevance | Does the answer address the question? |
| **Generation** | Hallucination rate | Does the answer contain unsupported claims? |

### RAGAS Framework

[RAGAS](https://docs.ragas.io/en/stable/concepts/metrics/) (Retrieval Augmented Generation Assessment) is the leading evaluation framework.

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Prepare evaluation data
eval_data = {
    "question": ["What is RAG?", "How does chunking work?"],
    "answer": ["RAG is...", "Chunking is..."],
    "contexts": [["context1", "context2"], ["context3", "context4"]],
    "ground_truth": ["RAG retrieves...", "Chunking splits..."],
}

dataset = Dataset.from_dict(eval_data)

# Evaluate
result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)
print(result)
```

### Building an Evaluation Dataset

```python
# Golden dataset format
eval_dataset = [
    {
        "question": "What is the capital of France?",
        "ground_truth": "Paris",
        "relevant_chunks": ["chunk_id_1"],
    },
    {
        "question": "How do I configure the API?",
        "ground_truth": "Set the API_KEY environment variable...",
        "relevant_chunks": ["chunk_id_5", "chunk_id_12"],
    },
]

# Run evaluation
def evaluate_rag(eval_dataset, rag_pipeline):
    results = []
    for item in eval_dataset:
        retrieved = rag_pipeline.retrieve(item["question"])
        answer = rag_pipeline.generate(item["question"], retrieved)
        
        results.append({
            "question": item["question"],
            "retrieved_ids": retrieved["ids"],
            "relevant_retrieved": any(id in item["relevant_chunks"] for id in retrieved["ids"]),
            "answer": answer,
        })
    
    recall = sum(r["relevant_retrieved"] for r in results) / len(results)
    print(f"Recall@K: {recall:.2%}")
    return results
```

---

## Implementation in Python

### Full RAG Pipeline with LangChain

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. Load
loader = PyPDFLoader("document.pdf")
pages = loader.load()

# 2. Split
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = splitter.split_documents(pages)

# 3. Embed & Store
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(chunks, embeddings)

# 4. Retrieve & Generate
llm = ChatOpenAI(model="gpt-4o")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
)

answer = qa_chain.invoke("What is the main topic of this document?")
print(answer["result"])
```

### Full RAG Pipeline with LlamaIndex

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI

# Configure
Settings.llm = OpenAI(model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Load and index
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What are the key findings?")
print(response)
```

---

## Implementation in R

### RAG with duckdb + ellmer

```r
library(duckdb)
library(ellmer)

# 1. Set up vector store in DuckDB
con <- dbConnect(duckdb::duckdb())
dbExecute(con, "INSTALL vss; LOAD vss;")

# 2. Create table for chunks
dbExecute(con, "
  CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER,
    text VARCHAR,
    embedding FLOAT[1536],
    source VARCHAR
  )
")

# 3. Insert chunks with embeddings
insert_chunk <- function(text, source) {
  embedding <- embed_with_ollama(text)  # Using ollama via reticulate
  dbExecute(con, sprintf(
    "INSERT INTO chunks VALUES (nextval('chunk_id'), '%s', [%s], '%s')",
    gsub("'", "''", text),
    paste(embedding, collapse = ","),
    source
  ))
}

# 4. Retrieve
search_chunks <- function(query, k = 5) {
  query_embedding <- embed_with_ollama(query)
  result <- dbExecute(con, sprintf("
    SELECT id, text, source, 
           array_cosine_similarity(embedding, [%s]) as score
    FROM chunks
    ORDER BY score DESC
    LIMIT %d
  ", paste(query_embedding, collapse = ","), k))
  result
}

# 5. Generate answer
chat <- chat_openai(model = "gpt-4o")
ask_rag <- function(question) {
  chunks <- search_chunks(question, k = 5)
  context <- paste(chunks$text, collapse = "\n\n")
  chat$turn(sprintf("Answer using only this context:\n%s\n\nQuestion: %s", context, question))
}
```

### RAG with ChromaDB via reticulate

```r
library(reticulate)

chroma <- import("chromadb")
np <- import("numpy")

client <- chroma$Client()
collection <- client$get_or_create_collection("r_docs")

# Add documents
add_documents <- function(texts, metadatas) {
  ids <- sprintf("doc_%d", seq_along(texts))
  # Embed using sentence-transformers via Python
  embeddings <- py_run_string(sprintf("
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
embeddings = model.encode(%s).tolist()
", py_unicode(paste0("[", paste(sprintf("'%s'", texts), collapse = ","), "]"))))
  
  collection$add(
    ids = ids,
    documents = texts,
    metadatas = metadatas,
    embeddings = embeddings
  )
}

# Search
search <- function(query, n = 5) {
  py_run_string(sprintf("
results = collection.query(query_texts=['%s'], n_results=%d)
", gsub("'", "''", query), n))
  py$results$documents[[1]]
}
```

---

## Common Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| **Irrelevant chunks retrieved** | Poor chunking, bad embeddings | Tune chunk size, try better embedding model |
| **Missing relevant chunks** | Recall too low | Increase K, use hybrid search, improve chunking |
| **Hallucinations** | LLM ignores context | Strengthen system prompt, add citation requirements |
| **Slow retrieval** | Large vector store, no indexing | Use HNSW index, filter by metadata |
| **Stale information** | Documents updated but not re-indexed | Implement incremental updates |
| **Duplicate chunks** | Overlapping splits | Use MMR, increase overlap threshold |
| **Context overflow** | Too many/large chunks | Implement context window management |

---

## Sources

| Source | URL | What It Provides |
|--------|-----|------------------|
| RAG Original Paper (Lewis et al.) | [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401) | Foundational RAG research |
| RAGAS Evaluation | [docs.ragas.io/en/stable/concepts/metrics](https://docs.ragas.io/en/stable/concepts/metrics/) | RAG evaluation framework |
| RAGAS Paper | [arxiv.org/abs/2309.15217](https://arxiv.org/abs/2309.15217) | Evaluation methodology |
| Self-RAG Paper | [arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172) | Corrective RAG technique |
| LlamaIndex | [developers.llamaindex.ai/python/framework](https://developers.llamaindex.ai/python/framework/) | RAG framework documentation |
| LlamaIndex Ingestion | [developers.llamaindex.ai/python/framework/module_guides/loading/ingestion_pipeline](https://developers.llamaindex.ai/python/framework/module_guides/loading/ingestion_pipeline/) | Ingestion pipeline guide |
| Pinecone RAG Guide | [pinecone.io/learn/retrieval-augmented-generation](https://www.pinecone.io/learn/retrieval-augmented-generation/) | RAG concepts and patterns |
| Chroma | [docs.trychroma.com/docs/overview/introduction](https://docs.trychroma.com/docs/overview/introduction) | Vector store documentation |
| Qdrant | [qdrant.tech/documentation](https://qdrant.tech/documentation/) | Vector store documentation |
| LangChain RAG | [python.langchain.com/docs/versions/migrating_memory](https://docs.langchain.com/oss/python/langchain/overview) | RAG chain implementations |
| HuggingFace RAG Cookbook | [huggingface.co/learn/cookbook/rag_zephyr_langchain](https://huggingface.co/learn/cookbook/rag_zephyr_langchain) | Practical RAG examples |

---

## Related Notes

- [[MCP — Model Context Protocol Guide]] — Complementary tool protocol
- [[Building LLM Agents — Python Guide]] — RAG integration in agents
- [[Building LLM Agents — R Guide]] — R-specific RAG implementation
- [[Agent Architecture Patterns]] — RAG as agent tool pattern
- [[Secure Agent Guardrails]] — RAG security considerations

---

*Created: 2026-10-19*
