const ExcelHandler = require('../utils/excelHandler');
const path = require('path');

// Initialize database handlers
const medicinesDB = new ExcelHandler('medicines.xlsx');

// Sample medicines with placeholder images
const sampleMedicines = [
  {
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    description: "Effective pain reliever and fever reducer. Used for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    price: 25,
    stock_quantity: 500,
    requires_prescription: false,
    expiry_date: "2026-12-31",
    manufacturer: "PharmaCorp",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop"
  },
  {
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    description: "Broad-spectrum antibiotic used to treat bacterial infections including pneumonia, bronchitis, and infections of the ear, nose, throat, skin, or urinary tract.",
    price: 120,
    stock_quantity: 200,
    requires_prescription: true,
    expiry_date: "2026-06-30",
    manufacturer: "MediLife",
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop"
  },
  {
    name: "Cetirizine 10mg",
    category: "Allergy",
    description: "Antihistamine for allergy relief. Treats symptoms like runny nose, sneezing, itchy or watery eyes, and itching of the nose or throat.",
    price: 45,
    stock_quantity: 300,
    requires_prescription: false,
    expiry_date: "2026-09-30",
    manufacturer: "AllerCare",
    image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop"
  },
  {
    name: "Omeprazole 20mg",
    category: "Gastric",
    description: "Reduces stomach acid production. Used to treat gastroesophageal reflux disease (GERD), ulcers, and other conditions involving excessive stomach acid.",
    price: 85,
    stock_quantity: 150,
    requires_prescription: false,
    expiry_date: "2026-08-31",
    manufacturer: "GastroMed",
    image_url: "https://images.unsplash.com/photo-1550572017-4a6c5d8f2f8e?w=400&h=400&fit=crop"
  },
  {
    name: "Metformin 500mg",
    category: "Diabetes",
    description: "Blood sugar control medication for type 2 diabetes. Helps control blood sugar levels and improves insulin sensitivity.",
    price: 95,
    stock_quantity: 180,
    requires_prescription: true,
    expiry_date: "2026-11-30",
    manufacturer: "DiabeCare",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop"
  },
  {
    name: "Aspirin 75mg",
    category: "Cardiovascular",
    description: "Low-dose aspirin for heart health. Used to prevent heart attacks and strokes in people at high risk.",
    price: 30,
    stock_quantity: 400,
    requires_prescription: false,
    expiry_date: "2027-01-31",
    manufacturer: "CardioHealth",
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop"
  },
  {
    name: "Vitamin D3 1000IU",
    category: "Vitamins",
    description: "Essential vitamin for bone health and immune system support. Helps the body absorb calcium.",
    price: 150,
    stock_quantity: 250,
    requires_prescription: false,
    expiry_date: "2027-03-31",
    manufacturer: "VitaLife",
    image_url: "https://images.unsplash.com/photo-1550572017-4a6c5d8f2f8e?w=400&h=400&fit=crop"
  },
  {
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    description: "Non-steroidal anti-inflammatory drug (NSAID) for pain, fever, and inflammation relief.",
    price: 40,
    stock_quantity: 350,
    requires_prescription: false,
    expiry_date: "2026-10-31",
    manufacturer: "PharmaCorp",
    image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop"
  },
  {
    name: "Azithromycin 500mg",
    category: "Antibiotics",
    description: "Macrolide antibiotic used to treat various bacterial infections including respiratory infections, skin infections, and sexually transmitted diseases.",
    price: 180,
    stock_quantity: 120,
    requires_prescription: true,
    expiry_date: "2026-07-31",
    manufacturer: "MediLife",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop"
  },
  {
    name: "Losartan 50mg",
    category: "Cardiovascular",
    description: "Blood pressure medication. Angiotensin receptor blocker (ARB) used to treat high blood pressure and protect kidneys from diabetes damage.",
    price: 110,
    stock_quantity: 200,
    requires_prescription: true,
    expiry_date: "2026-12-31",
    manufacturer: "CardioHealth",
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop"
  },
  {
    name: "Multivitamin Tablets",
    category: "Vitamins",
    description: "Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.",
    price: 200,
    stock_quantity: 300,
    requires_prescription: false,
    expiry_date: "2027-02-28",
    manufacturer: "VitaLife",
    image_url: "https://images.unsplash.com/photo-1550572017-4a6c5d8f2f8e?w=400&h=400&fit=crop"
  },
  {
    name: "Ranitidine 150mg",
    category: "Gastric",
    description: "H2 blocker that reduces stomach acid. Used to treat and prevent ulcers and manage GERD symptoms.",
    price: 65,
    stock_quantity: 180,
    requires_prescription: false,
    expiry_date: "2026-09-30",
    manufacturer: "GastroMed",
    image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop"
  }
];

async function populateData() {
  try {
    console.log('🚀 Starting to populate sample data...\n');

    // Clear existing medicines (optional - comment out if you want to keep existing data)
    console.log('📋 Clearing existing medicines...');
    const existingMedicines = medicinesDB.findAll();
    console.log(`   Found ${existingMedicines.length} existing medicines`);

    // Add sample medicines
    console.log('\n💊 Adding sample medicines...');
    let addedCount = 0;
    
    for (const medicine of sampleMedicines) {
      try {
        medicinesDB.create(medicine);
        addedCount++;
        console.log(`   ✅ Added: ${medicine.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to add ${medicine.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully added ${addedCount} medicines!`);
    console.log('\n📊 Database Summary:');
    console.log(`   Total Medicines: ${medicinesDB.findAll().length}`);
    
    console.log('\n🎉 Sample data population complete!');
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

// Run the population script
populateData();

