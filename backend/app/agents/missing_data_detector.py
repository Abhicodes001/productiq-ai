from typing import List, Dict, Any

STANDARD_INDUSTRIAL_SPEC_TEMPLATES: Dict[str, List[Dict[str, str]]] = {
    "programmable logic controllers": [
        {"key": "Work Memory (Program)", "name": "Work Memory (Program)", "importance": "critical"},
        {"key": "Work Memory (Data)", "name": "Work Memory (Data)", "importance": "critical"},
        {"key": "Processing Time (Bit Operations)", "name": "Processing Time (Bit Operations)", "importance": "critical"},
        {"key": "PROFINET Interfaces", "name": "PROFINET Interfaces", "importance": "critical"},
        {"key": "Supply Voltage", "name": "Nominal Supply Voltage", "importance": "critical"},
        {"key": "Operating Temperature", "name": "Operating Temperature Range", "importance": "recommended"},
        {"key": "IP Rating", "name": "IP Protection Rating", "importance": "recommended"},
        {"key": "Dimensions (W x H x D)", "name": "Physical Dimensions", "importance": "optional"},
        {"key": "Weight", "name": "Net Weight", "importance": "optional"},
    ],
    "variable frequency drives": [
        {"key": "Nominal Power", "name": "Nominal Power Rating", "importance": "critical"},
        {"key": "Supply Voltage", "name": "Input Supply Voltage", "importance": "critical"},
        {"key": "Continuous Output Current", "name": "Continuous Output Current", "importance": "critical"},
        {"key": "Output Frequency Range", "name": "Output Frequency Range", "importance": "critical"},
        {"key": "Efficiency Rating", "name": "Energy Efficiency Rating", "importance": "recommended"},
        {"key": "Cooling Type", "name": "Cooling Method", "importance": "recommended"},
        {"key": "IP Rating", "name": "Enclosure IP Rating", "importance": "recommended"},
        {"key": "Operating Temperature", "name": "Ambient Operating Temp", "importance": "recommended"},
        {"key": "Enclosure Frame Size", "name": "Frame Size Code", "importance": "optional"},
    ],
    "process sensors & instrumentation": [
        {"key": "Nominal Diameter", "name": "Nominal Pipe Diameter", "importance": "critical"},
        {"key": "Max Process Temperature", "name": "Max Process Temperature", "importance": "critical"},
        {"key": "Max Operating Pressure", "name": "Max Operating Pressure", "importance": "critical"},
        {"key": "Output Signal", "name": "Analog/Digital Output Signal", "importance": "critical"},
        {"key": "Accuracy Class", "name": "Measurement Accuracy Class", "importance": "recommended"},
        {"key": "IP Rating", "name": "Enclosure IP Rating", "importance": "recommended"},
        {"key": "Wetted Parts Material", "name": "Wetted Parts Material", "importance": "recommended"},
        {"key": "Hazardous Area Certification", "name": "ATEX/IECEx Certification", "importance": "optional"},
    ],
    "industrial pumps": [
        {"key": "Max Flow Rate", "name": "Maximum Flow Rate (Q max)", "importance": "critical"},
        {"key": "Max Head", "name": "Maximum Head (H max)", "importance": "critical"},
        {"key": "Nominal Power", "name": "Motor Rating Power", "importance": "critical"},
        {"key": "Operating Pressure", "name": "Max Casing Working Pressure", "importance": "critical"},
        {"key": "Impeller Material", "name": "Impeller Material Grade", "importance": "recommended"},
        {"key": "IP Rating", "name": "Motor Enclosure IP Protection", "importance": "recommended"},
        {"key": "Operating Temperature", "name": "Fluid Operating Temp Range", "importance": "recommended"},
        {"key": "Weight", "name": "Gross Weight", "importance": "optional"},
    ],
    "air compressors": [
        {"key": "Free Air Delivery", "name": "Free Air Delivery (FAD)", "importance": "critical"},
        {"key": "Working Pressure", "name": "Max Working Pressure", "importance": "critical"},
        {"key": "Motor Power", "name": "Nominal Motor Rating", "importance": "critical"},
        {"key": "Noise Level", "name": "Sound Pressure Level", "importance": "recommended"},
        {"key": "Cooling Method", "name": "Cooling System Type", "importance": "recommended"},
        {"key": "Operating Temperature", "name": "Ambient Temp Range", "importance": "recommended"},
        {"key": "Weight", "name": "Total Weight", "importance": "optional"},
    ],
    "default": [
        {"key": "Nominal Supply Voltage", "name": "Nominal Supply Voltage", "importance": "critical"},
        {"key": "Operating Temperature", "name": "Operating Temperature", "importance": "recommended"},
        {"key": "IP Rating", "name": "IP Protection Rating", "importance": "recommended"},
        {"key": "Housing Material", "name": "Housing Material", "importance": "recommended"},
        {"key": "Weight", "name": "Weight", "importance": "optional"},
        {"key": "Warranty Period", "name": "Warranty Period", "importance": "optional"},
    ]
}

class MissingDataDetector:
    """
    Identifies missing product attributes by comparing extracted specifications
    against category-specific domain schemas.
    """

    @classmethod
    def detect_missing_attributes(
        cls, category: str, existing_attributes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        cat_key = category.lower().strip() if category else "default"
        template = STANDARD_INDUSTRIAL_SPEC_TEMPLATES.get(cat_key, STANDARD_INDUSTRIAL_SPEC_TEMPLATES["default"])

        existing_keys = {
            attr.get("key", "").lower().strip(): attr
            for attr in existing_attributes
            if attr.get("key")
        }

        missing_items = []
        extracted_count = 0

        for req in template:
            rkey = req["key"].lower().strip()
            # Check direct or partial match
            found = any(rkey in ekey or ekey in rkey for ekey in existing_keys.keys())

            if found:
                extracted_count += 1
            else:
                missing_items.append({
                    "key": req["key"],
                    "attribute_name": req["name"],
                    "category": category,
                    "importance": req["importance"],
                    "reason": f"Missing from extracted product documentation."
                })

        return {
            "total_expected_specs": len(template),
            "extracted_specs_count": len(existing_attributes),
            "missing_specs_count": len(missing_items),
            "missing_attributes": missing_items
        }
