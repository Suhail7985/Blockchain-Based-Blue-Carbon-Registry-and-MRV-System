import Species from '../models/Species.js';

const DEFAULT_FACTORS = {
  avgBiomassPerTreeKg: 50,
  carbonFraction: 0.48,
  co2eqFactor: 3.67,
};

const KG_TO_TON = 0.001;

/**
 * Calculate carbon based on tree count and species-specific factors.
 * If speciesName is provided, it tries to look up factors from DB.
 */
export async function calculateCarbon(treeCount, speciesName = null) {
  let factors = { ...DEFAULT_FACTORS };

  if (speciesName) {
    const species = await Species.findOne({ name: speciesName }).lean();
    if (species) {
      factors = {
        avgBiomassPerTreeKg: species.avgBiomassPerTreeKg,
        carbonFraction: species.carbonFraction,
        co2eqFactor: species.co2eqFactor,
      };
    }
  }

  const biomassKg = treeCount * factors.avgBiomassPerTreeKg;
  const biomassTon = biomassKg * KG_TO_TON;
  const carbonTon = biomassTon * factors.carbonFraction;
  const co2eqTon = carbonTon * factors.co2eqFactor;
  const tokens = co2eqTon;

  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(tokens * 1000) / 1000,
    avgBiomassPerTree: factors.avgBiomassPerTreeKg,
    scientificFactors: factors,
  };
}

// Configurable variant for admin overrides
export function calculateCarbonWithConfig(treeCount, config) {
  const factors = {
    avgBiomassPerTreeKg: config?.avgBiomassPerTreeKg || DEFAULT_FACTORS.avgBiomassPerTreeKg,
    carbonFraction: config?.carbonFraction ?? DEFAULT_FACTORS.carbonFraction,
    co2eqFactor: config?.co2eqFactor ?? DEFAULT_FACTORS.co2eqFactor,
  };

  const biomassKg = treeCount * factors.avgBiomassPerTreeKg;
  const biomassTon = biomassKg * KG_TO_TON;
  const carbonTon = biomassTon * factors.carbonFraction;
  const co2eqTon = carbonTon * factors.co2eqFactor;

  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(co2eqTon * 1000) / 1000,
    avgBiomassPerTree: factors.avgBiomassPerTreeKg,
  };
}
