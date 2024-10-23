// page.tsx
"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { createTeamupEvent, fetchTeamupEvents } from "../api/teamup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import ReservationModal from "../components/ReservationModal";
import { FaPlus } from "react-icons/fa"; // Importing the plus icon
import "bootstrap/dist/css/bootstrap.min.css";
import "./page.css";


export default function Home() {
  const [events, setEvents] = useState([]);
  const eventsRef = useRef<any>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentTimeRef = useRef(new Date());
  const [objectStatuses, setObjectStatuses] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ShowFailure, setShowFailure] = useState(false);
  const [splineApp, setSplineApp] = useState(null);

  useEffect(() => {
    if (splineApp) {
      console.log("🚀 ~ useEffect ~ splineApp:", splineApp)
      updateRoomColors(splineApp, objectStatuses);
    }
  }, [objectStatuses, splineApp]);

  
  useEffect(() => {
    const startDate = "2024-07-01";
    const endDate = "2024-12-31";

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

  function updateRoomColors(spline, statuses) {
    console.log("🚀 ~ updateRoomColors ~ spline:", spline)
    
    if (!spline) {
      return;
    }

    // Get all room objects that start with "4"
    const roomObjects = Object.keys(statuses).filter(room => room.startsWith('4'));
    console.log("🚀 ~ updateRoomColors ~ roomObjects:", roomObjects)
    
    roomObjects.forEach(roomNumber => {
      const isOccupied = Array.isArray(statuses[roomNumber]) && statuses[roomNumber].length > 0;
      console.log("🚀 ~ updateRoomColors ~ isOccupied:", isOccupied)

      try {
        // Get the room object from Spline
        const roomObject = spline.findObjectByName(roomNumber);

        if (roomObject) {
          // Set the variables for this specific room
          // When occupied: white = 100, green = 0
          // When available: white = 0, green = 100
          spline.setVariable(`room${roomNumber}_unavailable`, isOccupied ? 89 : 0);
          spline.setVariable(`room${roomNumber}_available`, isOccupied ? 0 : 89);
        }
      } catch (error) {
        console.warn(`Could not update colors for room ${roomNumber}:`, error);

      }
    });
  }
  

  function onSplineLoad(spline) {
    setSplineApp(spline);

    // Log available variables
    console.log('🚀 ~ Available Spline variables:', spline.getVariables());
    // console.log("🚀 ~ onSplineLoad ~ Object:", Object.entries(objectStatuses).map(([object, events]))
    // Initial color update when the scene loads
    if (Object.keys(objectStatuses).length > 0) {
      console.log("🚀 ~ onSplineLoad ~ objectStatuses:", objectStatuses)
      updateRoomColors(spline, objectStatuses);
    } else {
      console.warn(`Could not update colors for room `);
    }
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
      const endDate = "2024-12-31"; // Corrected typo in the end date
      const data = await fetchTeamupEvents(startDate, endDate);
      const filteredData = data.events.filter((event) =>
        event.location.startsWith("4")
      );
      setEvents(filteredData);
      eventsRef.current = filteredData;
      updateObjectStatuses(filteredData, currentTimeRef.current);

      // Close modal and show confirmation message
      setIsModalOpen(false);

      // // Show alert confirmation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 5 seconds
      // window.alert(`Room ${selectedRoom} has been successfully reserved!`);

      // // Set confirmation message for additional UI feedback (optional)
      // setConfirmationMessage(`Room ${selectedRoom} has been successfully reserved!`);
      // setShowConfirmation(true); // Show confirmation popup
      // setTimeout(() => setShowConfirmation(false), 5000); // Hide after 5 seconds
    } catch (error) {
      console.error("Error creating event:", error);
      // Show error message in the modal instead of closing it
      setShowFailure(true);
      // setPopupMessage("Failed to reserve the room. Please try again.");
      // setShowPopup(true); // Show error popup
      setTimeout(() => setShowFailure(false), 3000); // Hide after 5 seconds
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

  // function handleDateChange(date) {
  //   if (date) {
  //     setCurrentTime(date);
  //     currentTimeRef.current = date;
  //     console.log(`Time updated to: ${date}`);
  //     updateObjectStatuses(eventsRef.current, date);
  //   }
  // }
  function updateCurrentTime(time) {
    setCurrentTime(time);
    currentTimeRef.current = time;
    updateObjectStatuses(eventsRef.current, time);
}

  function handleDateChange(date) {
    if (date) {
      setCurrentDate(date);
      updateCurrentTime(currentTime);
    }
  }

  function handleTimeChange(time) {
    if (time) {
      setCurrentTime(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), time.getHours(), time.getMinutes()));
      currentTimeRef.current = time;
      updateObjectStatuses(eventsRef.current, time);
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
    <main className="container-fluid main-container">
      <div className="container mx-auto px-6 py-8">
        <h1 className="botmaps-heading">BOTMAPS</h1>
        <div className="row ">
          <div className="flex-container ">
            {/* Timeline Controls */}
            <div className="col-lg-8">
              {/* New container for DatePicker and Splineflex-container */}

              <div className="bordered-container">
                <div className="datepicker-container d-flex justify-content-center align-items-center my-3">
                
                  <DatePicker
                    selected={currentDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="form-control text-center custom-datepicker full-width-datepicker"
                  />
                  
                  <button className="btn btn-primary ms-2" onClick={() => moveTime(-1)}>◀</button>

                  <DatePicker
                    selected={currentTime}
                    onChange={handleTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={60}
                    dateFormat="h:mm aa"

                    className="form-control text-center custom-datepicker full-width-datepicker ms-2"
                  />
                  
                  <button className="btn btn-primary ms-2" onClick={() => moveTime(1)}>▶</button>
                </div>

                {/* 3D Map */}
                <div className="spline-container">
                  <Suspense fallback={<div>Loading...</div>}>
                    <Spline
                      scene="https://prod.spline.design/ug6H35mgX6bVfOkp/scene.splinecode"
                      onSplineMouseDown={onSplineMouseDown}
                      onLoad={onSplineLoad}
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

                  {showConfirmation && (
                    <div className="modal show" tabIndex={-1} style={{ display: "block" }}>
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Reservation Confirmed</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowConfirmation(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <p>Room {selectedRoom} has been successfully reserved!</p>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setShowConfirmation(false)}
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="room-status-list">
                {Object.entries(objectStatuses).map(([object, events]) => (
                  <div key={object} className="room-status-card">
                    <div className="d-flex align-items-center mb-2">
                      <span
                        className={`status-dot ${(events as any[]).length > 0 ? "custom-bg-danger" : "custom-bg-success"
                          }`}
                      ></span>
                      <h5 className="m-0">{object}</h5>
                    </div>

                    <div className="room-event-info">
                      {Array.isArray(events) && events.length > 0 ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: createPopupContent(events) }}
                        ></div>
                      ) : (
                        <p className="m-0 text-muted">No events</p>
                      )}
                    </div>
                    <div className="d-flex justify-content-end mt-2">
                      {(events as any[]).length === 0 && (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setSelectedRoom(object);
                            setIsModalOpen(true);
                          }}
                        >
                          <FaPlus />
                        </button>
                      )}
                      {showSuccess && (
                        <div className="alert alert-success" role="alert">
                          <strong>Success!</strong> Room has been successfully reserved!
                        </div>
                      )}
                      {ShowFailure && (
                        <div className="alert alert-danger" role="alert">
                          <strong>Failed!</strong> Please try again or contact our staff!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="footer text-center mt-4">
          <p className="mb-0">© {new Date().getFullYear()} Project EKKO. All rights reserved.</p>
        </footer>
      </div>

    </main>
  );
      return filteredEvents
      .map((event) => {
        console.log("Event:", event);
        // Extract the contact name and phone number from the 'who' field
        const contactInfo = event.who ? event.who.split('Tel:') : ["", ""];
        let contactName = contactInfo[0].trim(); // Name part
        const contactPhone = contactInfo[1] ? contactInfo[1].trim() : ""; // Phone number part, if available

        // Function to capitalize the first letter of the name
        const capitalizeFirstLetter = (name) => {
          return name.charAt(0).toUpperCase() + name.slice(1);
        };

        // Capitalize the first letter of the contact name
        contactName = capitalizeFirstLetter(contactName);


        // Format the date and time
        const startDate = new Date(event.start_dt).toLocaleDateString();
        const startTime = new Date(event.start_dt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTime = new Date(event.end_dt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Only display phone number if it's available
        const contactDetails = contactPhone ? `Contact: ${contactName} (Tel: ${contactPhone})` : `Contact: ${contactName}`;

        return `
          <div key=${event.id}>
            <h3>${event.title}</h3>
            <p>${event.notes}</p> 
            <p>${startDate}</p> 
            <p>Time: ${startTime} - ${endTime}</p>
            <p>${contactDetails}</p>
          </div>
        `;
      })
      .join("");
  }

}

