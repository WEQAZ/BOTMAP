const apiKey = "dc0e56a158949fac660cb5e8803fd73b53ba6cd501eb106140114824fea83143";

export async function fetchTeamupEvents(startDate, endDate) {
  const url = `https://api.teamup.com/ksg7y4nwkfp7q6xyio/events?startDate=${startDate}&endDate=${endDate}`;

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
