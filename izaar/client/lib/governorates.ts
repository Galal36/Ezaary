/**
 * Egyptian Governorates with 3-Tier Zonal Delivery System
 * 
 * Tier 1 (Close) - Fee: 60 EGP
 * Tier 2 (Far) - Fee: 100 EGP
 * Tier 3 (Very Far) - Fee: 120 EGP
 */

export interface Governorate {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  shippingCost: number;
}

export const egyptianGovernorates: Governorate[] = [
  // Tier 1 (Close) - 60 EGP
  { id: "cairo", name: "القاهرة", tier: 1, shippingCost: 60 },
  { id: "giza", name: "الجيزة", tier: 1, shippingCost: 60 },
  { id: "qalyubia", name: "القليوبية", tier: 1, shippingCost: 60 },
  { id: "beni-suef", name: "بني سويف", tier: 1, shippingCost: 60 },
  { id: "damietta", name: "دمياط", tier: 1, shippingCost: 60 },

  // Tier 2 (Far) - 100 EGP
  { id: "alexandria", name: "الإسكندرية", tier: 2, shippingCost: 100 },
  { id: "ismailia", name: "الإسماعيلية", tier: 2, shippingCost: 100 },
  { id: "beheira", name: "البحيرة", tier: 2, shippingCost: 100 },
  { id: "dakahlia", name: "الدقهلية", tier: 2, shippingCost: 100 },
  { id: "suez", name: "السويس", tier: 2, shippingCost: 100 },
  { id: "sharqia", name: "الشرقية", tier: 2, shippingCost: 100 },
  { id: "gharbia", name: "الغربية", tier: 2, shippingCost: 100 },
  { id: "faiyum", name: "الفيوم", tier: 2, shippingCost: 100 },
  { id: "monufia", name: "المنوفية", tier: 2, shippingCost: 100 },
  { id: "port-said", name: "بورسعيد", tier: 2, shippingCost: 100 },
  { id: "kafr-el-sheikh", name: "كفر الشيخ", tier: 2, shippingCost: 100 },
  { id: "minya", name: "المنيا", tier: 2, shippingCost: 100 },
  { id: "assiut", name: "أسيوط", tier: 2, shippingCost: 100 },
  { id: "red-sea", name: "البحر الأحمر", tier: 2, shippingCost: 100 },
  { id: "sohag", name: "سوهاج", tier: 2, shippingCost: 100 },

  // Tier 3 (Very Far) - 120 EGP
  { id: "qena", name: "قنا", tier: 3, shippingCost: 120 },
  { id: "luxor", name: "الأقصر", tier: 3, shippingCost: 120 },
  { id: "aswan", name: "أسوان", tier: 3, shippingCost: 120 },
  { id: "matrouh", name: "مطروح", tier: 3, shippingCost: 120 },
  { id: "new-valley", name: "الوادي الجديد", tier: 3, shippingCost: 120 },
  { id: "south-sinai", name: "جنوب سيناء", tier: 3, shippingCost: 120 },
  { id: "north-sinai", name: "شمال سيناء", tier: 3, shippingCost: 120 },
];

/**
 * Get shipping cost for a governorate by name
 */
export function getShippingCostByName(governorateName: string): number {
  const governorate = egyptianGovernorates.find(g => g.name === governorateName);
  return governorate?.shippingCost || 100; // Default to Tier 2 if not found
}

/**
 * Get governorate by name
 */
export function getGovernorateByName(governorateName: string): Governorate | undefined {
  return egyptianGovernorates.find(g => g.name === governorateName);
}

/**
 * Sort governorates alphabetically in Arabic
 */
export const sortedGovernorates = [...egyptianGovernorates].sort((a, b) =>
  a.name.localeCompare(b.name, 'ar')
);

