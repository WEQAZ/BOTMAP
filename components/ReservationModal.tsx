import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './ReservationModal.css';

export default function ReservationModal({ isOpen, onClose, onSubmit, selectedRoom, currentTime }) {
  const [selectedDate, setSelectedDate] = useState(currentTime);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  // Define available time slots
  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure both date and time slot are selected
    if (!selectedDate || !selectedSlot) {
      alert('Please select both a date and time slot.');
      return;
    }

    // Get start and end times from the selected slot
    const [startTime, endTime] = selectedSlot.split(' - ');

    // Format the start and end datetime strings
    const reservationData = {
      start_dt: `${selectedDate.toISOString().split('T')[0]}T${startTime}:00`,
      end_dt: `${selectedDate.toISOString().split('T')[0]}T${endTime}:00`,
      title: title,
      location: selectedRoom,
      description: description,
      subcalendar_ids: ["6820246"] // Adjust based on your Teamup setup
    };

    onSubmit(reservationData);
  };

  return (
    <div className="modal show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Room {selectedRoom} Reservation</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Date:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()} // Ensure only future dates are selectable
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Time Slot: </label>
                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="form-control" required>
                  <option value="" disabled>Select a time slot</option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-control"
                  rows={3} // Use number instead of string
                />
              </div>
              <div className="button-group d-flex justify-content-between">
              
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-reserve-primary">Reserve</button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
