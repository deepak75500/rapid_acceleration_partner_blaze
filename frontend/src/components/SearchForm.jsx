import React, { useState, useEffect } from 'react';
function findClosestStation(spoken, stations) {
  const cleaned = spoken.toLowerCase();
  return stations.find(s => s.toLowerCase().includes(cleaned)) || "";
}

export default function SearchForm({ stations, onSearch }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sortBy, setSortBy] = useState("none");

  function submit(e) {
    if (e) e.preventDefault();
    if (!source || !destination) {
      alert("Select both source and destination");
      return;
    }
    if (source === destination) {
      alert("Source and destination must differ");
      return;
    }
    onSearch({ source, destination, sortBy });
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    const startRecognition = () => {
      try {
        recognition.start();
        console.log("Voice recognition started");
      } catch (err) {
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Voice command:", transcript);
      if (transcript === "voice start" || transcript.startsWith("voice start")) {
        console.log("Manual restart via 'voice start'");
        startRecognition();
        return;
      }

      if (transcript.startsWith("source")) {
        const spokenStation = transcript.replace("source", "").trim();
        const match = findClosestStation(spokenStation, stations);
        if (match) setSource(match);
        return;
      }

      if (transcript.startsWith("destination")) {
        const spokenStation = transcript.replace("destination", "").trim();
        const match = findClosestStation(spokenStation, stations);
        if (match) setDestination(match);
        return;
      }

      if (transcript.startsWith("sort by")) {
        const spokenSort = transcript.replace("sort by", "").trim();
        const sortOptions = {
          "none": "none",
          "price low": "pricelow",
          "price high": "pricehigh",
          "earliest": "earliest",
          "latest": "latest",
          "shortest": "shortest",
          "longest": "longest"
        };
        for (const key in sortOptions) {
          if (spokenSort.includes(key)) {
            setSortBy(sortOptions[key]);
            return;
          }
        }
      }

      if (transcript.includes("search") || transcript.includes("result")) {
        if (source && destination) {
          submit();
        } else {
          alert("Please set both source and destination before searching.");
        }
      }
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
    };

    recognition.onend = () => {
      console.log("Voice recognition stopped, restarting...");
      startRecognition();
    };

    startRecognition();

    return () => {
      recognition.onend = null; 
      recognition.stop();
    };
  }, [stations, source, destination, sortBy]);

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="field">
        <label>Source</label>
        <select value={source} onChange={e => setSource(e.target.value)}>
          <option value="">Choose source</option>
          {stations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Destination</label>
        <select value={destination} onChange={e => setDestination(e.target.value)}>
          <option value="">Choose destination</option>
          {stations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Sort by</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="none">None (default)</option>
          <option value="pricelow">Price (low → high)</option>
          <option value="pricehigh">Price (high → low)</option>
          <option value="earliest">Departure time (earliest)</option>
          <option value="latest">Departure time (latest)</option>
          <option value="shortest">Shortest travel time</option>
          <option value="longest">Longest travel time</option>
        </select>
      </div>

      <div className="actions">
        <button type="submit" className="primary">Search</button>
      </div>
    </form>
  );
}
