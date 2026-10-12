// Fills your Atlas collection with sample restaurants so the site has something to show.
//   npm run seed            -> only seeds when the collection is empty
//   npm run seed -- --force -> wipes the collection first, then seeds
//
// Already imported the NYC restaurants dataset into Atlas? You do not need this file.
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');

const { MONGODB_URI } = process.env;
const DB_NAME = process.env.DB_NAME || 'dbRestaurants';
const force = process.argv.includes('--force');

// [name, borough, cuisine, building, street, zipcode]
const SPOTS = [
  ['Morris Park Bake Shop', 'Bronx', 'Bakery', '1007', 'Morris Park Ave', '10462'],
  ["Wendy'S", 'Brooklyn', 'Hamburgers', '469', 'Flatbush Avenue', '11225'],
  ['Starbucks Coffee', 'Manhattan', 'Café/Coffee/Tea', '1559', 'Second Avenue', '10028'],
  ["Olive'S", 'Manhattan', 'Bakery', '120', 'Prince Street', '10012'],
  ['Riviera Caterer', 'Brooklyn', 'American', '2780', 'Stillwell Avenue', '11224'],
  ["Murals On 54/Randolph's", 'Manhattan', 'American', '1', 'West 54 Street', '10019'],
  ['Gandhi', 'Manhattan', 'Indian', '345', 'East 6 Street', '10003'],
  ['Casa Verde', 'Queens', 'Mexican', '37-12', '74 Street', '11372'],
  ['Little Seoul Kitchen', 'Queens', 'Korean', '149-22', 'Northern Boulevard', '11354'],
  ['Harbor Lights Seafood', 'Staten Island', 'Seafood', '55', 'Bay Street', '10301'],
  ['Tony\'s Slice House', 'Staten Island', 'Pizza', '1520', 'Forest Avenue', '10302'],
  ['Bronx Brick Oven', 'Bronx', 'Pizza', '2342', 'Arthur Avenue', '10458'],
  ['La Bodega Dominicana', 'Bronx', 'Caribbean', '612', 'Southern Boulevard', '10455'],
  ['Spice Route', 'Queens', 'Indian', '73-10', 'Roosevelt Avenue', '11372'],
  ['Noodle Alley', 'Manhattan', 'Chinese', '28', 'Mott Street', '10013'],
  ['The Corner Deli', 'Brooklyn', 'Delicatessen', '210', 'Smith Street', '11201'],
  ['Brooklyn Bagel Co.', 'Brooklyn', 'Bagels/Pretzels', '88', 'Court Street', '11201'],
  ['Sakura Sushi Bar', 'Manhattan', 'Japanese', '14', 'East 45 Street', '10017'],
  ['Trattoria Nove', 'Brooklyn', 'Italian', '9', 'Bedford Avenue', '11211'],
  ['Parkside Grill', 'Queens', 'Steak', '107-01', 'Queens Boulevard', '11375'],
  ['Green Table', 'Manhattan', 'Vegetarian', '402', 'West 14 Street', '10014'],
  ['Pho Saigon', 'Queens', 'Vietnamese', '41-02', 'Main Street', '11355'],
  ['Cafe Lumiere', 'Brooklyn', 'French', '155', 'Atlantic Avenue', '11201'],
  ['Taqueria El Sol', 'Bronx', 'Mexican', '785', 'Grand Concourse', '10451'],
  ['Ferry Landing Cafe', 'Staten Island', 'American', '1', 'Richmond Terrace', '10301'],
  ['Mediterra', 'Manhattan', 'Mediterranean', '221', 'Columbus Avenue', '10023'],
  ['Skyline Diner', 'Queens', 'American', '31-01', 'Steinway Street', '11103'],
  ['Hot Pot House', 'Brooklyn', 'Chinese', '5812', '8 Avenue', '11220'],
  ['Sweet Crumb', 'Manhattan', 'Bakery', '66', 'Spring Street', '10012'],
  ['Island Jerk', 'Brooklyn', 'Caribbean', '1180', 'Nostrand Avenue', '11225'],
];

// Small deterministic random generator so every seed run gives the same data.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeGrades(seed) {
  const r = rng(seed * 7 + 11);
  const count = 4 + Math.floor(r() * 4); // 4 to 7 inspections
  const grades = [];
  let date = new Date('2014-03-20T00:00:00Z');
  for (let i = 0; i < count; i++) {
    const score = 3 + Math.floor(r() * 26);
    grades.push({ date: new Date(date), grade: score <= 13 ? 'A' : score <= 27 ? 'B' : 'C', score });
    date = new Date(date.getTime() - (150 + Math.floor(r() * 150)) * 24 * 3600 * 1000);
  }
  return grades;
}

async function run() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Copy .env.example to .env first.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const existing = await Restaurant.countDocuments();

  if (existing > 0 && !force) {
    console.log(`"${DB_NAME}" already has ${existing} restaurants. Nothing seeded. Use --force to replace them.`);
  } else {
    if (force) await Restaurant.deleteMany({});
    const docs = SPOTS.map(([name, borough, cuisine, building, street, zipcode], i) => ({
      name,
      borough,
      cuisine,
      address: { building, street, zipcode },
      grades: makeGrades(i + 1),
      restaurant_id: String(40000000 + i),
    }));
    await Restaurant.insertMany(docs);
    console.log(`Seeded ${docs.length} sample restaurants into "${DB_NAME}".`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
