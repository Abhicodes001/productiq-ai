import json
import csv
import io
from typing import Dict, Any, List
from app.services.product_service import ProductService
from app.services.knowledge_graph import KnowledgeGraphService
from app.services.commerce_readiness import CommerceReadinessEngine

class ExportService:
    """
    Phase 7: Standardized JSON & CSV Export Engine.
    Generates commerce-ready product structures for PIM, ERP, and e-commerce channels.
    """

    @classmethod
    def generate_commerce_ready_json(cls, product_id: str) -> Dict[str, Any]:
        product = ProductService.get_product_by_id(product_id)
        if not product:
            return {}

        kg = KnowledgeGraphService.get_product_knowledge_graph(product_id)
        readiness = CommerceReadinessEngine.evaluate_commerce_readiness(product_id)

        attributes_list = []
        for attr in product.get("attributes", []):
            attributes_list.append({
                "attribute_id": attr.get("id"),
                "name": attr.get("attribute_name", attr.get("key")),
                "key": attr.get("key"),
                "value": attr.get("value"),
                "unit": attr.get("unit"),
                "confidence_score": attr.get("confidence", 0.9),
                "verification_status": "verified" if attr.get("verified") else attr.get("status", "extracted"),
                "source_priority": attr.get("source_priority", 1),
                "evidence_text": attr.get("evidence_text")
            })

        sources_list = []
        for src in product.get("sources", []):
            sources_list.append({
                "source_id": src.get("id"),
                "source_name": src.get("source_name"),
                "source_type": src.get("source_type"),
                "source_url": src.get("source_url"),
                "reliability_score": src.get("reliability_score", 0.95)
            })

        for doc in product.get("documents", []):
            sources_list.append({
                "source_id": doc.get("id"),
                "source_name": doc.get("file_name"),
                "source_type": "pdf_document",
                "source_url": doc.get("file_path"),
                "reliability_score": 0.98
            })

        return {
            "schema_version": "1.0-commerce",
            "product_id": product.get("id"),
            "product_name": product.get("name"),
            "manufacturer": product.get("manufacturer"),
            "category": product.get("category"),
            "model_number": product.get("model_number", "N/A"),
            "description": product.get("description", ""),
            "confidence_score": product.get("confidence_score", 0.95),
            "verification_status": product.get("status", "verified"),
            "commerce_readiness_score": readiness.get("readiness_score", 90),
            "is_commerce_ready": readiness.get("is_commerce_ready", True),
            "attributes": attributes_list,
            "sources": sources_list,
            "relationships": {
                "total_relationships": kg.get("total_edges", 0),
                "nodes": kg.get("nodes", []),
                "edges": kg.get("edges", [])
            }
        }

    @classmethod
    def generate_flattened_csv(cls, product_ids: List[str]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        # Write Header
        writer.writerow([
            "Product ID",
            "Product Name",
            "Manufacturer",
            "Category",
            "Model Number",
            "Description",
            "Voltage",
            "Power",
            "RPM",
            "Material",
            "IP Rating",
            "Confidence Score",
            "Verification Status",
            "Commerce Readiness Score"
        ])

        for pid in product_ids:
            p = ProductService.get_product_by_id(pid)
            if not p:
                continue

            readiness = CommerceReadinessEngine.evaluate_commerce_readiness(pid)
            attrs = {a.get("key", "").lower(): a.get("value", "") for a in p.get("attributes", [])}

            writer.writerow([
                p.get("id"),
                p.get("name"),
                p.get("manufacturer"),
                p.get("category"),
                p.get("model_number", "N/A"),
                p.get("description", ""),
                attrs.get("supply voltage", attrs.get("voltage", attrs.get("input supply voltage", "N/A"))),
                attrs.get("power", attrs.get("nominal power", "N/A")),
                attrs.get("rpm", attrs.get("nominal speed", "N/A")),
                attrs.get("housing material", attrs.get("material", "N/A")),
                attrs.get("ip rating", attrs.get("ip protection rating", "N/A")),
                f"{int(p.get('confidence_score', 0.95) * 100)}%",
                p.get("status", "verified"),
                f"{readiness.get('readiness_score', 90)}%"
            ])

        return output.getvalue()
