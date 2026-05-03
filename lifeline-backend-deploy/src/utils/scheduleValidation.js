const HOSPITAL_WORK_START = "08:00";
const HOSPITAL_WORK_END = "17:00";

// Normalizes a date to local midnight so date comparisons ignore the time portion.
const startOfLocalDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Returns the latest date allowed for booking, counted from today.
const getMaxBookingDate = () => {
  const maxDate = startOfLocalDay();
  maxDate.setDate(maxDate.getDate() + 7);
  return maxDate;
};

// Treats Monday to Friday as valid working days.
const isWorkingDay = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

// Parses a strict YYYY-MM-DD string into a local Date object.
const parseDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  // Rejects impossible dates such as 2026-02-30 after JavaScript auto-correction.
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

// Converts a Date object back into the YYYY-MM-DD format used by the API.
const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Ensures a provided date falls within the allowed 7-day scheduling window.
const assertDateWithinNext7Days = (dateValue, label = "Date") => {
  const date = parseDateOnly(dateValue);
  if (!date) {
    throw new Error(`${label} must use YYYY-MM-DD format`);
  }

  const today = startOfLocalDay();
  const maxDate = getMaxBookingDate();

  if (date < today || date > maxDate) {
    throw new Error(`${label} must be between ${toDateKey(today)} and ${toDateKey(maxDate)}`);
  }
};

// Reuses the same 7-day window validation for appointment timestamps.
const assertAppointmentDateWithinNext7Days = (dateValue) => {
  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Appointment date is invalid");
  }

  assertDateWithinNext7Days(toDateKey(appointmentDate), "Appointment date");
};

// Validates 24-hour time strings in HH:MM format.
const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));

// Confirms a start/end time pair is correctly formatted and ordered.
const assertTimeRange = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    throw new Error("Start time and end time must use HH:MM format");
  }

  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }
};

// Verifies a single time falls within an allowed inclusive time window.
const assertTimeWithinRange = (time, startTime, endTime, label = "Time") => {
  if (!isValidTime(time)) {
    throw new Error(`${label} must use HH:MM format`);
  }

  if (time < startTime || time > endTime) {
    throw new Error(`${label} must be between ${startTime} and ${endTime}`);
  }
};

module.exports = {
  HOSPITAL_WORK_START,
  HOSPITAL_WORK_END,
  assertAppointmentDateWithinNext7Days,
  assertDateWithinNext7Days,
  assertTimeRange,
  assertTimeWithinRange,
  isWorkingDay,
  isValidTime,
  toDateKey
};
