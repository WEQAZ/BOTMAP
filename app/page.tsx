"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { createTeamupEvent, fetchTeamupEvents } from "../api/teamup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import ReservationModal from "../components/ReservationModal";

export default function Home() {
  const [events, setEvents] = useState([]);
  const eventsRef = useRef<any>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentTimeRef = useRef(new Date());
  const [objectStatuses, setObjectStatuses] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const initialTime = new Date();
    setCurrentTime(initialTime);
    currentTimeRef.current = initialTime;
    const startDate = "2024-07-01";
    const endDate = "2024-09-31";

    async function getEvents() {
      try {
        const data = await fetchTeamupEvents(startDate, endDate);
        const filteredData = data.events.filter((event) =>
          event.location.startsWith("4")
        );
        setEvents(filteredData);
        eventsRef.current = filteredData;
        console.log("Fetched events data:", filteredData);
        updateObjectStatuses(filteredData, currentTimeRef.current);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    getEvents();
    const interval = setInterval(() => {
      getEvents();
      // updateObjectStatuses(eventsRef.current, currentTimeRef.current);
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

  function onSplineMouseDown(event: any) {
    const targetName = event.target?.name;
    console.log("Mouse down event:", event);

    if (targetName && targetName.startsWith("4")) {
      setSelectedRoom(targetName);
      setIsModalOpen(true);
    } else {
      console.log("Clicked on something else or target is undefined");
    }
  }

  async function handleReservationSubmit(reservationData) {
    try {
      const newEvent = await createTeamupEvent(reservationData);
      console.log("New event created:", newEvent);
      // Refresh events after creating a new one
      const startDate = "2024-07-01";
      const endDate = "2024-09-31";
      const data = await fetchTeamupEvents(startDate, endDate);
      const filteredData = data.events.filter((event) =>
        event.location.startsWith("4")
      );
      setEvents(filteredData);
      eventsRef.current = filteredData;
      updateObjectStatuses(filteredData, currentTimeRef.current);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      // Handle error (e.g., show error message to user)
    }
  }

  function filterEvents(targetName: any, time: Date) {
    return eventsRef.current.filter(
      (event: {
        location: any;
        start_dt: string | number | Date;
        end_dt: string | number | Date;
      }) => {
        console.log("Filtering time:", time);
        return (
          event.location === targetName &&
          event.location.startsWith("4") &&
          new Date(event.start_dt) <= time &&
          new Date(event.end_dt) >= time
        );
      }
    );
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
          scene="https://prod.spline.design/GVOmVf1B30xEIUWb/scene.splinecode"
          onSplineMouseDown={onSplineMouseDown}
        />
      </Suspense>
      {showPopup && (
        <div
          className="popup"
          dangerouslySetInnerHTML={{ __html: popupMessage }}
        ></div>
      )}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReservationSubmit}
        selectedRoom={selectedRoom}
        currentTime={currentTime}
      />
      <div className="statuses">
        {Object.entries(objectStatuses).map(([object, events]) => (
          <div key={object} className="status">
            <h3>
              <span
                className={`status-dot ${
                  (events as any[]).length > 0 ? "red" : "green"
                }`}
              ></span>
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
          minDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        <button onClick={() => moveTime(1)}>1 Hour ▶</button>
      </div>

      <style jsx>{`
        .statuses {
          color: black;
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
        .popup {
          color: black;
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: white;
          border: 1px solid black;
          padding: 10px;
          z-index: 100;
          max-width: 300px;
          max-height: 400px;
          overflow-y: auto;
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
