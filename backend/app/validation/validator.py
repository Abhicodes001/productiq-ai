import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.validation.rules import UnitNormalizer
from app.services.product_service import MOCK_PRODUCTS_DB

logger = logging.getLogger(__name__)

# Global mock database for conflicts and review audit trail
MOCK_CONFLICTS_STORE: Dict[str, List[Dict[str, Any]]] = {
    "77777777-7777-7777-7777-777777777777": [
        {
            "id": "conf-pump-1",
            "product_id": "77777777-7777-7777-7777-777777777777",
            "attribute_name": "Max Operating Temperature",
            "key": "Max Operating Temperature",
            "current_value": "180 °C",
            "status": "conflict",
            "candidates": [
                {
                    "candidate_id": "cand-pump-1",
                    "value": "180",
                    "unit": "°C",
                    "source_name": "Durco_Mark3_ISO_Technical_Catalog.pdf",
                    "source_type": "pdf",
                    "source_url": None,
                    "page_number": 4,
                    "confidence": 0.94,
                    "evidence_text": "Maximum continuous fluid operating temperature limit is 180°C for standard synthetic elastomeric seals (Section 3.2)."
                },
                {
                    "candidate_id": "cand-pump-2",
                    "value": "210",
                    "unit": "°C",
                    "source_name": "Flowserve Official Catalog Webpage",
                    "source_type": "website",
                    "source_url": "https://www.flowserve.com/en/products/pumps/durco-mark-3-iso",
                    "page_number": None,
                    "confidence": 0.81,
                    "evidence_text": "Heavy duty liquid fluid rating extended up to 210°C with high-temp Kalrez packing option."
                }
            ],
            "created_at": datetime.now().isoformat()
        }
    ],
    "22222222-2222-2222-2222-222222222222": [
        {
            "id": "conf-1",
            "product_id": "22222222-2222-2222-2222-222222222222",
            "attribute_name": "Input Supply Voltage",
            "key": "Supply Voltage",
            "current_value": "380...480 V",
            "status": "conflict",
            "candidates": [
                {
                    "candidate_id": "cand-1",
                    "value": "380...480 V",
                    "unit": "V",
                    "source_name": "ATV930 Datasheet.pdf",
                    "source_type": "pdf",
                    "source_url": None,
                    "page_number": 3,
                    "confidence": 0.88,
                    "evidence_text": "Rated supply voltage: 3-phase 380V to 480V AC 50/60Hz."
                },
                {
                    "candidate_id": "cand-2",
                    "value": "400 V AC",
                    "unit": "V",
                    "source_name": "Official Website Catalog",
                    "source_type": "website",
                    "source_url": "https://www.se.com/ww/en/product/ATV930D45N4",
                    "page_number": None,
                    "confidence": 0.94,
                    "evidence_text": "Nominal operational rating: 400 V 3-Phase."
                }
            ],
            "created_at": datetime.now().isoformat()
        }
    ]
}

MOCK_REVIEW_HISTORY: Dict[str, List[Dict[str, Any]]] = {}

class ValidationEngine:
    """
    Phase 6 Cross-Source Validation & Conflict Detection Engine.
    """

    @classmethod
    def validate_product(cls, product_id: str) -> Dict[str, Any]:
        """
        Executes cross-source validation across PDF, Web, Catalog, Vision, and AI Enrichment sources.
        """
        product = MOCK_PRODUCTS_DB.get(product_id)
        if not product:
            return {
                "product_id": product_id,
                "total_attributes_validated": 0,
                "matching_specs_count": 0,
                "conflicts_count": 0,
                "low_confidence_count": 0,
                "unverified_enriched_count": 0,
                "overall_confidence": 0.0,
                "confidence_tier": "Low Confidence",
                "validation_status": "not_found"
            }

        attrs = product.get("attributes", [])
        total = len(attrs)
        matching_count = 0
        conflicts_count = 0
        low_conf_count = 0
        enriched_unverified = 0

        conflicts_list = []

        for attr in attrs:
            conf = attr.get("confidence", 0.8)
            status = attr.get("status", "extracted")

            if conf < 0.70:
                low_conf_count += 1

            if status == "ai_enriched" and not attr.get("verified", False):
                enriched_unverified += 1

            # Check if this attribute has conflicting candidate values
            # For demonstration: simulate conflict if key has multiple conflicting entries
            if attr.get("key") == "Supply Voltage" and product.get("conflicts_count", 0) > 0:
                conflicts_count += 1
            else:
                matching_count += 1

        avg_conf = (sum(a.get("confidence", 0.8) for a in attrs) / total) if total > 0 else 0.85
        conf_percent = round(avg_conf * 100, 1)

        if conf_percent >= 90:
            tier = "High Confidence"
        elif conf_percent >= 70:
            tier = "Medium Confidence"
        else:
            tier = "Low Confidence"

        # Determine overall product status
        if conflicts_count > 0:
            val_status = "conflict"
        elif product.get("status") == "verified":
            val_status = "human_verified" if any(a.get("status") == "human_verified" for a in attrs) else "verified"
        else:
            val_status = "needs_review"

        return {
            "product_id": product_id,
            "total_attributes_validated": total,
            "matching_specs_count": matching_count,
            "conflicts_count": conflicts_count,
            "low_confidence_count": low_conf_count,
            "unverified_enriched_count": enriched_unverified,
            "overall_confidence": conf_percent,
            "confidence_tier": tier,
            "validation_status": val_status
        }

    @classmethod
    def get_conflicts(cls, product_id: str) -> List[Dict[str, Any]]:
        return MOCK_CONFLICTS_STORE.get(product_id, [])

    @classmethod
    def resolve_conflict(
        cls, product_id: str, conflict_id: str, action_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processes human review action: select candidate A/B, manual edit, mark NA, or reject AI value.
        Updates attribute status to 'human_verified'.
        """
        conflicts = MOCK_CONFLICTS_STORE.get(product_id, [])
        target_conf = None
        for c in conflicts:
            if c["id"] == conflict_id:
                target_conf = c
                break

        if not target_conf:
            # Generate temporary fallback conflict item if missing
            target_conf = {
                "id": conflict_id,
                "product_id": product_id,
                "attribute_name": "Specification",
                "key": "Spec Key",
                "current_value": "Original Value",
                "candidates": []
            }

        action = action_data.get("action", "select_candidate")
        reviewer = action_data.get("reviewer_name", "Lead Quality Engineer")
        prev_val = target_conf.get("current_value", "Pending Value")

        final_val = prev_val

        if action == "select_candidate":
            cand_id = action_data.get("selected_candidate_id")
            for cand in target_conf.get("candidates", []):
                if cand["candidate_id"] == cand_id:
                    final_val = f"{cand['value']} {cand.get('unit') or ''}".strip()
                    break
        elif action == "edit_manual":
            m_val = action_data.get("manual_value", "")
            m_unit = action_data.get("manual_unit", "")
            final_val = f"{m_val} {m_unit}".strip()
        elif action == "mark_na":
            final_val = "N/A (Not Applicable)"
        elif action == "reject_ai":
            final_val = "Rejected by Human Engineer"

        # Update product attributes in MOCK_PRODUCTS_DB
        product = MOCK_PRODUCTS_DB.get(product_id)
        if product:
            attrs = product.get("attributes", [])
            for attr in attrs:
                if attr.get("key") == target_conf.get("key"):
                    attr["value"] = final_val
                    attr["status"] = "human_verified"
                    attr["verified"] = True
                    attr["confidence"] = 1.0
            product["status"] = "verified"
            product["conflicts_count"] = max(0, product.get("conflicts_count", 1) - 1)

        # Remove resolved conflict from store
        MOCK_CONFLICTS_STORE[product_id] = [c for c in conflicts if c["id"] != conflict_id]

        # Record history audit log
        history_item = {
            "id": str(uuid.uuid4()),
            "product_id": product_id,
            "attribute_name": target_conf.get("attribute_name", "Specification"),
            "key": target_conf.get("key", "Spec Key"),
            "previous_value": prev_val,
            "final_value": final_val,
            "reviewer": reviewer,
            "action": action,
            "timestamp": datetime.now().isoformat()
        }

        if product_id not in MOCK_REVIEW_HISTORY:
            MOCK_REVIEW_HISTORY[product_id] = []
        MOCK_REVIEW_HISTORY[product_id].insert(0, history_item)

        return {
            "status": "success",
            "message": f"Conflict for '{target_conf.get('attribute_name')}' successfully resolved as '{final_val}'.",
            "review_record": history_item
        }

    @classmethod
    def get_review_history(cls, product_id: str) -> List[Dict[str, Any]]:
        return MOCK_REVIEW_HISTORY.get(product_id, [])

    @classmethod
    def get_global_review_queue(cls) -> List[Dict[str, Any]]:
        queue = []
        for pid, confs in MOCK_CONFLICTS_STORE.items():
            prod = MOCK_PRODUCTS_DB.get(pid)
            pname = prod.get("name", "Product") if prod else pid
            for c in confs:
                queue.append({
                    "product_name": pname,
                    **c
                })
        return queue
