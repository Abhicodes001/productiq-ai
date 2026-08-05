import re
from typing import Optional, Tuple, Dict, Any

# Unit Conversions to Standard SI Units for Comparison
UNIT_CONVERSION_FACTORS: Dict[str, Tuple[float, str]] = {
    # Power to kW
    "hp": (0.7457, "kW"),
    "kw": (1.0, "kW"),
    "w": (0.001, "kW"),
    "mw": (1000.0, "kW"),

    # Pressure to bar
    "bar": (1.0, "bar"),
    "psi": (0.0689476, "bar"),
    "kpa": (0.01, "bar"),
    "mpa": (10.0, "bar"),
    "atm": (1.01325, "bar"),

    # Flow Rate to m³/h
    "m³/h": (1.0, "m³/h"),
    "m3/h": (1.0, "m³/h"),
    "l/min": (0.06, "m³/h"),
    "l/s": (3.6, "m³/h"),
    "gpm": (0.227125, "m³/h"),

    # Speed to RPM
    "rpm": (1.0, "RPM"),
    "1/min": (1.0, "RPM"),
    "rev/min": (1.0, "RPM"),

    # Frequency to Hz
    "hz": (1.0, "Hz"),
    "khz": (1000.0, "Hz"),
}

class UnitNormalizer:
    """
    Normalizes numeric values and units for cross-source comparison.
    Example: 5 HP vs 3.73 kW are recognized as equivalent.
    """

    @classmethod
    def parse_numeric_with_unit(cls, text_val: str) -> Tuple[Optional[float], Optional[str]]:
        if not text_val:
            return None, None

        # Clean string
        clean = text_val.strip()

        # Match numbers (including decimals) and trailing unit
        match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z°³/]+)?", clean)
        if not match:
            return None, None

        try:
            val = float(match.group(1))
            unit = match.group(2).lower() if match.group(2) else None
            return val, unit
        except ValueError:
            return None, None

    @classmethod
    def normalize_value(cls, val_str: str) -> Tuple[Optional[float], Optional[str]]:
        num, unit = cls.parse_numeric_with_unit(val_str)
        if num is None or unit is None:
            return num, unit

        unit_key = unit.lower().strip()
        if unit_key in UNIT_CONVERSION_FACTORS:
            factor, std_unit = UNIT_CONVERSION_FACTORS[unit_key]
            return round(num * factor, 3), std_unit

        return num, unit

    @classmethod
    def are_equivalent(cls, val1_str: str, val2_str: str, tolerance: float = 0.05) -> bool:
        """
        Returns True if two attribute strings represent approximately the same physical quantity.
        """
        if not val1_str or not val2_str:
            return False

        # Exact text match ignore case & whitespace
        if val1_str.strip().lower() == val2_str.strip().lower():
            return True

        n1, u1 = cls.normalize_value(val1_str)
        n2, u2 = cls.normalize_value(val2_str)

        if n1 is not None and n2 is not None and u1 == u2 and u1 is not None:
            if n1 == 0 and n2 == 0:
                return True
            diff = abs(n1 - n2) / max(abs(n1), abs(n2))
            return diff <= tolerance

        return False
