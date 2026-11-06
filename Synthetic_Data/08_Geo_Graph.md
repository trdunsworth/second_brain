# Geospatial & Graph Synthetic Data Generation

A comprehensive reference for generating synthetic geospatial, graph, and network data.

---

## 1. Geospatial Data Generation

### 1.1 Point Pattern Generation

#### 1.1.1 Basic Point Patterns
```python
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon
import geopandas as gpd

# Random points in bounding box
def random_points_in_bbox(bbox, n):
    """Generate n random points within bounding box"""
    minx, miny, maxx, maxy = bbox
    xs = np.random.uniform(minx, maxx, n)
    ys = np.random.uniform(miny, maxy, n)
    return gpd.GeoDataFrame(
        geometry=[Point(x, y) for x, y in zip(xs, ys)],
        crs="EPSG:4326"
    )

# Random points in polygon
def random_points_in_polygon(polygon, n):
    minx, miny, maxx, maxy = polygon.bounds
    points = []
    while len(points) < n:
        p = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
        if polygon.contains(Point(p.x, p.y)):
            points.append(p)
    return gpd.GeoDataFrame(geometry=points, crs="EPSG:4326")

# Clustered points (Thomas process)
def thomas_process(region, n_clusters=5, points_per_cluster=50, sigma=0.01):
    """Thomas cluster process - clustered points"""
    centroids = [random_point_in_polygon(region) for _ in range(n_clusters)]
    points = []
    for cx, cy in centroids:
        for _ in range(points_per_cluster):
            angle = np.random.uniform(0, 2*np.pi)
            r = np.random.normal(0, sigma)
            x = cx + r * np.cos(angle)
            y = cy + r * np.sin(angle)
            if region.contains(Point(x, y)):
                points.append(Point(x, y))
    return gpd.GeoDataFrame(geometry=points, crs="EPSG:4326")
```

### 1.2 Spatial Point Processes
```python
# Poisson Point Process (CSR - Complete Spatial Randomness)
def poisson_process(region, intensity):
    """Homogeneous Poisson point process"""
    area = region.area
    n_points = np.random.poisson(intensity * area)
    return random_points_in_polygon(region, int(np.random.poisson(intensity * region.area)))

# Inhomogeneous Poisson Process
def inhomogeneous_poisson(region, intensity_func, max_intensity):
    """Thinning algorithm for inhomogeneous Poisson"""
    points = []
    # Generate from homogeneous with max intensity
    candidates = poisson_process(region, max_intensity)
    for point in points:
        if np.random.random() < intensity_func(point) / max_intensity:
            points.append(point)
    return points

# Thomas Process (Clustered)
def thomas_process(region, kappa, mu, sigma):
    """Clustered point process"""
    # Parent process
    parents = poisson_process(region, kappa)
    points = []
    for parent in parents:
        n_offspring = np.random.poisson(mu)
        for _ in range(n_offspring):
            angle = np.random.uniform(0, 2*np.pi)
            r = np.random.normal(0, sigma)
            x = parent.x + r * np.cos(np.random.uniform(0, 2*np.pi))
            y = parent.y + r * np.sin(np.random.uniform(0, 2*np.pi))
            if region.contains(Point(x, y)):
                points.append(Point(x, y))
    return points

# Matérn Cluster Process
def matern_cluster(region, kappa, r, mu):
    """Hard-core cluster process"""
    parents = poisson_process(region, kappa)
    points = []
    for parent in parents:
        n = np.random.poisson(mu)
        for _ in range(n):
            angle = np.random.uniform(0, 2*np.pi)
            r = np.random.uniform(0, r)
            x = parent.x + r * np.cos(angle)
            y = parent.y + r * np.sin(angle)
            if region.contains(Point(x, y)):
                points.append(Point(x, y))
    return points
```

### 1.3 Realistic Urban Patterns
```python
# Urban street network generation
import networkx as nx
import osmnx as ox

# Generate synthetic street network
def generate_city_grid(n_blocks=10, block_size=200):
    """Generate synthetic city grid"""
    G = nx.grid_2d_graph(n, n)
    # Add noise to grid
    pos = {n: (x*block_size + np.random.normal(0, 20), 
               y*block_size + np.random.normal(0, 20)) 
           for (x, y), n in zip(G.nodes(), range(n*n))}
    return ox.graph_from_gdfs(nodes, edges)

# Realistic road network
G = ox.graph_from_place("San Francisco, CA", network_type="drive")
# Simplify
G_simplified = ox.simplify_graph(G)

# Generate synthetic trips
def generate_trips(G, n_trips=1000):
    nodes = list(G.nodes())
    trips = []
    for _ in range(n):
        origin = np.random.choice(nodes)
        dest = np.random.choice(nodes)
        route = nx.shortest_path(G, origin, dest, weight='length')
        trips.append({
            'origin': origin,
            'destination': dest,
            'path': route,
            'distance': sum(G[u][v][0]['length'] for u,v in zip(route[:-1], route[1:]))
        })
    return trips
```

---

## 2. Graph & Network Synthetic Data

### 1. Graph Generation Models

### 1.1 Classic Random Graph Models
```python
import networkx as nx
import numpy as np

# Erdos-Renyi (G(n, p))
G = nx.erdos_renyi_graph(n=1000, p=0.01)

# Barabasi-Albert (Scale-free)
G = nx.barabasi_albert_graph(n=1000, m=3)

# Watts-Strogatz (Small-world)
G = nx.watts_strogatz_graph(n=1000, k=6, p=0.1)

# Configuration Model (given degree sequence)
degrees = np.random.power(2.5, 1000).astype(int)
degrees = np.clip(degrees, 1, 100)
G = nx.configuration_model(degrees)

# Stochastic Block Model (Communities)
G = nx.stochastic_block_model(
    sizes=[100, 100, 100],
    p=[[0.1, 0.01, 0.01],
       [0.01, 0.1, 0.01],
       [0.01, 0.01, 0.1]]
)

# Random Geometric Graph
G = nx.random_geometric_graph(1000, radius=0.1)

# Hyperbolic Geometry Graphs
from networkx.generators.geometric import hyperbolic_graph
G = hyperbolic_graph(n=1000, alpha=0.5)
```

### 2. Graph Generative Models

### 1. GraphRNN / GraphRNN
```python
# GraphRNN (Deep generative model for graphs)
# pip install graphrnn
from graphrnn import GraphRNN

model = GraphRNN(
    max_nodes=50,
    hidden_size=128,
    num_layers=2,
    embedding_dim=64
)

# Train on graph dataset
graphs = [nx.to_numpy_array(G) for G in graphs]
model.fit(graphs, epochs=100)

# Generate
generated_graphs = model.sample(100)
```

### 2. Graph VAE / GraphVAE
```python
# GraphVAE
# pip install graphvae
from graphvae import GraphVAE

model = GraphVAE(
    max_nodes=50,
    hidden_dim=128,
    latent_dim=64,
    num_layers=3
)
model.fit(graphs, epochs=100)

# Generate
generated = model.sample(100)
```

### 3. Graph Normalizing Flows
```python
# Graph Normalizing Flows
# pip install graphnormalizingflows
from graphnfl import GraphNormalizingFlow

model = GraphNormalizingFlow(
    hidden_dim=128,
    num_layers=6,
    base_distribution='gaussian'
)
model.fit(graphs)
generated = model.sample(100)
```

### 3. Graph Normalizing Flows
```python
# Graph Normalizing Flows (GraphNVP, GraphAF)
# pip install graphnvp
from graphnvp import GraphNVP

model = GraphNVP(
    node_dim=10,
    hidden_dim=128,
    num_flows=8
)
model.fit(graphs)
generated = model.sample(100)
```

### 3. GraphRNN / GRAN
```python
# GRAN (Graph Random Neural Networks)
# pip install gran
from gran import GRAN

model = GRAN(
    max_nodes=50,
    hidden_dim=128,
    num_layers=3
)
model.fit(graphs)
graphs = model.sample(100)
```

---

## 3. Specialized Graph Models

### 1. Molecule Generation (Molecular Graphs)
```python
# MolGAN / MolGAN
# pip install molgan
from molgan import MolGAN

model = MolGAN(
    max_nodes=50,
    noise_dim=128,
    num_node_features=5,
    num_edge_types=5
)
model.fit(molecular_graphs)

# GraphAF (Autoregressive Flow)
# pip install graphaf
from graphaf import GraphAF

model = GraphAF(
    max_nodes=50,
    hidden_dim=128,
    num_layers=4
)
model.fit(molecules)
molecules = model.sample(100)
```

### 2. Graph Normalizing Flows
```python
# Graph Normalizing Flows (GraphNVP, GraphAF)
# pip install graphnvp
from graphnvp import GraphNVP

model = GraphNVP(
    node_dim=10,
    hidden_dim=128,
    num_flows=8
)
model.fit(graphs)
generated = model.sample(100)
```

### 3. Graph Normalizing Flows (GraphAF)
```python
# GraphAF
# pip install graphaf
from graphaf import GraphAF

model = GraphAF(
    max_nodes=50,
    hidden_dim=128,
    num_layers=4
)
model.fit(graphs)
generated = model.sample(100)
```

---

## 3. Knowledge Graphs

### 1. Knowledge Graph Generation
```python
# Knowledge Graph Embedding + Generation
from pykeen.models import TransE, RotatE, ComplEx
from pykeen.training import SLCWATrainingLoop
from pykeen.triples import TriplesFactory

# Load knowledge graph
tf = TriplesFactory.from_path("train.tsv")

# Train
model = TransE(triples_factory=tf, embedding_dim=100)
training_loop = SLCWATrainingLoop(model=model, triples_factory=tf)
losses = training_loop.train(num_epochs=100)

# Generate new triples
# Use embedding arithmetic for relation prediction
head = torch.tensor([entity_to_id['Paris']])
relation = torch.tensor([rel_to_id['capital_of']])
tail_scores = model.predict(head, relation)
```

### 2. Synthetic Knowledge Graphs
```python
# Generate synthetic KG with known structure
def generate_kg(n_entities=1000, n_relations=20, density=0.01):
    entities = [f"E{i}" for i in range(n_entities)]
    relations = [f"R{i}" for i in range(n_relations)]
    
    triples = []
    for _ in range(int(n_entities * n_entities * 0.01)):
        h = np.random.choice(entities)
        r = np.random.choice(relations)
        t = np.random.choice(entities)
        triples.append((h, r, t))
    
    return pd.DataFrame(triples, columns=['head', 'relation', 'tail'])

# With schema constraints
def generate_schema_kg(schema, n_entities):
    """
    schema: {
        'Person': ['name', 'age', 'email'],
        'Company': ['name', 'industry'],
        'works_at': ('Person', 'Company')
    }
    """
    pass
```

---

## 5. Evaluation of Graph Synthetic Data

### 1. Graph Metrics
```python
import networkx as nx
from scipy.stats import ks_2samp

def compare_graphs(G_real, G_syn):
    metrics = {}
    
    # Degree distribution
    deg_real = [d for _, d in G_real.degree()]
    deg_syn = [d for _, d in G_syn.degree()]
    ks_stat, p = ks_2samp(deg_real, deg_syn)
    
    # Clustering coefficient
    cc_real = nx.average_clustering(G_real)
    cc_syn = nx.average_clustering(G_syn)
    
    # Path length
    try:
        apl_real = nx.average_shortest_path_length(G_real)
        apl_syn = nx.average_shortest_path_length(G_syn)
    except:
        apl_real = apl_syn = np.nan
    
    # Clustering coefficient distribution
    clust_real = list(nx.clustering(G_real).values())
    clust_syn = list(nx.clustering(G_syn).values())
    ks_stat, p = ks_2samp(clust_real, clust_syn)
    
    # Degree distribution KS test
    ks_stat, p = ks_2samp(deg_real, deg_syn)
    
    return {
        'degree_ks': ks_stat,
        'clustering_diff': abs(cc_real - cc_syn),
        'path_length_diff': abs(apl_real - apl_syn) if not np.isnan(apl_real) else None,
        'degree_ks_p': p
    }
```

### 2. Graph Property Preservation
```python
def evaluate_graph_synthetic(G_real, G_syn):
    metrics = {}
    
    # Degree distribution
    metrics['degree_ks'] = ks_2samp(
        [d for _, d in G_real.degree()],
        [d for _, d in G_syn.degree()]
    ).statistic
    
    # Clustering coefficient
    metrics['clustering_diff'] = abs(
        nx.average_clustering(G_real) - nx.average_clustering(G_syn)
    )
    
    # Assortativity
    metrics['assortativity_diff'] = abs(
        nx.degree_assortativity_coefficient(G_real) - 
        nx.degree_assortativity_coefficient(G_syn)
    )
    
    # Connected components
    metrics['components_ratio'] = (
        nx.number_connected_components(G_syn) / 
        nx.number_connected_components(G_real)
    )
    
    return metrics
```

---

## 3. Evaluation Metrics

### Graph-Level Metrics
```python
def evaluate_graph_synthetic(G_real, G_syn):
    metrics = {}
    
    # Degree distribution
    deg_real = np.array([d for _, d in G_real.degree()])
    deg_syn = np.array([d for _, d in G_syn.degree()])
    metrics['degree_ks'] = ks_2samp(deg_real, deg_syn).statistic
    
    # Clustering coefficient
    cc_real = nx.average_clustering(G_real)
    cc_syn = nx.average_clustering(G_syn)
    metrics['clustering_diff'] = abs(cc_real - cc_syn)
    
    # Average path length
    try:
        apl_real = nx.average_shortest_path_length(G_real)
        apl_syn = nx.average_shortest_path_length(G_syn)
        metrics['apl_diff'] = abs(apl_real - apl_syn)
    except:
        metrics['apl_diff'] = None
    
    # Assortativity
    metrics['assortativity_diff'] = abs(
        nx.degree_assortativity_coefficient(G_real) - 
        nx.degree_assortativity_coefficient(G_syn)
    )
    
    # Connected components
    metrics['components_ratio'] = (
        nx.number_connected_components(G_syn) / 
        nx.number_connected_components(G_real)
    )
    
    return metrics
```

---

## 4. Resources

### Key Papers
| Paper | Link |
|-------|------|
| GraphRNN | https://arxiv.org/abs/1802.08773 |
| GraphVAE | https://arxiv.org/abs/1802.03480 |
| GraphRNN | https://arxiv.org/abs/1802.08773 |
| MolGAN | https://arxiv.org/abs/1805.11973 |
| GraphAF | https://arxiv.org/abs/1908.04121 |
| GraphNVP | https://arxiv.org/abs/2005.12576 |
| GraphNormalizingFlows | https://arxiv.org/abs/2106.10645 |

### Libraries
| Library | Purpose |
|---------|---------|
| NetworkX | Graph manipulation |
| PyTorch Geometric | PyG - PyTorch Geometric |
| DGL | Deep Graph Library |
| GraphGym | Graph ML benchmarking |
| torch_geometric | PyG |
| DGL | Deep Graph Library |
| NetworkX | Classic graph library |
| GraphRNN | GraphRNN implementation |
| GraphVAE | VAE for graphs |
| MolGAN | Molecular graphs |
| GraphRNN | GraphRNN implementation |

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*