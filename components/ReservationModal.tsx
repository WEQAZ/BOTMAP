import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from '../components/ReservationModal.module.css';

export default function ReservationModal({ isOpen, onClose, onSubmit, selectedRoom, currentTime }) {
  const [selectedDate, setSelectedDate] = useState(currentTime);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

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
      description: description,
      subcalendar_ids: ["6820246"]
    };

    onSubmit(reservationData);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Reserve {selectedRoom}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Select Date:
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              required
            />
          </label>
          <label className={styles.label}>
            Select Time Slot:
            <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required className={styles.select}>
              <option value="" disabled>Select a time slot</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Title:
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={styles.input} />
          </label>
          <label className={styles.label}>
            Description:
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={styles.textarea} />
          </label>
          <div className={styles.buttonGroup}>
            <button type="submit">Reserve</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}