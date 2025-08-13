require('dotenv').config();
const mongoose = require('mongoose');
const Train = require('./models/Train');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://deepak7550080013:apK0ilZbRaLdmHJW@cluster0.qdhpq6f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ;

const stationPool = [
  "Chennai", "Vellore", "Bangalore", "Mysuru", "Mangalore",
  "Coimbatore", "Hyderabad", "Pune", "Mumbai", "Delhi",
  "Kolkata", "Jaipur", "Ahmedabad", "Surat", "Patna",
  "Lucknow", "Kochi", "Goa", "Visakhapatnam", "Nagpur",
  "Madurai", "Trichy", "Guwahati", "Bhubaneswar", "Ranchi",
  "Shimoga", "Hubli", "Thiruvananthapuram", "Varanasi", "Indore"
];

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTime(startHour, endHour) {
  const minutes = rnd(startHour * 60, endHour * 60);
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB for seeding');

  await Train.deleteMany({});
  console.log('🗑️ Cleared Train collection');

  const trains = [];

  trains.push({
    name: "Express-1",
    stops: [
      { station: "Chennai", distanceFromPrev: 0, departureTime: "06:00" },
      { station: "Bangalore", distanceFromPrev: 350, departureTime: "11:00" },
      { station: "Mysuru", distanceFromPrev: 150, departureTime: "14:00" }
    ],
    cumulativeDistances: [0, 350, 500]
  });

  trains.push({
    name: "Express-2",
    stops: [
      { station: "Bangalore", distanceFromPrev: 0, departureTime: "09:00" },
      { station: "Hyderabad", distanceFromPrev: 570, departureTime: "17:00" },
      { station: "Mumbai", distanceFromPrev: 700, departureTime: "06:00" }
    ],
    cumulativeDistances: [0, 570, 1270]
  });

  for (let t = 3; t <= 50; t++) {
    const stopsCount = rnd(3, 6);
    const shuffled = [...stationPool].sort(() => Math.random() - 0.5);
    const stopsSlice = shuffled.slice(0, stopsCount);

    const stops = [];
    let cumulative = 0;

    for (let i = 0; i < stopsSlice.length; i++) {
      const dist = i === 0 ? 0 : rnd(100, 500);
      cumulative += dist;
      stops.push({
        station: stopsSlice[i],
        distanceFromPrev: dist,
        departureTime: randomTime(5, 23)
      });
    }

    trains.push({
      name: `Train-${t}`,
      stops,
      cumulativeDistances: stops.map((_, idx) => stops.slice(0, idx + 1)
        .reduce((a, s) => a + s.distanceFromPrev, 0))
    });
  }

  await Train.insertMany(trains);
  console.log(`🚂 Seed complete: ${trains.length} trains inserted`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
