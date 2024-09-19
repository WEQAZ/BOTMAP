// app/pages/home.tsx

"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { createTeamupEvent, fetchTeamupEvents } from "../api/teamup"; // Adjust the path if necessary
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReservationModal from "../components/ReservationModal"; // Adjust the path if necessary
import styles from "./styles/Home.module.css";

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
        // Only update object statuses without changing the current time
        updateObjectStatuses(filteredData, currentTimeRef.current);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }
  
    getEvents();
    const interval = setInterval(() => {
      getEvents();
      // Keep updating object statuses without resetting current time
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
      console.log(`Time updated to: ${newTime}`);
      currentTimeRef.current = newTime; // Update the ref immediately
      // Only update object statuses when the time is changed by the user
      updateObjectStatuses(eventsRef.current, newTime);
      return newTime;
    });
  }

  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <Spline
          scene="https://prod.spline.design/GVOmVf1B30xEIUWb/scene.splinecode"
          onSplineMouseDown={onSplineMouseDown}
        />
      </Suspense>
      {showPopup && (
        <div
          className={styles.popup}
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
      <div className={styles.statuses}>
        {Object.entries(objectStatuses).map(([object, events]) => (
          <div key={object} className={styles.status}>
            <h3>
              <span
                className={`${styles.statusDot} ${
                  (events as any[]).length > 0 ? styles.red : styles.green
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

      <div className={styles.timeline}>
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