import mongoose from 'mongoose';
import Species from '../models/Species.js';
import config from '../config/config.js';

const speciesData = [
// ... (rest same)
  {
    name: 'Rhizophora mucronata',
    category: 'Mangrove',
    avgBiomassPerTreeKg: 156.4,
    carbonFraction: 0.48,
    co2eqFactor: 3.67,
    description: 'Loop-root mangrove, high carbon sequestration potential.',
    isActive: true
  },
  {
    name: 'Avicennia marina',
    category: 'Mangrove',
    avgBiomassPerTreeKg: 112.8,
    carbonFraction: 0.47,
    co2eqFactor: 3.67,
    description: 'Grey mangrove, very resilient and widely distributed.',
    isActive: true
  },
  {
    name: 'Enhalus acoroides',
    category: 'Seagrass',
    avgBiomassPerTreeKg: 0.85, 
    carbonFraction: 0.38,
    co2eqFactor: 3.67,
    description: 'Large seagrass species, significant sediment carbon storage.',
    isActive: true
  },
  {
    name: 'Bruguiera gymnorhiza',
    category: 'Mangrove',
    avgBiomassPerTreeKg: 134.2,
    carbonFraction: 0.48,
    co2eqFactor: 3.67,
    description: 'Large-leafed orange mangrove.',
    isActive: true
  }
];

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB for seeding...');
    
    await Species.deleteMany({});
    await Species.insertMany(speciesData);
    
    console.log('Successfully seeded 4 species.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
