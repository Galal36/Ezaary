"""
Shipping cost calculation utilities for Egyptian Governorates
3-Tier Zonal Delivery System
"""

# Tier 1 (Close) - Fee: 60 EGP
TIER_1_COST = 60
TIER_1_GOVERNORATES = [
    "القاهرة", "الجيزة", "القليوبية", "بني سويف", "دمياط"
]

# Tier 2 (Far) - Fee: 100 EGP
TIER_2_COST = 100
TIER_2_GOVERNORATES = [
    "المنيا", "أسيوط", "البحر الأحمر", "سوهاج", 
    "الإسكندرية", "الإسماعيلية", "البحيرة", "الدقهلية", 
    "السويس", "الشرقية", "الغربية", "الفيوم", 
    "المنوفية", "بورسعيد", "كفر الشيخ"
]

# Tier 3 (Very Far) - Fee: 120 EGP
TIER_3_COST = 120
TIER_3_GOVERNORATES = [
    "قنا", "الأقصر", "أسوان", "مطروح", "الوادي الجديد", 
    "جنوب سيناء", "شمال سيناء"
]

# All valid governorates
ALL_GOVERNORATES = TIER_1_GOVERNORATES + TIER_2_GOVERNORATES + TIER_3_GOVERNORATES


def get_shipping_cost(governorate: str) -> int:
    """
    Get shipping cost for a governorate based on tier
    
    Args:
        governorate: Name of the governorate in Arabic
        
    Returns:
        Shipping cost in EGP (60, 100, or 120)
        Defaults to Tier 2 (100 EGP) if governorate not found
    """
    # Normalize whitespace
    gov = governorate.strip()
    
    if gov in TIER_1_GOVERNORATES:
        return TIER_1_COST
    elif gov in TIER_2_GOVERNORATES:
        return TIER_2_COST
    elif gov in TIER_3_GOVERNORATES:
        return TIER_3_COST
    else:
        # Default to Tier 2 if governorate not recognized
        return TIER_2_COST


def is_valid_governorate(governorate: str) -> bool:
    """
    Check if a governorate is valid
    
    Args:
        governorate: Name of the governorate in Arabic
        
    Returns:
        True if valid, False otherwise
    """
    return governorate.strip() in ALL_GOVERNORATES


def get_governorate_tier(governorate: str) -> int:
    """
    Get the tier number for a governorate
    
    Args:
        governorate: Name of the governorate in Arabic
        
    Returns:
        Tier number (1, 2, or 3), defaults to 2 if not found
    """
    gov = governorate.strip()
    
    if gov in TIER_1_GOVERNORATES:
        return 1
    elif gov in TIER_2_GOVERNORATES:
        return 2
    elif gov in TIER_3_GOVERNORATES:
        return 3
    else:
        return 2  # Default tier

