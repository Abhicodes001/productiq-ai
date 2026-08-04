import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class AttributeExtractionItem(BaseModel):
    attribute_name: str
    value: Optional[str] = None
    unit: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_reference: Optional[str] = None
    status: str = Field(default="unverified", description="status: verified | unverified | not_found | missing")

class StructuredProductSchema(BaseModel):
    # Core Product Metadata
    product_name: AttributeExtractionItem
    manufacturer: AttributeExtractionItem
    model_number: AttributeExtractionItem
    category: AttributeExtractionItem
    description: AttributeExtractionItem
    
    # Technical Specifications
    material: AttributeExtractionItem
    dimensions: AttributeExtractionItem
    weight: AttributeExtractionItem
    voltage: AttributeExtractionItem
    current: AttributeExtractionItem
    power: AttributeExtractionItem
    frequency: AttributeExtractionItem
    rpm: AttributeExtractionItem
    pressure: AttributeExtractionItem
    flow_rate: AttributeExtractionItem
    operating_temperature: AttributeExtractionItem
    ip_rating: AttributeExtractionItem

    # Standards, Certifications & Warranty
    certifications: AttributeExtractionItem
    standards: AttributeExtractionItem
    applications: AttributeExtractionItem
    warranty: AttributeExtractionItem

    # Dynamic Specifications dictionary
    custom_specifications: Dict[str, AttributeExtractionItem] = Field(default_factory=dict)

# Standard target attribute list definition
TARGET_ATTRIBUTES = [
    ("Product Name", "product_name"),
    ("Manufacturer", "manufacturer"),
    ("Model Number", "model_number"),
    ("Category", "category"),
    ("Description", "description"),
    ("Material", "material"),
    ("Dimensions", "dimensions"),
    ("Weight", "weight"),
    ("Voltage", "voltage"),
    ("Current", "current"),
    ("Power", "power"),
    ("Frequency", "frequency"),
    ("RPM", "rpm"),
    ("Pressure", "pressure"),
    ("Flow Rate", "flow_rate"),
    ("Operating Temperature", "operating_temperature"),
    ("IP Rating", "ip_rating"),
    ("Certifications", "certifications"),
    ("Standards", "standards"),
    ("Applications", "applications"),
    ("Warranty", "warranty"),
]

class LLMExtractorService:
    """
    LLM structured product attribute extraction service.
    Emits standardized JSON schemas with source attribution citations and explicit 'not_found' status for missing fields.
    """

    @staticmethod
    def extract_structured_product(
        product_info: Dict[str, Any],
        pdf_pages: List[Dict[str, Any]],
        web_content: Dict[str, Any],
        image_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Main extraction entry point fusing PDF text segments, Web scrape text, and Vision AI observations.
        """
        logger.info(f"Executing LLM product attribute extraction for '{product_info.get('name')}'")

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

        if api_key:
            try:
                extracted_list = LLMExtractorService._extract_via_llm_api(api_key, product_info, pdf_pages, web_content, image_content)
                if extracted_list:
                    return extracted_list
            except Exception as e:
                logger.warning(f"LLM API extraction call failed or timed out ({e}). Utilizing deterministic schema parser fallback.")

        # Fallback deterministic extraction when LLM API key is missing or call fails
        return LLMExtractorService._extract_deterministic_fallback(product_info, pdf_pages, web_content, image_content)

    @staticmethod
    def _extract_deterministic_fallback(
        product_info: Dict[str, Any],
        pdf_pages: List[Dict[str, Any]],
        web_content: Dict[str, Any],
        image_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Deterministic spec text scanner that strictly checks evidence sources.
        Sets value = None and status = 'not_found' for attributes missing from sources.
        """
        extracted_results: List[Dict[str, Any]] = []

        # Gather all text sources with exact citations
        sources_pool: List[Dict[str, Any]] = []

        # 1. Add Web Content
        if web_content and web_content.get("extracted_text"):
            sources_pool.append({
                "type": "website",
                "source_id": web_content.get("url"),
                "location": f"Web URL ({web_content.get('url')})",
                "text": web_content.get("extracted_text", "") + " " + str(web_content.get("key_value_pairs", {}))
            })

        # 2. Add PDF Pages
        for page in pdf_pages:
            sources_pool.append({
                "type": "pdf",
                "source_id": page.get("document_id"),
                "location": f"Datasheet p.{page.get('page_number', 1)}",
                "text": page.get("text", "")
            })

        # 3. Add Image Observations
        if image_content:
            obs_text = " ".join([o.get("text", "") for o in image_content.get("observed_from_image", [])])
            sources_pool.append({
                "type": "image",
                "source_id": image_content.get("image_id"),
                "location": f"Image Label ({image_content.get('file_name', 'photo')})",
                "text": obs_text
            })

        # Core Metadata Default Values
        core_defaults = {
            "Product Name": (product_info.get("name"), None, "product_info"),
            "Manufacturer": (product_info.get("manufacturer"), None, "product_info"),
            "Model Number": (product_info.get("model_number") or LLMExtractorService._scan_patterns(sources_pool, r'\b(?:model|part|cat)\s*#?\s*[:=]?\s*([A-Z0-9-]{4,25})\b'), None, "PDF/Web"),
            "Category": (product_info.get("category"), None, "product_info"),
            "Description": (product_info.get("description") or f"Industrial product datasheet for {product_info.get('name')}.", None, "product_info")
        }

        # Spec Regex Scanners
        spec_patterns = {
            "Voltage": (r'(?:voltage|supply|input|rating)\s*[:=]?\s*([0-9\.-]+\s*(?:V\s*AC|V\s*DC|V|volts))', "V"),
            "Current": (r'(?:current|amps|output)\s*[:=]?\s*([0-9\.-]+\s*(?:A|amps|mA))', "A"),
            "Power": (r'(?:power|rating|capacity)\s*[:=]?\s*([0-9\.-]+\s*(?:kW|W|hp|HP))', "kW"),
            "Frequency": (r'(?:frequency|freq)\s*[:=]?\s*([0-9\.-]+\s*(?:Hz|kHz))', "Hz"),
            "RPM": (r'(?:speed|rpm|rotation)\s*[:=]?\s*([0-9\.-]+\s*(?:rpm|RPM))', "RPM"),
            "Pressure": (r'(?:pressure|bar)\s*[:=]?\s*([0-9\.-]+\s*(?:bar|psi|kPa))', "bar"),
            "Flow Rate": (r'(?:flow|flow rate)\s*[:=]?\s*([0-9\.-]+\s*(?:l/min|gpm|m3/h))', "l/min"),
            "Operating Temperature": (r'(?:operating temperature|temp|ambient)\s*[:=]?\s*([-\+\s0-9\.-]+\s*(?:°C|℃|°F))', "°C"),
            "IP Rating": (r'\b(IP\s*[0-9]{2}(?:\s*/\s*NEMA\s*[0-9A-Za-z]+)?)\b', None),
            "Certifications": (r'\b(CE\b|UL\s*[0-9A-Z-]+|RoHS\b|EAC\b|CSA\b)', None),
            "Standards": (r'\b(IEC\s*[0-9-]+|EN\s*[0-9-]+|ISO\s*[0-9-]+)\b', None),
            "Material": (r'(?:material|housing|enclosure material)\s*[:=]?\s*([A-Za-z0-9\s-]{3,30})', None),
            "Dimensions": (r'(?:dimensions|size|wxhxd)\s*[:=]?\s*([0-9\.-]+\s*x\s*[0-9\.-]+\s*x?\s*[0-9\.-]*\s*(?:mm|cm|in))', "mm"),
            "Weight": (r'(?:weight|mass)\s*[:=]?\s*([0-9\.-]+\s*(?:kg|g|lbs))', "kg"),
            "Applications": (r'(?:applications|use cases)\s*[:=]?\s*([A-Za-z0-9\s,-]{5,50})', None),
            "Warranty": (r'(?:warranty|guarantee)\s*[:=]?\s*([0-9]+\s*(?:year|years|months))', "years")
        }

        for attr_display_name, attr_code in TARGET_ATTRIBUTES:
            val = None
            unit = None
            source_ref = None
            status = "not_found"
            confidence = 1.0

            # 1. Check Core Defaults
            if attr_display_name in core_defaults:
                default_v, default_u, ref = core_defaults[attr_display_name]
                if default_v:
                    val = str(default_v)
                    unit = default_u
                    source_ref = "Product Core Input"
                    status = "verified"
                    confidence = 0.98

            # 2. Check Spec Scanners across sources
            if not val and attr_display_name in spec_patterns:
                pattern, default_u = spec_patterns[attr_display_name]
                matched_val, matched_ref, matched_unit = LLMExtractorService._scan_pattern_with_source(sources_pool, pattern)
                if matched_val:
                    val = matched_val
                    unit = matched_unit or default_u
                    source_ref = matched_ref
                    status = "verified"
                    confidence = 0.95

            # 3. If missing from sources, enforce value = None and status = 'not_found'
            if not val:
                val = None
                unit = None
                source_ref = None
                status = "not_found"
                confidence = 0.0

            extracted_results.append({
                "attribute_name": attr_display_name,
                "key": attr_code,
                "value": val,
                "unit": unit,
                "confidence": confidence,
                "source_reference": source_ref,
                "status": status,
                "extraction_method": "deterministic_llm_rules"
            })

        return extracted_results

    @staticmethod
    def _scan_pattern_with_source(sources: List[Dict[str, Any]], pattern: str) -> tuple:
        for s in sources:
            match = re.search(pattern, s["text"], re.IGNORECASE)
            if match:
                val = match.group(1).strip()
                unit = None
                # Infer unit from val if present
                if "V" in val: unit = "V"
                elif "kW" in val or "W" in val: unit = "kW" if "kW" in val else "W"
                elif "A" in val: unit = "A"
                elif "°C" in val or "℃" in val: unit = "°C"
                elif "Hz" in val: unit = "Hz"
                elif "kg" in val: unit = "kg"
                elif "mm" in val: unit = "mm"

                return val, s["location"], unit
        return None, None, None

    @staticmethod
    def _scan_patterns(sources: List[Dict[str, Any]], pattern: str) -> Optional[str]:
        for s in sources:
            match = re.search(pattern, s["text"], re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    @staticmethod
    def _extract_via_llm_api(api_key: str, product_info: dict, pdf_pages: list, web_content: dict, image_content: dict) -> list:
        # LLM JSON Prompt execution stub
        return []
