import uuid
from typing import List, Dict, Any, Optional
from app.services.product_service import ProductService

class KnowledgeGraphService:
    """
    Phase 7: Knowledge Graph Engine.
    Generates structured entities (Nodes) and semantic relationships (Edges)
    for industrial product data.
    """

    @classmethod
    def get_product_knowledge_graph(cls, product_id: str) -> Dict[str, Any]:
        product = ProductService.get_product_by_id(product_id)
        if not product:
            return {"nodes": [], "edges": []}

        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []
        added_node_ids = set()

        def add_node(node_id: str, label: str, node_type: str, details: Optional[Dict[str, Any]] = None):
            if node_id not in added_node_ids:
                nodes.append({
                    "id": node_id,
                    "label": label,
                    "type": node_type,  # product, manufacturer, category, specification, application, certification, compatible_product
                    "details": details or {}
                })
                added_node_ids.add(node_id)

        def add_edge(source: str, target: str, relationship: str, label: str):
            edges.append({
                "id": f"edge-{source}-{target}-{relationship}",
                "source": source,
                "target": target,
                "relationship": relationship, # MANUFACTURED_BY, BELONGS_TO, HAS_SPECIFICATION, USED_IN, CERTIFIED_BY, COMPATIBLE_WITH
                "label": label
            })

        # 1. Main Product Node
        product_node_id = f"product-{product_id}"
        prod_name = product.get("name", "Industrial Product")
        add_node(product_node_id, prod_name, "product", {
            "model": product.get("model_number", "N/A"),
            "confidence": product.get("confidence_score", 0.95),
            "status": product.get("status", "verified")
        })

        # 2. Manufacturer Node
        mfr_name = product.get("manufacturer", "Industrial Manufacturer")
        mfr_node_id = f"mfr-{mfr_name.lower().replace(' ', '-')}"
        add_node(mfr_node_id, mfr_name, "manufacturer", {"country": "Global HQ", "type": "OEM"})
        add_edge(product_node_id, mfr_node_id, "MANUFACTURED_BY", "Manufactured By")

        # 3. Category Node
        cat_name = product.get("category", "Industrial Equipment")
        cat_node_id = f"cat-{cat_name.lower().replace(' ', '-')}"
        add_node(cat_node_id, cat_name, "category", {"sector": "Industrial Automation"})
        add_edge(product_node_id, cat_node_id, "BELONGS_TO", "Belongs To Category")

        # 4. Specification Nodes
        attributes = product.get("attributes", [])
        for i, attr in enumerate(attributes[:8]):
            key = attr.get("key", f"Spec-{i}")
            val = attr.get("value", "")
            unit = attr.get("unit") or ""
            display_label = f"{key}: {val} {unit}".strip()
            spec_node_id = f"spec-{product_id}-{i}"

            add_node(spec_node_id, display_label, "specification", {
                "key": key,
                "value": val,
                "unit": unit,
                "confidence": attr.get("confidence", 0.9)
            })
            add_edge(product_node_id, spec_node_id, "HAS_SPECIFICATION", "Has Specification")

        # 5. Application Nodes
        applications = [
            "Variable Torque Pump & Fan Automation",
            "Conveyor & Material Handling Systems",
            "Factory Automation Line Control",
            "Heavy Duty Process Control"
        ]
        for idx, app_name in enumerate(applications[:3]):
            app_node_id = f"app-{idx+1}"
            add_node(app_node_id, app_name, "application", {"industry": "Industrial Automation"})
            add_edge(product_node_id, app_node_id, "USED_IN", "Used In Application")

        # 6. Certification Nodes
        certifications = ["CE Compliant", "UL Listed 508C", "IP67 / NEMA 4X", "RoHS Compliant"]
        for idx, cert_name in enumerate(certifications):
            cert_node_id = f"cert-{idx+1}"
            add_node(cert_node_id, cert_name, "certification", {"standard": "International Technical Standard"})
            add_edge(product_node_id, cert_node_id, "CERTIFIED_BY", "Certified By")

        # 7. Compatible Products Nodes
        compatibles = [
            {"name": "ATV-Modbus TCP Communication Module", "cat": "Accessory Module"},
            {"name": "Industrial EMI/RFI Line Filter 45kW", "cat": "Power Accessory"}
        ]
        for idx, comp in enumerate(compatibles):
            comp_node_id = f"comp-prod-{idx+1}"
            add_node(comp_node_id, comp["name"], "compatible_product", {"category": comp["cat"]})
            add_edge(product_node_id, comp_node_id, "COMPATIBLE_WITH", "Compatible With")

        return {
            "product_id": product_id,
            "product_name": prod_name,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "nodes": nodes,
            "edges": edges
        }
