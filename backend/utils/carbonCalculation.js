import Species from '../models/Species.js';

const DEFAULT_FACTORS = {
  avgBiomassPerTreeKg: 50,
  carbonFraction: 0.48,
  co2eqFactor: 3.67,
};

const KG_TO_TON = 0.001;

/**
 * Calculate carbon based on tree count and species-specific factors, OR 
 * using granular MRV data if available (SIH Data Parity).
 */
export async function calculateCarbon(treeCount, speciesName = null, mrvData = null) {
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

  let biomassTon, carbonTon, co2eqTon;

  if (mrvData && mrvData.biomass) {
    // Priority: Use granular MRV data (SIH Requirement)
    const b = mrvData.biomass;
    const totalAboveBelow = (parseFloat(b.aboveGround) || 0) + (parseFloat(b.belowGround) || 0);
    const totalNecromass = (parseFloat(b.deadWood) || 0) + (parseFloat(b.litter) || 0);
    const totalSOC = (parseFloat(b.soilOrganicCarbon0_30) || 0) + (parseFloat(b.soilOrganicCarbon30_100) || 0);

    biomassTon = totalAboveBelow + totalNecromass;
    // Carbon calculation includes SOC as it is a major part of Blue Carbon (SIH Spec)
    carbonTon = (biomassTon * factors.carbonFraction) + totalSOC;
    co2eqTon = carbonTon * factors.co2eqFactor;
    
  } else {
    // Fallback: Tree count based estimate
    const biomassKg = (parseInt(treeCount) || 0) * factors.avgBiomassPerTreeKg;
    biomassTon = biomassKg * KG_TO_TON;
    carbonTon = biomassTon * factors.carbonFraction;
    co2eqTon = carbonTon * factors.co2eqFactor;
  }

  const tokens = co2eqTon;

  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(tokens * 1000) / 1000,
    avgBiomassPerTree: factors.avgBiomassPerTreeKg,
    scientificFactors: factors,
    calculationMethod: mrvData?.biomass ? 'Granular_MRV' : 'Tree_Count_Estimate',
  };
}

// Configurable variant for admin overrides
export async function calculateCarbonWithConfig(treeCount, config, mrvData = null) {
  const factors = {
    avgBiomassPerTreeKg: config?.avgBiomassPerTreeKg || DEFAULT_FACTORS.avgBiomassPerTreeKg,
    carbonFraction: config?.carbonFraction ?? DEFAULT_FACTORS.carbonFraction,
    co2eqFactor: config?.co2eqFactor ?? DEFAULT_FACTORS.co2eqFactor,
  };

  let biomassTon, carbonTon, co2eqTon;

  if (mrvData && mrvData.biomass) {
    const b = mrvData.biomass;
    const totalAboveBelow = (parseFloat(b.aboveGround) || 0) + (parseFloat(b.belowGround) || 0);
    const totalNecromass = (parseFloat(b.deadWood) || 0) + (parseFloat(b.litter) || 0);
    const totalSOC = (parseFloat(b.soilOrganicCarbon0_30) || 0) + (parseFloat(b.soilOrganicCarbon30_100) || 0);

    biomassTon = totalAboveBelow + totalNecromass;
    carbonTon = (biomassTon * factors.carbonFraction) + totalSOC;
    co2eqTon = carbonTon * factors.co2eqFactor;
  } else {
    const biomassKg = treeCount * factors.avgBiomassPerTreeKg;
    biomassTon = biomassKg * KG_TO_TON;
    carbonTon = biomassTon * factors.carbonFraction;
    co2eqTon = carbonTon * factors.co2eqFactor;
  }

  return {
    biomass: Math.round(biomassTon * 1000) / 1000,
    carbon: Math.round(carbonTon * 1000) / 1000,
    co2eq: Math.round(co2eqTon * 1000) / 1000,
    tokens: Math.round(co2eqTon * 1000) / 1000,
    avgBiomassPerTree: factors.avgBiomassPerTreeKg,
    calculationMethod: mrvData?.biomass ? 'Granular_MRV' : 'Tree_Count_Estimate',
  };
}
