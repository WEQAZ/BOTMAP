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
  const [nameInfo, setNameInfo] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  if (!isOpen) return null;

  const timeSlots = [
    '08:00 - 09:30',
    '09:30 - 11:00',
    '11:00 - 12:30',
    '12:30 - 13:00',
    '13:00 - 14:30',
    '14:30 - 16:00',
    '16:00 - 17:30',
    '17:30 - 19:00',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot) {
      alert('Please select both a date and time slot.');
      return;
    }

    const [startTime, endTime] = selectedSlot.split(' - ');

    const reservationData = {
      start_dt: `${selectedDate.toISOString().split('T')[0]}T${startTime}:00`,
      end_dt: `${selectedDate.toISOString().split('T')[0]}T${endTime}:00`,
      title: title,
      location: selectedRoom,
      who : nameInfo + " Tel:" + contactInfo,
      notes: description,
      subcalendar_ids: ["6820246"]
    };

    onSubmit(reservationData).then(() => {
      setSelectedDate(currentTime);
      setSelectedSlot('');
      setTitle('');
      setDescription('');
      setNameInfo('');
      setContactInfo('');
    });
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
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label>Date:</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      dateFormat="MMMM d, yyyy"
                      minDate={new Date()}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label>Time Slot:</label>
                    <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="form-control" required>
                      <option value="" disabled>Select a time slot</option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Reservation Name:</label>
                <input
                  type="text"
                  value={nameInfo}
                  onChange={e => setNameInfo(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  className="form-control"
                  required
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