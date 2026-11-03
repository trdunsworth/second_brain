# RAG Systems: Retrieval-Augmented Generation

RAG combines retrieval with generation to ground LLMs in external knowledge, reducing hallucination and enabling domain-specific, up-to-date responses.

## 1. RAG Architecture

### Basic Pipeline
```
User Query
    ↓
[Query Encoder] → Query Embedding
    ↓
[Vector Search] → Top-K Documents
    ↓
[Context Construction] → Retrieved Chunks + Query
    ↓
[Generator LLM] → Final Answer
```

### Advanced Pipeline
```
User Query
    ↓
[Query Understanding] → Rewrite/Decompose/Expand
    ↓
[Hybrid Retrieval] → Dense + Sparse + Graph
    ↓
[Re-ranking] → Cross-encoder / LLM Re-ranker
    ↓
[Context Compression] → Summarize / Filter / Rerank
    ↓
[Generator] → Answer + Citations
    ↓
[Verification] → Self-check / Fact-check
```

---

## 2. Retrieval Methods

### Dense Retrieval (Semantic)
```python
# Bi-encoder: Independent encoding
class BiEncoder(nn.Module):
    def __init__(self, model_name="BAAI/bge-large-en-v1.5"):
        self.encoder = AutoModel.from_pretrained(model_name)
    
    def encode(self, texts, batch_size=32):
        embeddings = []
        for batch in chunk(texts, batch_size):
            inputs = tokenizer(batch, padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                outputs = self.encoder(**inputs)
                # CLS pooling or mean pooling
                emb = outputs.last_hidden_state[:, 0]  # CLS
                emb = F.normalize(emb, p=2, dim=1)
            embeddings.append(emb)
        return torch.cat(embeddings)

# Popular embedding models
EMBEDDING_MODELS = {
    "bge-large-en-v1.5": {"dim": 1024, "max_seq": 512, "lang": "en"},
    "bge-m3": {"dim": 1024, "max_seq": 8192, "lang": "multi", "dense+sparse+colbert"},
    "e5-large-v2": {"dim": 1024, "max_seq": 512, "lang": "multi"},
    "gte-large-en-v1.5": {"dim": 1024, "max_seq": 512, "lang": "en"},
    "text-embedding-3-large": {"dim": 3072, "max_seq": 8192, "lang": "multi", "api": True},
    "voyage-2": {"dim": 1536, "max_seq": 16000, "lang": "multi", "api": True},
}
```

### Sparse Retrieval (Lexical)
```python
# BM25 (rank-bm25)
from rank_bm25 import BM25Okapi

corpus = [doc.split() for doc in documents]
bm25 = BM25Okapi(corpus)
scores = bm25.get_scores(query.split())
top_k = np.argsort(scores)[-k:][::-1]

# SPLADE (Learned Sparse)
# Uses transformer to predict term importance weights
```

### Hybrid Retrieval (Recommended)
```python
def hybrid_search(query, dense_index, sparse_index, alpha=0.5, k=20):
    # Dense scores
    dense_scores, dense_ids = dense_index.search(query_emb, k*2)
    
    # Sparse scores (BM25)
    sparse_scores, sparse_ids = sparse_index.search(query, k*2)
    
    # Normalize
    dense_scores = minmax_normalize(dense_scores)
    sparse_scores = minmax_normalize(sparse_scores)
    
    # Combine
    combined = {}
    for i, (doc_id, score) in enumerate(zip(dense_ids, dense_scores)):
        combined[doc_id] = combined.get(doc_id, 0) + alpha * score
    for i, (doc_id, score) in enumerate(zip(sparse_ids, sparse_scores)):
        combined[doc_id] = combined.get(doc_id, 0) + (1-alpha) * score
    
    # Sort and return top-k
    return sorted(combined.items(), key=lambda x: x[1], reverse=True)[:k]
```

---

## 3. Vector Databases

### Comparison
| DB | Type | Scale | Latency | Features |
|----|------|-------|---------|----------|
| **FAISS** | Library | 1M-1B | <1ms | IVF, HNSW, PQ, GPU |
| **Chroma** | Embedded/Server | 1M | ~10ms | Easy, metadata filter |
| **Weaviate** | Server | 100M | ~20ms | GraphQL, hybrid, modules |
| **Pinecone** | Managed | 1B+ | ~30ms | Serverless, hybrid |
| **Milvus** | Server | 1B+ | ~10ms | K8s, GPU, multi-tenancy |
| **Qdrant** | Server | 100M | ~10ms | Payload filter, hybrid |
| **Elasticsearch** | Server | 1B+ | ~50ms | Full-text + vector, mature |
| **LanceDB** | Embedded | 100M | <5ms | Columnar, Python-native |

### FAISS Index Types
```python
import faiss

# Flat (exact, brute-force) - small datasets
index = faiss.IndexFlatIP(dim)  # Inner product (cosine with normalized vectors)

# IVF (Inverted File) - large datasets
nlist = 4096  # Number of clusters
quantizer = faiss.IndexFlatIP(dim)
index = faiss.IndexIVFFlat(quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT)
index.train(vectors)
index.add(vectors)
index.nprobe = 32  # Clusters to search at query time

# HNSW (Hierarchical Navigable Small World) - best speed/accuracy
index = faiss.IndexHNSWFlat(dim, 32)  # M=32 connections
index.hnsw.efConstruction = 200
index.hnsw.efSearch = 128

# IVF+PQ (Product Quantization) - memory efficient
index = faiss.IndexIVFPQ(quantizer, dim, nlist, 64, 8)  # 64 subquantizers, 8 bits
```

---

## 4. Chunking Strategies

### Fixed-Size with Overlap
```python
def chunk_text(text, chunk_size=512, overlap=50, tokenizer=None):
    tokens = tokenizer.encode(text)
    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk_tokens))
    return chunks
```

### Semantic Chunking
```python
def semantic_chunk(text, embedder, similarity_threshold=0.7, max_chunk=512):
    sentences = sent_tokenize(text)
    embeddings = embedder.encode(sentences)
    
    chunks = []
    current_chunk = [sentences[0]]
    current_emb = embeddings[0]
    
    for i in range(1, len(sentences)):
        sim = cosine_similarity(current_emb.reshape(1, -1), embeddings[i].reshape(1, -1))
        if sim < similarity_threshold or len(tokenizer.encode(" ".join(current_chunk))) > max_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i]]
            current_emb = embeddings[i]
        else:
            current_chunk.append(sentences[i])
            current_emb = np.mean([current_emb, embeddings[i]], axis=0)
    
    chunks.append(" ".join(current_chunk))
    return chunks
```

### Recursive/Structure-Aware
```python
# LangChain recursive character splitter
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
    length_function=lambda x: len(tokenizer.encode(x)),
)
```

### Chunking Best Practices
| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Fixed + Overlap** | General | Simple, predictable | Breaks semantics |
| **Semantic** | Coherent topics | Preserves meaning | Slower, needs embedder |
| **Recursive** | Structured docs | Respects hierarchy | May create uneven chunks |
| **Document-aware** | Legal, technical | Keeps sections intact | Complex implementation |

---

## 5. Re-ranking

### Cross-Encoder (High Accuracy)
```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query, docs, top_k=5):
    pairs = [[query, doc] for doc in docs]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in ranked[:top_k]]
```

### LLM Re-ranker (Highest Accuracy)
```python
def llm_rerank(query, docs, k=5):
    prompt = f"""Query: {query}
    
    Rank these documents by relevance (1=most relevant):
    """
    for i, doc in enumerate(docs):
        prompt += f"\n{i+1}. {doc[:500]}"
    
    response = llm.generate(prompt + "\nRanking (numbers only): ")
    # Parse ranking
    return [docs[int(x)-1] for x in parse_ranking(response)]
```

### Cohere / Jina / BGE Rerankers (API)
```python
import cohere
co = cohere.Client(api_key)

results = co.rerank(
    query=query,
    documents=[doc["text"] for doc in docs],
    top_k=5,
    model="rerank-english-v3.0"
)
```

### Re-ranking Pipeline
```python
def retrieve_and_rerank(query, top_k=5):
    # 1. Initial retrieval (broad)
    candidates = hybrid_search(query, k=50)
    
    # 2. Cross-encoder re-rank
    reranked = cross_encoder_rerank(query, candidates, k=20)
    
    # 3. LLM re-rank (optional, for final top-5)
    final = llm_rerank(query, reranked, k=top_k)
    
    return final
```

---

## 6. Advanced RAG Patterns

### Query Transformation
```python
# Query Rewriting
def rewrite_query(query, history):
    prompt = f"""Rewrite the user query to be self-contained for retrieval.
    History: {history}
    Query: {query}
    Rewritten:"""
    return llm.generate(prompt)

# Query Decomposition (Multi-hop)
def decompose_query(query):
    prompt = f"""Decompose this complex query into sub-queries:
    Query: {query}
    Sub-queries (one per line):"""
    return llm.generate(prompt).split("\n")

# HyDE (Hypothetical Document Embeddings)
def hyde_retrieve(query):
    # Generate hypothetical answer
    hypo = llm.generate(f"Write a passage that answers: {query}")
    # Use hypothetical to retrieve
    return hybrid_search(hypo, k=10)
```

### Recursive Retrieval
```python
def recursive_retrieve(query, max_depth=3):
    results = []
    current_query = query
    
    for depth in range(max_depth):
        docs = retrieve(current_query, k=5)
        results.extend(docs)
        
        # Check if sufficient
        if check_sufficient(docs, query):
            break
        
        # Generate follow-up query
        current_query = generate_followup(query, docs)
    
    return deduplicate(results)
```

### Agentic RAG (ReAct)
```python
class RAGAgent:
    def __init__(self, retriever, llm, max_steps=5):
        self.retriever = retriever
        self.llm = llm
        self.max_steps = max_steps
    
    def run(self, query):
        trajectory = []
        for step in range(self.max_steps):
            # Think
            thought = self.llm.generate(f"Thought: {query}\nTrajectory: {trajectory}\nAction:")
            
            # Act: Retrieve
            if "search" in thought.lower():
                sub_query = extract_query(thought)
                docs = self.retriever.search(sub_query, k=5)
                trajectory.append(f"Retrieved: {docs}")
            
            # Act: Answer
            elif "answer" in thought.lower():
                answer = self.llm.generate(f"Answer based on: {trajectory}\nFinal Answer:")
                return answer
        
        return "Max steps reached"
```

---

## 7. Long Context RAG

### Context Compression
```python
# LongLLMLingua / Selective Context
def compress_context(query, docs, target_tokens=4000):
    # Rank sentences by relevance to query
    sentences = split_into_sentences(docs)
    scores = cross_encoder_score(query, sentences)
    ranked = sorted(zip(sentences, scores), key=lambda x: x[1], reverse=True)
    
    # Take top sentences until token budget
    compressed = []
    tokens = 0
    for sent, _ in ranked:
        sent_tokens = len(tokenizer.encode(sent))
        if tokens + sent_tokens > target_tokens:
            break
        compressed.append(sent)
        tokens += sent_tokens
    return " ".join(compressed)

# AutoCompressor (trainable)
class AutoCompressor(nn.Module):
    def __init__(self, base_model, compress_ratio=8):
        self.base = base_model
        self.compressor = nn.Linear(base_model.config.hidden_size, 
                                     base_model.config.hidden_size // compress_ratio)
    
    def forward(self, x):
        compressed = self.compressor(x)
        return compressed
```

### Ring Attention / YaRN (Extending Context)
```python
# For models with RoPE
# YaRN: Scale RoPE frequencies for longer context
def yarn_scaling(model, original_max_pos=4096, new_max_pos=32768, beta_fast=32, beta_slow=1):
    # Rescale RoPE theta
    for layer in model.layers:
        if hasattr(layer.self_attn, 'rotary_emb'):
            layer.self_attn.rotary_emb = YaRNRotaryEmbedding(
                dim=layer.self_attn.head_dim,
                max_position_embeddings=new_max_pos,
                base=10000,
                scaling_factor=new_max_pos / original_max_pos,
                original_max_position_embeddings=original_max_pos,
                beta_fast=beta_fast,
                beta_slow=beta_slow,
            )
```

---

## 8. Graph RAG

### Knowledge Graph Construction
```python
# Extract entities/relations from documents
def extract_kg(doc):
    prompt = f"""Extract entities and relationships from this text:
    {doc}
    Format: (entity1, relation, entity2)"""
    
    triples = llm.generate(prompt)
    return parse_triples(triples)

# Build graph
import networkx as nx
G = nx.MultiDiGraph()
for doc in documents:
    triples = extract_kg(doc)
    for h, r, t in triples:
        G.add_edge(h, t, relation=r)
```

### Graph Retrieval
```python
# Personalized PageRank from query entities
def graph_retrieve(query, graph, k=10):
    query_entities = extract_entities(query)
    scores = nx.pagerank_scipy(graph, personalization=query_entities, alpha=0.85)
    top_nodes = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:k]
    
    # Expand to subgraph
    results = []
    for node, _ in top_nodes:
        subgraph = nx.ego_graph(graph, node, radius=1)
        results.append(format_subgraph(subgraph))
    return results
```

---

## 9. Evaluation

### Retrieval Metrics
```python
def evaluate_retrieval(queries, ground_truth, retriever, k=10):
    metrics = {"recall@k": 0, "mrr@k": 0, "ndcg@k": 0}
    for q, gt_docs in zip(queries, ground_truth):
        retrieved = retriever.search(q, k=k)
        retrieved_ids = [d.id for d in retrieved]
        
        # Recall@k
        hit = len(set(gt_docs) & set(retrieved_ids)) / len(gt_docs)
        metrics["recall@k"] += hit
        
        # MRR@k
        for i, doc_id in enumerate(retrieved_ids):
            if doc_id in gt_docs:
                metrics["mrr@k"] += 1 / (i + 1)
                break
        
        # NDCG@k
        relevance = [1 if d in gt_docs else 0 for d in retrieved_ids]
        metrics["ndcg@k"] += ndcg_score([relevance], [list(range(len(relevance), 0, -1))], k=k)
    
    return {k: v / len(queries) for k, v in metrics.items()}
```

### End-to-End RAG Metrics
```python
# Faithfulness (answer grounded in context)
def faithfulness_score(answer, context):
    # Decompose answer into claims, verify each against context
    claims = decompose_claims(answer)
    supported = sum(verify_claim(c, context) for c in claims)
    return supported / len(claims)

# Answer Relevance
def answer_relevance(query, answer):
    # Semantic similarity between query and answer
    return cosine_similarity(embed(query), embed(answer))

# Context Precision/Recall
# Correctness (vs ground truth answer)
```

---

## 10. Production RAG Architecture

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌────────────┐  ┌────────────┐  ┌────────────┐
       │ Query      │  │ Retrieval  │  │ Generation │
       │ Processor  │  │ Service    │  │ Service    │
       └────────────┘  └────────────┘  └────────────┘
              │               │               │
              ▼               ▼               ▼
       ┌────────────┐  ┌────────────┐  ┌────────────┐
       │ Query      │  │ Vector DB  │  │ LLM (vLLM/ │
       │ Rewriter   │  │ (FAISS/    │  │ TGI)       │
       │ Decomposer │  │ Milvus)    │  │            │
       └────────────┘  └────────────┘  └────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌─────────────────┐
                    │ Context Builder │
                    │ (Rerank +       │
                    │  Compress)      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Answer + Cites  │
                    └─────────────────┘
```

### Key Production Components
| Component | Technology Options |
|-----------|-------------------|
| **Vector DB** | Milvus, Weaviate, Qdrant, Pinecone, FAISS |
| **Embedding API** | BGE, E5, Voyage, OpenAI, Cohere |
| **Reranker** | Cross-encoder, Cohere Rerank, Jina Rerank |
| **LLM Serving** | vLLM, TGI, SGLang, Triton |
| **Orchestration** | LangChain, LlamaIndex, Haystack, custom |
| **Observability** | LangSmith, Langfuse, Arize, Weights & Biases |

---

## 11. RAG Checklist

- [ ] **Chunking**: Semantic chunks, 256-1024 tokens, 10-20% overlap
- [ ] **Embeddings**: BGE-M3 or E5-Large-V2 (multi-lingual, long context)
- [ ] **Hybrid Search**: Dense + BM25 with Reciprocal Rank Fusion
- [ ] **Re-ranking**: Cross-encoder (top-50 → top-5) or Cohere Rerank v3
- [ ] **Context Window**: Fit within generator's context (leave room for answer)
- [ ] **Citations**: Include doc IDs in prompt, parse in output
- [ ] **Query Rewriting**: For conversational RAG
- [ ] **Evaluation**: Recall@k > 0.8, Faithfulness > 0.9, Latency < 2s
- [ ] **Monitoring**: Latency, recall, faithfulness, user feedback

---

## 12. Key Takeaways

1. **Hybrid retrieval (dense + sparse) + re-ranking** is the production standard
2. **Chunking matters more than embedding model** — semantic > fixed
3. **Re-ranking is the highest ROI improvement** — cross-encoder or LLM
4. **Citations are non-negotiable** — enables verification and trust
5. **Query understanding** (rewrite, decompose, HyDE) handles complex queries
6. **Long-context RAG** needs compression (not just bigger context window)
6. **Evaluate retrieval AND generation** — they have different failure modes
7. **Start simple**: BM25 → Hybrid → Add re-ranker → Add query understanding