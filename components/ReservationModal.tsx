import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ReservationModal({ isOpen, onClose, onSubmit, selectedRoom, currentTime }) {
  const [startDate, setStartDate] = useState(currentTime);
  const [endDate, setEndDate] = useState(new Date(currentTime.getTime() + 60 * 60 * 1000)); // Default to 1 hour later
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const reservationData = {
      start_dt: startDate.toISOString(),
      end_dt: endDate.toISOString(),
      title: title,
      location: selectedRoom,
      description: description,
      subcalendar_ids: ["6820246"] // You might want to adjust this based on your Teamup setup
    };
    onSubmit(reservationData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Reserve {selectedRoom}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Start Time:
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              selectsRange={undefined}
            />
          </label>
          <label>
            End Time:
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date[0])}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              selectsRange={undefined}
            />
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
        input, textarea {
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