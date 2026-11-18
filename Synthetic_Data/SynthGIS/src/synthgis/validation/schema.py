"""
Schema validation for NENA field compliance.

Validates that all required fields are present and contain valid values
per NENA-STA-006.3 and CLDXF-US domains.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

import geopandas as gpd

from ..config import TownSpec


@dataclass(slots=True)
class SchemaIssue:
    """Schema validation issue."""
    layer: str
    field: str
    issue_type: Literal["missing_required", "invalid_domain", "invalid_format", "null_value"]
    severity: Literal["error", "warning"]
    feature_id: str | int
    description: str
    value: Any = None


@dataclass(slots=True)
class SchemaReport:
    """Schema validation report."""
    issues: list[SchemaIssue] = field(default_factory=list)

    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "error")

    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "warning")

    def add_issue(self, issue: SchemaIssue) -> None:
        self.issues.append(issue)

    def to_dict(self) -> dict[str, Any]:
        return {
            "summary": {
                "total_issues": len(self.issues),
                "errors": self.error_count,
                "warnings": self.warning_count,
            },
            "issues": [
                {
                    "layer": i.layer,
                    "field": i.field,
                    "type": i.issue_type,
                    "severity": i.severity,
                    "feature_id": i.feature_id,
                    "description": i.description,
                    "value": str(i.value) if i.value is not None else None,
                }
                for i in self.issues
            ],
        }


# NENA Field Definitions
NENA_SCHEMA = {
    "RoadCenterLine": {
        "required": [
            "NGUID", "St_Name", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "RoadClass": ["I", "US", "SH", "CO", "LO", "PV", "RA"],
            "OneWay": ["B", "FT", "TF"],
            "Parity_L": ["E", "O", "B", "Z"],
            "Parity_R": ["E", "O", "B", "Z"],
            "St_PreDir": ["N", "S", "E", "W", "NE", "NW", "SE", "SW"],
            "St_PosDir": ["N", "S", "E", "W", "NE", "NW", "SE", "SW"],
        },
        "field_types": {
            "NGUID": "string",
            "St_Name": "string",
            "State": "string(2)",
            "County": "string",
            "DateUpdate": "datetime",
            "FromAddr_L": "integer",
            "ToAddr_L": "integer",
            "FromAddr_R": "integer",
            "ToAddr_R": "integer",
            "SpeedLimit": "integer",
            "Lanes": "integer",
        },
    },
    "SiteStructureAddressPoint": {
        "required": [
            "NGUID", "AddNum", "St_Name", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "PlaceType": ["S", "ST", "B", "U"],
            "Placement": ["CEN", "ENT", "STR", "PAR"],
            "St_PreDir": ["N", "S", "E", "W", "NE", "NW", "SE", "SW"],
            "St_PosDir": ["N", "S", "E", "W", "NE", "NW", "SE", "SW"],
        },
        "field_types": {
            "NGUID": "string",
            "AddNum": "integer",
            "St_Name": "string",
            "State": "string(2)",
            "County": "string",
            "DateUpdate": "datetime",
        },
    },
    "PsapPolygon": {
        "required": [
            "NGUID", "Name", "ServiceURN", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "ServiceURN": ["urn:emergency:service:sos.psap"],
        },
    },
    "FirePolygon": {
        "required": [
            "NGUID", "Name", "ServiceURN", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "ServiceURN": ["urn:emergency:service:sos.fire"],
        },
    },
    "PolicePolygon": {
        "required": [
            "NGUID", "Name", "ServiceURN", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "ServiceURN": ["urn:emergency:service:sos.police"],
        },
    },
    "EmsPolygon": {
        "required": [
            "NGUID", "Name", "ServiceURN", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "ServiceURN": ["urn:emergency:service:sos.ems"],
        },
    },
    "ProvisioningPolygon": {
        "required": [
            "NGUID", "Name", "ServiceURN", "State", "County", "DateUpdate", "geom"
        ],
        "domains": {
            "ServiceURN": ["urn:emergency:service:sos.provisioning"],
        },
    },
}


class SchemaValidator:
    """Validates layer schemas against NENA requirements."""

    def __init__(self, spec: TownSpec):
        self.spec = spec
        self.report = SchemaReport()

    def validate_layer(self, layer_name: str, gdf: gpd.GeoDataFrame) -> list[SchemaIssue]:
        """Validate a single layer against NENA schema."""
        issues = []

        if layer_name not in NENA_SCHEMA:
            issues.append(SchemaIssue(
                layer=layer_name,
                field="*",
                issue_type="unknown_layer",
                severity="warning",
                feature_id="layer",
                description=f"No schema definition for layer: {layer_name}",
            ))
            return issues

        schema = NENA_SCHEMA[layer_name]

        # Check required fields
        for req_field in schema["required"]:
            if req_field not in gdf.columns:
                issues.append(SchemaIssue(
                    layer=layer_name,
                    field=req_field,
                    issue_type="missing_required",
                    severity="error",
                    feature_id="layer",
                    description=f"Required field '{req_field}' not in layer columns",
                ))
                continue

            # Check for nulls
            null_count = gdf[req_field].isna().sum()
            if null_count > 0:
                issues.append(SchemaIssue(
                    layer=layer_name,
                    field=req_field,
                    issue_type="null_value",
                    severity="error",
                    feature_id=f"{null_count} features",
                    description=f"Required field '{req_field}' has {null_count} null values",
                ))

        # Check domain values
        for field, valid_values in schema.get("domains", {}).items():
            if field not in gdf.columns:
                continue

            invalid = gdf[~gdf[field].isin(valid_values) & gdf[field].notna()]
            for _, row in invalid.iterrows():
                issues.append(SchemaIssue(
                    layer=layer_name,
                    field=field,
                    issue_type="invalid_domain",
                    severity="error",
                    feature_id=row.get("NGUID", row.get("rcl_id", row.get("point_id", "unknown"))),
                    description=f"Value '{row[field]}' not in valid domain: {valid_values}",
                    value=row[field],
                ))

        # Check field types (basic)
        for field, expected_type in schema.get("field_types", {}).items():
            if field not in gdf.columns:
                continue

            # Check integer fields
            if expected_type == "integer":
                non_int = gdf[field].dropna()
                if len(non_int) > 0:
                    try:
                        non_int.astype(int)
                    except (ValueError, TypeError):
                        issues.append(SchemaIssue(
                            layer=layer_name,
                            field=field,
                            issue_type="invalid_format",
                            severity="warning",
                            feature_id="multiple",
                            description=f"Field '{field}' contains non-integer values",
                        ))

        # NGUID format validation
        if "NGUID" in gdf.columns:
            for _, row in gdf.iterrows():
                nguid = row["NGUID"]
                if not isinstance(nguid, str) or not nguid.startswith("urn:emergency:uid:gid:"):
                    issues.append(SchemaIssue(
                        layer=layer_name,
                        field="NGUID",
                        issue_type="invalid_format",
                        severity="error",
                        feature_id=nguid,
                        description=f"NGUID format invalid: {nguid}",
                        value=nguid,
                    ))

        return issues

    def validate_all(self, layers: dict[str, gpd.GeoDataFrame]) -> SchemaReport:
        """Validate all layers."""
        self.report = SchemaReport()

        for layer_name, gdf in layers.items():
            issues = self.validate_layer(layer_name, gdf)
            for issue in issues:
                self.report.add_issue(issue)

        return self.report


def validate_schema_compliance(
    layers: dict[str, gpd.GeoDataFrame],
    spec: TownSpec,
) -> SchemaReport:
    """Convenience function to validate all layer schemas."""
    validator = SchemaValidator(spec)
    return validator.validate_all(layers)