const apiKey = "dc0e56a158949fac660cb5e8803fd73b53ba6cd501eb106140114824fea83143";
const calendarKey = "ksg7y4nwkfp7q6xyio";

export async function fetchTeamupEvents(startDate, endDate) {
  const url = `https://api.teamup.com/${calendarKey}/events?startDate=${startDate}&endDate=${endDate}`;

  const response = await fetch(url, {
    headers: {
      "Teamup-Token": apiKey
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();
  return data;
}

export async function createTeamupEvent(eventData) {
  const url = `https://api.teamup.com/${calendarKey}/events`;

  // Format the dates to match Teamup's expected format
  const formattedEventData = {
    ...eventData,
    start_dt: formatDateForTeamup(new Date(eventData.start_dt)),
    end_dt: formatDateForTeamup(new Date(eventData.end_dt))
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      "Teamup-Token": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formattedEventData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create event: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data;
}

function formatDateForTeamup(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
         `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}