"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { fetchTeamupEvents } from "../api/teamup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";

export default function Home() {
  const [events, setEvents] = useState([]);
  const eventsRef = useRef([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentTimeRef = useRef(new Date());
  const [objectStatuses, setObjectStatuses] = useState({});

  useEffect(() => {
    const initialTime = new Date();
    setCurrentTime(initialTime);
    currentTimeRef.current = initialTime;
    const startDate = "2024-07-01";
    const endDate = "2024-07-31";

    async function getEvents() {
      try {
        const data = await fetchTeamupEvents(startDate, endDate);
        setEvents(data.events);
        eventsRef.current = data.events;
        console.log("Fetched events data:", data.events);
        updateObjectStatuses(data.events, initialTime);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    getEvents();
    const interval = setInterval(() => {
      getEvents();
      updateObjectStatuses(eventsRef.current, currentTimeRef.current);
    }, 60000); // Fetch events and update statuses every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateObjectStatuses(eventsRef.current, currentTime);
  }, [currentTime]);

  function updateObjectStatuses(events, time) {
    const statuses = {};
    events.forEach((event) => {
      const isCurrentEvent =
        new Date(event.start_dt) <= time && new Date(event.end_dt) >= time;
      if (!statuses[event.location]) {
        statuses[event.location] = [];
      }
      if (isCurrentEvent) {
        statuses[event.location].push(event);
      }
    });
    setObjectStatuses(statuses);
  }

  function handleDateChange(date) {
    if (date) {
      setCurrentTime(date);
      currentTimeRef.current = date;
      console.log(`Time updated to: ${date}`);
      updateObjectStatuses(eventsRef.current, date);
    }
  }

  function moveTime(hours) {
    setCurrentTime((prevTime) => {
      const newTime = new Date(prevTime.getTime() + hours * 60 * 60 * 1000);
      currentTimeRef.current = newTime; // Update the ref immediately
      console.log(`Time updated to: ${newTime}`);
      updateObjectStatuses(eventsRef.current, newTime);
      return newTime;
    });
  }

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Spline
          scene="https://prod.spline.design/M7CPMgEoaMdQKmU0/scene.splinecode"
        />
      </Suspense>

      <div className="statuses">
        {Object.entries(objectStatuses).map(([object, events]) => (
          <div key={object} className="status">
            <h3>
              <span className={`status-dot ${(events as any[]).length > 0 ? 'red' : 'green'}`}></span>
              {object}
            </h3>
            {Array.isArray(events) && events.length > 0 ? (
              <div
                dangerouslySetInnerHTML={{ __html: createPopupContent(events) }}
              ></div>
            ) : (
              <p>No events</p>
            )}
          </div>
        ))}
      </div>

      <div className="timeline">
        <button onClick={() => moveTime(-1)}>◀ 1 Hour</button>
        <DatePicker
          selected={currentTime}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        <button onClick={() => moveTime(1)}>1 Hour ▶</button>
      </div>

      <style jsx>{`
        .statuses {
          position: absolute;
          top: 20px;
          right: 20px;
          background-color: rgba(255, 255, 255, 0.8);
          padding: 10px;
          border-radius: 5px;
          max-width: 300px;
          max-height: 400px;
          overflow-y: auto;
        }
        .status {
          margin-bottom: 10px;
        }
        .status h3 {
          display: flex;
          align-items: center;
          margin: 0 0 5px 0;
        }
        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .status-dot.red {
          background-color: red;
        }
        .status-dot.green {
          background-color: green;
        }
        .timeline {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          padding: 10px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .timeline button {
          padding: 5px 10px;
          cursor: pointer;
        }
        :global(.react-datepicker-wrapper) {
          width: auto;
        }
        :global(.react-datepicker__input-container input) {
          width: 200px;
          padding: 5px;
          font-size: 14px;
        }
      `}</style>
    </main>
  );

  function createPopupContent(filteredEvents) {
    return filteredEvents
      .map(
        (event) =>
          `<div key=${event.id}>
        <h3>${event.title}</h3>
        <p>Location: ${event.location}</p>
        <p>Start: ${new Date(event.start_dt).toLocaleString()}</p>
        <p>End: ${new Date(event.end_dt).toLocaleString()}</p>
      </div>`
      )
      .join("");
  }
}
