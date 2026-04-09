import { api } from './client';

// Villa pricing

interface VillaPricing {
  basePricePerNight: string;
  touristTaxPerNight: string;
  minNights: number;
  maxNights: number | null;
}

interface VillaResponse {
  data: VillaPricing & { id: number };
}

export async function fetchVillaPricing(): Promise<VillaPricing & { id: number }> {
  const res = await api<VillaResponse>('/api/villa');
  return res.data;
}

export async function updateVillaPricing(data: {
  basePricePerNight?: number;
  touristTaxPerNight?: number;
  minNights?: number;
  maxNights?: number | null;
}): Promise<void> {
  await api('/api/admin/villa', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Pricing rules

export interface PricingRule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
  minNights: number | null;
  priority: number;
  createdAt: string;
}

interface PricingRulesResponse {
  data: PricingRule[];
}

interface PricingRuleResponse {
  data: PricingRule;
}

export async function fetchPricingRules(): Promise<PricingRule[]> {
  const res = await api<PricingRulesResponse>('/api/admin/pricing-rules');
  return res.data;
}

export interface CreatePricingRuleInput {
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  minNights?: number | null;
  priority?: number;
}

export async function createPricingRule(data: CreatePricingRuleInput): Promise<PricingRule> {
  const res = await api<PricingRuleResponse>('/api/admin/pricing-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updatePricingRule(
  id: number,
  data: Partial<CreatePricingRuleInput>,
): Promise<PricingRule> {
  const res = await api<PricingRuleResponse>(`/api/admin/pricing-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deletePricingRule(id: number): Promise<void> {
  await api(`/api/admin/pricing-rules/${id}`, { method: 'DELETE' });
}
