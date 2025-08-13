const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  station: { type: String, required: true, index: true },
  distanceFromPrev: { type: Number, required: true }, 
  departureTime: { type: String, required: true } 
}, { _id: false });

const TrainSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  stops: { type: [StopSchema], required: true },
  cumulativeDistances: { type: [Number], required: true } 
});

TrainSchema.index({ 'stops.station': 1 });

module.exports = mongoose.model('Train', TrainSchema);
