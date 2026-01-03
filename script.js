// Select input and button
const input = document.querySelector("input");
const btn = document.querySelector("#btn");

// Select UI elements
const weather = document.querySelector(".weather");
const tempValue = document.querySelector(`.temp-value`);
const temperatureC = document.querySelector(".tempC");
const temperatureF = document.querySelector(".tempF");
const icon = document.querySelector(".icon");
const description = document.querySelector(".description");
const time = document.querySelector(".time");
const day = document.querySelector(".day");
const date = document.querySelector(".date");
const hourlyDiv = document.querySelector(".hourly");

// State Variables
let isCelsius = true; // Track temperature unit
let currentTempC = null; // Store Celsius temp
let currentTempF = null; // Store Fahrenheit temp
let lastWeatherData = ""; // Store last searched city

// Search Handler
const searchWeather = () => {
  let city = input.value.trim();
  getWeather(city);
  input.value = ``;
};

// Button click search
btn.addEventListener("click", searchWeather);

// Enter key search
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchWeather();
  }
});

// Temperature Toggle
temperatureC.addEventListener("click", () => {
  isCelsius = true;
  updateTemp();
  if (lastWeatherData) showHourlyForecast(lastWeatherData);
});

temperatureF.addEventListener("click", () => {
  isCelsius = false;
  updateTemp();
  if (lastWeatherData) showHourlyForecast(lastWeatherData);
});

// Fetch Current Weather
async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=2f7c93649da1466a89692430251912&q=${city}&days=1&aqi=no&alerts=no`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    lastWeatherData = data;

    // City & country
    weather.innerHTML = `${data.location.name}, ${data.location.country} <svg width="24" height="24" viewBox="0 0 24 24" 
    fill="currentColor"xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2a7 7 0 0 0-7 7c0 5.5 7 13 7 13s7-7.5 7-13a7 7 0 0 0-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
</svg>
`;

    // Weather icon
    icon.innerHTML = `<img src="https:${data.current.condition.icon}" alt="weather icon">`;

    // Description
    description.innerHTML = `Weather today - ${data.current.condition.text}`;

    // Other info
    const conditions = document.querySelector(".conditions");
    conditions.querySelector(
      ".Humidity"
    ).innerHTML = `Humidity : ${data.current.humidity} %`;
    conditions.querySelector(
      ".Wind"
    ).innerHTML = `Wind : ${data.current.wind_kph} km/h`;
    conditions.querySelector(
      ".Pressure"
    ).innerHTML = `Pressure : ${data.current.pressure_mb} mb`;
    conditions.querySelector(
      `.Region`
    ).innerHTML = `Reasion : ${data.location.region}`;

    // Store temperatures
    currentTempC = data.current.temp_c;
    currentTempF = data.current.temp_f;

    // Update date/time and temperature
    getCityDateTime(data);
    updateTemp();
    showHourlyForecast(data);
    
  } catch (err) {
    console.error(err.message);
    alert(`somethig went wrong! plese try again.`);
    return null;
  }
}

// Update Temperature UI
const updateTemp = () => {
  if (currentTempC === null || currentTempF === null) return;

  if (isCelsius) {
    tempValue.innerHTML = currentTempC;
    temperatureC.classList.add("active");
    temperatureF.classList.remove("active");
  } else {
    tempValue.innerHTML = currentTempF;
    temperatureF.classList.add("active");
    temperatureC.classList.remove("active");
  }
};

// Local Date & Time
function getCityDateTime(data) {
  const localTime = data.location.localtime;
  const isoTime = localTime.replace(" ", "T") + ":00";
  const dateObj = new Date(isoTime);

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  day.innerHTML = days[dateObj.getDay()];
  date.innerHTML = `${dateObj.getDate()} ${
    months[dateObj.getMonth()]
  } ${dateObj.getFullYear()}`;

  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  minutes = minutes.toString().padStart(2, "0");

  time.innerHTML = `${hours}:${minutes} ${ampm}`;
}

// Show Hourly Forecast
function showHourlyForecast(data) {
  hourlyDiv.innerHTML = "";

  const hours = data.forecast.forecastday[0].hour;

  hours.forEach((item) => {
    const time24 = item.time.split(" ")[1];
    let [hour, minute] = time24.split(":").map(Number);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    const time12 = `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    const temp = isCelsius ? item.temp_c : item.temp_f;
    const unit = isCelsius ? "°C" : "°F";

    hourlyDiv.innerHTML += `
      <div class="hour">
        <p>${time12}</p>
        <img src="https:${item.condition.icon}">
        <p>${temp}${unit}</p>
      </div>
    `;
  });

  //sunrise and sunset time
  document.querySelector(`.sunrise`).innerHTML =
    data.forecast.forecastday[0].astro.sunrise;
  document.querySelector(`.sunset`).innerHTML =
    data.forecast.forecastday[0].astro.sunset;
}

// Load Default City on App Start
window.addEventListener("load", () => {
  const city = "Uttarakhand";
  getWeather(city);
});
