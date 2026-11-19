"""
SynthGIS Command Line Interface.

Main entry point for generating, validating, and exporting synthetic town data.
"""

from __future__ import annotations

import json
import pickle
from datetime import datetime
from pathlib import Path

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
import geopandas as gpd

from .config import TownSpec, load_town_spec
from .seeding import SeedState
from .boundaries import generate_all_boundaries, BoundaryLayers
from .streets.generator import StreetNetworkGenerator
from .parcels.tessellation import blocks_from_streets
from .parcels.subdivision import subdivide_blocks
from .parcels.zoning import assign_zoning
from .buildings import generate_building_footprints, generate_buildings_3d
from .address_points import generate_address_points
from .operational import generate_all_operational
from .routing import build_routing_graph, export_pgrouting_sql
from .validation.topology import validate_all_topology
from .validation.schema import validate_schema_compliance
from .validation.qc_sql import run_qc_checks, generate_qc_report
from .export.geopackage import export_geopackage
from .export.postgis import load_to_postgis
from .services import create_routing_app, RoutingService, serve_lost

app = typer.Typer(
    name="synthgis",
    help="Synthetic City GIS Generator for NG9-1-1 Compliance",
    add_completion=False,
)
console = Console()


@app.command()
def generate(
    config: Path = typer.Option(..., "--config", "-c", help="Town specification YAML file"),
    output: Path = typer.Option(..., "--output", "-o", help="Output GeoPackage path"),
    postgis: str | None = typer.Option(None, "--postgis", help="PostGIS connection string (optional)"),
    pgrouting: Path | None = typer.Option(None, "--pgrouting", help="Export pgRouting SQL to file"),
    validate: bool = typer.Option(True, "--validate/--no-validate", help="Run topology/schema validation"),
    qc: bool = typer.Option(False, "--qc", help="Run NENA QC checks (requires PostGIS)"),
    seed: int | None = typer.Option(None, "--seed", help="Override master seed"),
    buildings_3d: bool = typer.Option(False, "--3d/--2d", help="Generate 3D buildings (Z-enabled)"),
    export_graph: Path | None = typer.Option(None, "--export-graph", help="Export routing graph as pickle"),
):
    """Generate a synthetic town from configuration."""
    console.print("[bold blue]SynthGIS[/bold blue] - Generating synthetic town...")

    # Load configuration
    spec = load_town_spec(config)
    if seed is not None:
        spec.seed = seed

    # Initialize seed state
    seed_state = SeedState.from_master(spec.seed or int(datetime.utcnow().timestamp()))

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        # 1. Boundaries
        task = progress.add_task("Generating boundaries...", total=None)
        boundaries = generate_all_boundaries(spec, seed_state)
        progress.update(task, completed=True)

        # 2. Street network
        task = progress.add_task("Generating street network...", total=None)
        street_gen = StreetNetworkGenerator(spec, seed_state)
        street_network = street_gen.generate()
        progress.update(task, completed=True)

        # 3. Blocks from streets
        task = progress.add_task("Generating blocks...", total=None)
        blocks = blocks_from_streets(street_network.combined)
        progress.update(task, completed=True)

        # 4. Zoning
        task = progress.add_task("Assigning zoning...", total=None)
        zoned_blocks = assign_zoning(blocks, spec, seed_state, unit_type="blocks", streets=street_network.combined)
        progress.update(task, completed=True)

        # 5. Parcel subdivision
        task = progress.add_task("Subdividing parcels...", total=None)
        parcels = subdivide_blocks(zoned_blocks, gpd.GeoDataFrame(), spec, seed_state)
        progress.update(task, completed=True)

        # 6. Building footprints
        task = progress.add_task("Generating buildings...", total=None)
        buildings = generate_building_footprints(parcels, spec, seed_state)
        progress.update(task, completed=True)

        # 6b. 3D Buildings (optional)
        if buildings_3d:
            task = progress.add_task("Generating 3D buildings...", total=None)
            buildings = generate_buildings_3d(buildings, spec, seed_state)
            progress.update(task, completed=True)

        # 7. Address points
        task = progress.add_task("Generating address points...", total=None)
        address_points = generate_address_points(
            street_network.combined, parcels, buildings, spec, seed_state
        )
        progress.update(task, completed=True)

        # 8. Operational layers
        task = progress.add_task("Generating operational layers...", total=None)
        operational = generate_all_operational(spec, street_network.combined, {
            "provisioning": boundaries.provisioning,
            "psap": boundaries.psap,
            "fire": boundaries.fire,
            "police": boundaries.police,
            "ems": boundaries.ems,
        }, seed_state)
        progress.update(task, completed=True)

        # 9. Routing graph
        task = progress.add_task("Building routing graph...", total=None)
        routing_graph = build_routing_graph(street_network, spec, seed_state)
        progress.update(task, completed=True)

    # Collect all layers
    layers = {
        "RoadCenterLine": street_network.combined,
        "SiteStructureAddressPoint": address_points,
        "PsapPolygon": boundaries.psap,
        "FirePolygon": boundaries.fire,
        "PolicePolygon": boundaries.police,
        "EmsPolygon": boundaries.ems,
        "ProvisioningPolygon": boundaries.provisioning,
        "FireStationPoint": operational.get("fire"),
        "PoliceStationPoint": operational.get("police"),
        "EmsStationPoint": operational.get("ems"),
        "HospitalPoint": operational.get("hospital"),
        "FireZonePolygon": operational.get("fire"),
        "PoliceZonePolygon": operational.get("police"),
        "EmsZonePolygon": operational.get("ems"),
        "FireRunCard": operational.get("fire"),
        "PoliceRunCard": operational.get("police"),
        "EmsRunCard": operational.get("ems"),
    }

    # Filter out None/empty layers
    layers = {k: v for k, v in layers.items() if v is not None and len(v) > 0}

    # Validation
    if validate:
        console.print("\n[bold]Running validation...[/bold]")
        topo_report = validate_all_topology(layers, spec)
        schema_report = validate_schema_compliance(layers, spec)

        if topo_report.error_count > 0 or schema_report.error_count > 0:
            console.print(f"[red]Validation FAILED: {topo_report.error_count} topology errors, {schema_report.error_count} schema errors[/red]")
        else:
            console.print("[green]Validation PASSED[/green]")

    # Export GeoPackage
    console.print(f"\n[bold]Exporting to GeoPackage: {output}[/bold]")
    export_geopackage(layers, spec, seed_state, output)
    console.print("[green]GeoPackage export complete![/green]")

    # Export pgRouting SQL
    if pgrouting:
        console.print(f"[bold]Exporting pgRouting SQL: {pgrouting}[/bold]")
        export_pgrouting_sql(routing_graph, spec, pgrouting)
        console.print("[green]pgRouting export complete![/green]")

    # Export routing graph as pickle for fast service startup
    if export_graph:
        console.print(f"[bold]Exporting routing graph: {export_graph}[/bold]")
        export_graph.parent.mkdir(parents=True, exist_ok=True)
        with open(export_graph, "wb") as f:
            pickle.dump({
                "graph": routing_graph,
                "stations": {
                    "fire": layers.get("FireStationPoint", gpd.GeoDataFrame()),
                    "police": layers.get("PoliceStationPoint", gpd.GeoDataFrame()),
                    "ems": layers.get("EmsStationPoint", gpd.GeoDataFrame()),
                    "hospital": layers.get("HospitalPoint", gpd.GeoDataFrame()),
                },
                "crs": str(layers["RoadCenterLine"].crs) if "RoadCenterLine" in layers else None,
            }, f)
        console.print("[green]Routing graph export complete![/green]")

    # Load to PostGIS
    if postgis:
        console.print(f"[bold]Loading to PostGIS...[/bold]")
        counts = load_to_postgis(layers, spec, postgis)
        console.print(f"[green]Loaded {sum(counts.values())} features to PostGIS[/green]")

        if qc:
            console.print("[bold]Running NENA QC checks...[/bold]")
            qc_results = run_qc_checks(postgis)
            report = generate_qc_report(qc_results)
            console.print(report)

    # Summary
    table = Table(title="Generation Summary")
    table.add_column("Layer", style="cyan")
    table.add_column("Features", justify="right", style="green")

    for name, gdf in layers.items():
        table.add_row(name, str(len(gdf)))

    console.print(table)
    console.print(f"\nMaster seed: {seed_state.master_seed}")
    console.print(f"Output: {output}")


@app.command()
def validate(
    input: Path = typer.Argument(..., help="GeoPackage file to validate"),
    postgis: str | None = typer.Option(None, "--postgis", help="PostGIS connection for QC checks"),
    config: Path | None = typer.Option(None, "--config", help="Town spec for reference"),
):
    """Validate a GeoPackage file."""
    console.print(f"[bold]Validating {input}...[/bold]")

    # Read all layers
    layers = {}
    import pyogrio
    for layer_name in pyogrio.list_layers(input):
        if layer_name != "metadata":
            layers[layer_name] = gpd.read_file(input, layer=layer_name)

    # Load spec if provided
    spec = load_town_spec(config) if config else None

    # Topology validation
    if spec:
        topo_report = validate_all_topology(layers, spec)
        schema_report = validate_schema_compliance(layers, spec)

        console.print(f"Topology: {topo_report.error_count} errors, {topo_report.warning_count} warnings")
        console.print(f"Schema: {schema_report.error_count} errors, {schema_report.warning_count} warnings")

    # QC checks
    if postgis:
        qc_results = run_qc_checks(postgis)
        report = generate_qc_report(qc_results)
        console.print(report)


@app.command()
def nena_report(
    schema: Path = typer.Option(..., "--schema", help="NENA flatfile schema YAML"),
    output: Path = typer.Option(..., "--output", help="Output Excel report"),
):
    """Generate NENA schema report (placeholder)."""
    console.print("[yellow]NENA schema report generation not yet implemented[/yellow]")


@app.command()
def version():
    """Show version information."""
    from . import __version__
    console.print(f"SynthGIS v{__version__}")


@app.command()
def serve_routing(
    gpkg: Path = typer.Argument(..., help="GeoPackage file with street network"),
    host: str = typer.Option("0.0.0.0", "--host", help="Host to bind to"),
    port: int = typer.Option(8000, "--port", "-p", help="Port to bind to"),
    graph_pickle: Path | None = typer.Option(None, "--graph-pickle", help="Pre-exported routing graph pickle"),
):
    """Start the FastAPI routing service."""
    import uvicorn
    from .services.routing_api import app as routing_app, routing_service
    
    console.print(f"[bold]Loading routing data from {gpkg}...[/bold]")
    
    if graph_pickle and graph_pickle.exists():
        routing_service.load_from_pickle(graph_pickle)
        console.print(f"[green]Loaded graph from pickle: {len(routing_service.graph)} nodes[/green]")
    else:
        routing_service.load_from_geopackage(gpkg)
        console.print(f"[green]Built graph from GeoPackage: {len(routing_service.graph)} nodes[/green]")
    
    console.print(f"[bold]Starting routing service on {host}:{port}[/bold]")
    uvicorn.run(routing_app, host=host, port=port)


@app.command()
def serve_lost(
    gpkg: Path = typer.Argument(..., help="GeoPackage file with service boundaries"),
    host: str = typer.Option("0.0.0.0", "--host", help="Host to bind to"),
    port: int = typer.Option(8001, "--port", "-p", help="Port to bind to"),
):
    """Start the LoST (Location-to-Service Translation) service."""
    import uvicorn
    from .services import create_lost_app
    
    console.print(f"[bold]Loading LoST boundaries from {gpkg}...[/bold]")
    app = create_lost_app(gpkg)
    console.print(f"[bold]Starting LoST service on {host}:{port}[/bold]")
    uvicorn.run(app, host=host, port=port)


@app.command()
def export_graph(
    gpkg: Path = typer.Argument(..., help="Input GeoPackage"),
    output: Path = typer.Option(..., "--output", "-o", help="Output pickle file"),
):
    """Export routing graph from GeoPackage as pickle for fast service startup."""
    from .services.routing_api import RoutingService
    
    console.print(f"[bold]Building routing graph from {gpkg}...[/bold]")
    service = RoutingService()
    service.load_from_geopackage(gpkg)
    service.save_pickle(output)
    console.print(f"[green]Saved graph to {output} ({len(service.graph)} nodes, {service.graph.number_of_edges()} edges)[/green]")


@app.command()
def buildings_3d(
    input: Path = typer.Argument(..., help="Input GeoPackage with 2D buildings"),
    output: Path = typer.Option(..., "--output", "-o", help="Output GeoPackage with 3D buildings"),
    dem: Path | None = typer.Option(None, "--dem", help="DEM raster for ground elevation"),
):
    """Convert 2D buildings to 3D (Z-enabled) in a GeoPackage."""
    from .buildings import generate_buildings_3d, add_ground_elevation_to_parcels
    
    console.print(f"[bold]Loading buildings from {input}...[/bold]")
    buildings = gpd.read_file(input, layer="BuildingFootprint")
    parcels = gpd.read_file(input, layer="Parcel")
    
    if dem:
        console.print(f"[bold]Adding ground elevation from DEM...[/bold]")
        parcels = add_ground_elevation_to_parcels(parcels, dem)
    
    console.print(f"[bold]Generating 3D buildings...[/bold]")
    from .config import load_town_spec
    spec = load_town_spec("config/town_spec.yaml")  # TODO: read from metadata layer
    from .seeding import SeedState
    seed_state = SeedState.from_master(42)
    
    buildings_3d = generate_buildings_3d(buildings, spec, seed_state)
    
    # Export
    import pyogrio
    pyogrio.write_dataframe(buildings_3d, output, layer="Building3D", driver="GPKG")
    console.print(f"[green]3D buildings written to {output}[/green]")


if __name__ == "__main__":
    app()