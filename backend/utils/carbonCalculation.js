/**
 * Carbon calculation for verified plantations
 * Biomass = Tree Count × Avg Biomass per Tree
 * Carbon = Biomass × 0.48
 * CO₂eq = Carbon × 3.67
 * Tokens = CO₂eq (1 Token = 1 Ton CO₂eq)
 */
export const AVG_BIOMASS_PER_TREE_KG = 50; // kg per tree (configurable per species if needed)
const CARBON_FRACTION = 0.48;
const CO2EQ_FACTOR = 3.67;
const KG_TO_TON = 0.001;

export function calculateCarbon(treeCount, avgBiomassPerTreeKg = AVG_BIOMASS_PER_TREE_KG) {
  const biomassKg = treeCount * avgBiomassPerTreeKg;
  const biomassTon = biomassKg * KG_TO_TON;
  const carbonTon = biomassTon * CARBON_FRACTION;
  const co2eqTon = carbonTon * CO2EQ_FACTOR;
  const tokens = co2eqTon; // 1 token = 1 ton CO2eq
  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(tokens * 1000) / 1000,
    avgBiomassPerTree: avgBiomassPerTreeKg,
  };
}

// Configurable variant used with CarbonSettings
export function calculateCarbonWithConfig(treeCount, config) {
  const avgBiomass = config?.avgBiomassPerTreeKg || AVG_BIOMASS_PER_TREE_KG;
  const carbonFrac = config?.carbonFraction ?? CARBON_FRACTION;
  const co2Factor = config?.co2eqFactor ?? CO2EQ_FACTOR;
  const biomassKg = treeCount * avgBiomass;
  const biomassTon = biomassKg * KG_TO_TON;
  const carbonTon = biomassTon * carbonFrac;
  const co2eqTon = carbonTon * co2Factor;
  const tokens = co2eqTon;
  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(tokens * 1000) / 1000,
    avgBiomassPerTree: avgBiomass,
  };
}
