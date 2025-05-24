const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const searchBtn = document.getElementById("searchBtn");

const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelsLike");
const description = document.querySelector(".description");
const city = document.querySelector(".city");
const date = document.querySelector(".date");

const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SSValue = document.getElementById("SSValue");
const SRValue = document.getElementById("SRValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue"); // Not available in free tier
const PValue = document.getElementById("PValue");
const Forecast = document.querySelector(".Forecast");

const API_KEY = "826747d59f80c8030a2ac8f678aff286";
const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric&q=`;
const FORECAST_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric&q=`;

function findUserLocation() {
  const location = userLocation.value.trim();
  if (!location) {
    alert("Please enter a city name.");
    return;
  }

  // Reset UI
  Forecast.innerHTML = "";
  city.textContent = "";
  temperature.textContent = "";
  feelsLike.textContent = "";
  description.textContent = "";
  date.textContent = "";
  weatherIcon.style.background = "";
  HValue.textContent = "";
  WValue.textContent = "";
  SSValue.textContent = "";
  SRValue.textContent = "";
  CValue.textContent = "";
  PValue.textContent = "";

  // Get current weather
  fetch(WEATHER_API_ENDPOINT + encodeURIComponent(location))
    .then((response) => response.json())
    .then((data) => {
      if (data.cod && data.cod !== 200) {
        alert(data.message);
        throw new Error(data.message);
      }

      // Display current weather
      city.textContent = `${data.name}, ${data.sys.country}`;
      weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png) center center no-repeat`;
      temperature.textContent = `${Math.round(data.main.temp)}°C`;
      feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
      description.innerHTML = `<i class="fa-solid fa-cloud"></i> ${data.weather[0].description}`;
      HValue.textContent = `${data.main.humidity}%`;
      WValue.textContent = `${data.wind.speed} m/s`;
      SRValue.textContent = unixToTime(data.sys.sunrise, data.timezone);
      SSValue.textContent = unixToTime(data.sys.sunset, data.timezone);
      CValue.textContent = `${data.clouds.all}%`;
      PValue.textContent = `${data.main.pressure} hPa`;
      date.textContent = new Date(data.dt * 1000).toUTCString().slice(0, 16);

      // Fetch 5-day forecast
      return fetch(FORECAST_API_ENDPOINT + encodeURIComponent(location));
    })
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.list) return;

      // Group forecast by day
      const daily = {};

      data.list.forEach((entry) => {
        const date = new Date(entry.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });

        if (!daily[day]) {
          daily[day] = {
            max: entry.main.temp_max,
            min: entry.main.temp_min,
            weather: entry.weather[0],
          };
        } else {
          daily[day].max = Math.max(daily[day].max, entry.main.temp_max);
          daily[day].min = Math.min(daily[day].min, entry.main.temp_min);
        }
      });

      // Display next 5 days (excluding today)
      Forecast.innerHTML = "";
      Object.keys(daily).slice(1, 6).forEach((dayName) => {
        const day = daily[dayName];
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`;

        const dayDiv = document.createElement("div");
        dayDiv.className = "bg-black bg-opacity-10 rounded shadow p-4 text-center";

        dayDiv.innerHTML = `
          <h3 class="font-semibold mb-1">${dayName}</h3>
          <img src="${iconUrl}" alt="${day.weather.description}" class="mx-auto mb-1" />
          <p class="text-sm">${day.weather.main}</p>
          <p class="mt-1">Max: ${Math.round(day.max)}°C</p>
          <p>Min: ${Math.round(day.min)}°C</p>
        `;
        Forecast.appendChild(dayDiv);
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

function unixToTime(unix_timestamp, timezone_offset) {
  const date = new Date((unix_timestamp + timezone_offset) * 1000);
  return date.toUTCString().match(/(\d{2}:\d{2})/)[0];
}

searchBtn.addEventListener("click", findUserLocation);
userLocation.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    findUserLocation();
  }
});
