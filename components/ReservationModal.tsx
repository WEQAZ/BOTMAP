import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  const handleSubmit = (e: any) => {
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
    <div className="modal">
      <div className="modal-content">
        <h2>Reserve {selectedRoom}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Select Date:
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()} // Ensure only future dates are selectable
              required
            />
          </label>
          <label>
            Select Time Slot:
            <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
              <option value="" disabled>Select a time slot</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title:
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </label>
          <label>
            Description:
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
          </label>
          <div className="button-group">
            <button type="submit">Reserve</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 5px;
          width: 300px;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-bottom: 10px;
        }
        select, input, textarea {
          width: 100%;
          padding: 5px;
        }
        .button-group {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
