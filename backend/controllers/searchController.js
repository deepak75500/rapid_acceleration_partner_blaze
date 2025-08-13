const Train = require('../models/Train');
const { timeToMinutes, calculatePrice } = require('../utils/time');
function calculateTravelTime(stops, startIdx, endIdx) {
  const startMins = timeToMinutes(stops[startIdx].departureTime);
  const endMins = timeToMinutes(stops[endIdx].departureTime);
  if (isNaN(startMins) || isNaN(endMins)) return Infinity;
  return endMins >= startMins
    ? endMins - startMins
    : (24 * 60 - startMins) + endMins; 
}

async function getStations(req, res) {
  try {
    const rows = await Train.aggregate([
      { $unwind: '$stops' },
      { $group: { _id: '$stops.station' } },
      { $sort: { _id: 1 } },
      { $project: { station: '$_id', _id: 0 } }
    ]);
    res.json(rows.map(r => r.station));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function searchRoutes(req, res) {
  try {
    let { source, destination, sortBy } = req.body;

    sortBy = sortBy ? String(sortBy).toLowerCase() : 'none';

    if (!source || !destination)
      return res.status(400).json({ message: 'source and destination required' });
    if (source === destination)
      return res.status(400).json({ message: 'source and destination must differ' });

    const candidateTrains = await Train.find(
      { 'stops.station': { $in: [source, destination] } },
      { name: 1, stops: 1, cumulativeDistances: 1 }
    ).lean();

    const stationToTrains = new Map();
    for (const train of candidateTrains) {
      train._id = train._id.toString();
      for (let i = 0; i < train.stops.length; i++) {
        const st = train.stops[i].station;
        if (!stationToTrains.has(st)) stationToTrains.set(st, []);
        stationToTrains.get(st).push({ train, index: i });
      }
    }

    const results = [];
    const sourceTrains = stationToTrains.get(source) || [];
    for (const { train, index: idxSource } of sourceTrains) {
      const dstIdx = train.stops.findIndex((s) => s.station === destination);
      if (dstIdx !== -1 && idxSource < dstIdx) {
        const depart = train.stops[idxSource].departureTime;
        const arrive = train.stops[dstIdx].departureTime;
        const dist = train.cumulativeDistances[dstIdx] - train.cumulativeDistances[idxSource];
        const price = calculatePrice(dist);
        results.push({
          type: 'direct',
          trainName: train.name, 
          departStation: source,
          departTime: depart,
          arriveStation: destination,
          arriveTime: arrive,
          distanceKm: dist,
          price,
          departMinutes: timeToMinutes(depart),
          totalTravelMinutes: calculateTravelTime(train.stops, idxSource, dstIdx)
        });
      }
    }

    const destTrains = stationToTrains.get(destination) || [];
    const trainIdToDestIdx = new Map();
    for (const { train, index: idx } of destTrains) {
      trainIdToDestIdx.set(train._id.toString(), idx);
    }

    for (const { train: trainA, index: idxSource } of sourceTrains) {
      for (let midIdxA = idxSource + 1; midIdxA < trainA.stops.length; midIdxA++) {
        const midStation = trainA.stops[midIdxA].station;
        const trainsAtMid = stationToTrains.get(midStation) || [];
        if (trainsAtMid.length === 0) continue;

        for (const { train: trainB, index: idxMidB } of trainsAtMid) {
          const trainBId = trainB._id.toString();
          const destIdxB = trainIdToDestIdx.get(trainBId);
          if (destIdxB === undefined) continue;
          if (idxMidB >= destIdxB) continue;

          const arriveAmin = timeToMinutes(trainA.stops[midIdxA].departureTime);
          const departBmin = timeToMinutes(trainB.stops[idxMidB].departureTime);
          if (isNaN(arriveAmin) || isNaN(departBmin)) continue;
          if (departBmin < arriveAmin) continue;

          const dist1 = trainA.cumulativeDistances[midIdxA] - trainA.cumulativeDistances[idxSource];
          const dist2 = trainB.cumulativeDistances[destIdxB] - trainB.cumulativeDistances[idxMidB];
          const price1 = calculatePrice(dist1);
          const price2 = calculatePrice(dist2);

          const travelTime1 = calculateTravelTime(trainA.stops, idxSource, midIdxA);
          const travelTime2 = calculateTravelTime(trainB.stops, idxMidB, destIdxB);

          results.push({
            type: 'connection',
            segments: [
              {
                trainName: trainA.name, 
                from: source,
                departTime: trainA.stops[idxSource].departureTime,
                to: midStation,
                arriveTime: trainA.stops[midIdxA].departureTime,
                distanceKm: dist1,
                price: price1,
                departMinutes: timeToMinutes(trainA.stops[idxSource].departureTime)
              },
              {
                trainName: trainB.name,
                from: midStation,
                departTime: trainB.stops[idxMidB].departureTime,
                to: destination,
                arriveTime: trainB.stops[destIdxB].departureTime,
                distanceKm: dist2,
                price: price2,
                departMinutes: timeToMinutes(trainB.stops[idxMidB].departureTime)
              }
            ],
            totalDistanceKm: dist1 + dist2,
            totalPrice: price1 + price2,
            departMinutes: timeToMinutes(trainA.stops[idxSource].departureTime),
            totalTravelMinutes: travelTime1 + travelTime2
          });
        }
      }
    }

    const combined = results.slice();
    switch (sortBy) {
      case 'pricelow':
        combined.sort((a, b) => {
          const pa = a.type === 'direct' ? a.price : a.totalPrice;
          const pb = b.type === 'direct' ? b.price : b.totalPrice;
          return pa - pb;
        });
        break;
      case 'pricehigh':
        combined.sort((a, b) => {
          const pa = a.type === 'direct' ? a.price : a.totalPrice;
          const pb = b.type === 'direct' ? b.price : b.totalPrice;
          return pb - pa;
        });
        break;
      case 'earliest':
        combined.sort((a, b) => a.departMinutes - b.departMinutes);
        break;
      case 'latest':
        combined.sort((a, b) => b.departMinutes - a.departMinutes);
        break;
      case 'shortest':
        combined.sort((a, b) => a.totalTravelMinutes - b.totalTravelMinutes);
        break;
      case 'longest':
        combined.sort((a, b) => b.totalTravelMinutes - a.totalTravelMinutes);
        break;
      default:
        combined.sort((a, b) => a.departMinutes - b.departMinutes);
        break;
    }

    let cheapest = null, earliest = null;
    for (const r of combined) {
      const price = r.type === 'direct' ? r.price : r.totalPrice;
      const dep = r.departMinutes;
      if (cheapest === null || price < cheapest) cheapest = price;
      if (earliest === null || dep < earliest) earliest = dep;
    }

    res.json({
      results: combined,
      meta: {
        count: combined.length,
        cheapestPrice: cheapest,
        earliestDepartureMinutes: earliest
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getStations, searchRoutes };
