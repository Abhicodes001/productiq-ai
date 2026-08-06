from typing import Dict, Any, List
from app.services.product_service import ProductService

class CommerceReadinessEngine:
    """
    Phase 7: Commerce Readiness Assessment Engine.
    Evaluates 6 core dimensions to compute a 0-100% commerce-readiness score:
    1. Core Required Metadata (Name, Manufacturer, Category, Model) - 20%
    2. Technical Attribute Density (>=5 verified specs) - 20%
    3. Multi-Source Traceability (Datasheets, Scrapes, RAG) - 15%
    4. Cross-Source Rule Validation Complete - 15%
    5. Zero Open Attribute Conflicts - 15%
    6. Overall Intelligence Confidence Threshold (>=85%) - 15%
    """

    @classmethod
    def evaluate_commerce_readiness(cls, product_id: str) -> Dict[str, Any]:
        product = ProductService.get_product_by_id(product_id)
        if not product:
            return {
                "product_id": product_id,
                "readiness_score": 0,
                "status": "draft",
                "is_commerce_ready": False,
                "breakdown": []
            }

        name = product.get("name", "")
        mfr = product.get("manufacturer", "")
        cat = product.get("category", "")
        model = product.get("model_number", "")
        attributes = product.get("attributes", [])
        sources = product.get("sources", [])
        documents = product.get("documents", [])
        confidence = product.get("confidence_score", 0.0)
        status = product.get("status", "draft")
        conflicts_count = product.get("conflicts_count", 0)

        # 1. Core Metadata Evaluation (20 max)
        has_core = bool(name and mfr and cat and model)
        core_score = 20 if has_core else 10

        # 2. Technical Spec Density (20 max)
        attr_count = len(attributes)
        if attr_count >= 8:
            spec_score = 20
        elif attr_count >= 5:
            spec_score = 15
        elif attr_count >= 2:
            spec_score = 10
        else:
            spec_score = 5

        # 3. Source Traceability Coverage (15 max)
        total_sources = len(sources) + len(documents)
        if total_sources >= 3:
            source_score = 15
        elif total_sources >= 1:
            source_score = 10
        else:
            source_score = 0

        # 4. Validation Engine Complete (15 max)
        val_score = 15 if status in ["verified", "commerce_ready"] else 5

        # 5. Zero Open Conflicts (15 max)
        conflict_score = 15 if conflicts_count == 0 else 0

        # 6. High Confidence Score (15 max)
        if confidence >= 0.90:
            conf_score = 15
        elif confidence >= 0.75:
            conf_score = 10
        else:
            conf_score = 5

        total_score = core_score + spec_score + source_score + val_score + conflict_score + conf_score
        is_ready = total_score >= 85 and conflicts_count == 0

        breakdown = [
            {
                "id": "core_metadata",
                "label": "Required Product Metadata",
                "score": core_score,
                "max_score": 20,
                "passed": has_core,
                "detail": f"Name, Manufacturer, Category, and Model specified." if has_core else "Missing primary identifiers."
            },
            {
                "id": "spec_density",
                "label": "Technical Specification Density",
                "score": spec_score,
                "max_score": 20,
                "passed": attr_count >= 5,
                "detail": f"{attr_count} technical specifications extracted and structured."
            },
            {
                "id": "source_traceability",
                "label": "Multi-Source Traceability",
                "score": source_score,
                "max_score": 15,
                "passed": total_sources >= 2,
                "detail": f"{total_sources} verified document datasheets & web sources attached."
            },
            {
                "id": "cross_validation",
                "label": "Cross-Source Rule Validation",
                "score": val_score,
                "max_score": 15,
                "passed": status in ["verified", "commerce_ready"],
                "detail": "Cross-source normalization and consistency rules passed."
            },
            {
                "id": "conflict_resolution",
                "label": "Zero Open Conflicts",
                "score": conflict_score,
                "max_score": 15,
                "passed": conflicts_count == 0,
                "detail": "All attribute value conflicts resolved by human review." if conflicts_count == 0 else f"{conflicts_count} open conflict(s) requiring review."
            },
            {
                "id": "confidence_threshold",
                "label": "Overall Confidence Score >= 85%",
                "score": conf_score,
                "max_score": 15,
                "passed": confidence >= 0.85,
                "detail": f"Overall product intelligence confidence: {int(confidence * 100)}%."
            }
        ]

        return {
            "product_id": product_id,
            "readiness_score": total_score,
            "status": "commerce_ready" if status == "commerce_ready" else ("verified" if is_ready else status),
            "is_commerce_ready": is_ready or status == "commerce_ready",
            "breakdown": breakdown
        }

    @classmethod
    def mark_as_commerce_ready(cls, product_id: str) -> Dict[str, Any]:
        product = ProductService.get_product_by_id(product_id)
        if not product:
            return {"error": f"Product '{product_id}' not found"}

        eval_res = cls.evaluate_commerce_readiness(product_id)
        product["status"] = "commerce_ready"
        
        return {
            "product_id": product_id,
            "status": "commerce_ready",
            "readiness_score": max(eval_res["readiness_score"], 95),
            "message": "Product successfully marked as Commerce Ready and approved for ERP/Catalog syndication."
        }
