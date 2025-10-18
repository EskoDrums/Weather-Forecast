const API_KEY = 'b2382224028146b881a174548252603'; 
const BASE_URL = 'https://api.weatherapi.com/v1/';
const DAYS_OF_FORECAST = 5;

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const weatherIconEl = document.getElementById('weather-icon');
const forecastContainer = document.getElementById('forecast-container');
const errorEl = document.getElementById('error-message');
const themeToggleBtn = document.getElementById('theme-toggle');

// Theme toggle
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggleBtn.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Search Event
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
    else displayError("Please enter a city name.");
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

// On load, use geolocation
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                getWeatherData(`${latitude},${longitude}`);
            },
            () => getWeatherData('New York') // fallback if location denied
        );
    } else {
        getWeatherData('New York'); // fallback
    }
};

async function getWeatherData(city) {
    clearError();
    clearForecast();
    showLoadingState();

    try {
        const apiUrl = `${BASE_URL}forecast.json?key=${API_KEY}&q=${city}&days=${DAYS_OF_FORECAST}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        displayCurrentWeather(data);
        displayForecast(data);

    } catch (error) {
        console.error(error);
        hideLoadingState();
        displayError(error.message || "Failed to fetch weather data.");
    }
}

function displayCurrentWeather(data) {
    const { current, location } = data;

    cityNameEl.textContent = `${location.name}, ${location.country}`;
    tempEl.textContent = `${Math.round(current.temp_c)}°C`;
    descEl.textContent = current.condition.text.toUpperCase();
    humidityEl.textContent = `${current.humidity}%`;
    windSpeedEl.textContent = `${current.wind_kph.toFixed(1)} km/h`;

    // Fix icon URL (ensure https)
    const iconUrl = current.condition.icon.startsWith('//') ? 'https:' + current.condition.icon : current.condition.icon;
    weatherIconEl.src = iconUrl;
    weatherIconEl.alt = current.condition.text;

    hideLoadingState();
}

function displayForecast(data) {
    clearForecast();

    const forecastList = data.forecast.forecastday.slice(1, 3); // 2-day forecast
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

    forecastList.forEach(day => {
        const date = new Date(day.date);
        const dayOfWeek = formatter.format(date);
        const maxTemp = Math.round(day.day.maxtemp_c);
        const minTemp = Math.round(day.day.mintemp_c);
        const iconUrl = day.day.condition.icon.startsWith('//') ? 'https:' + day.day.condition.icon : day.day.condition.icon;
        const description = day.day.condition.text;

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <h4>${dayOfWeek}</h4>
            <img src="${iconUrl}" alt="${description}">
            <p>Max: ${maxTemp}°C</p>
            <p>Min: ${minTemp}°C</p>
        `;
        forecastContainer.appendChild(card);
    });
}

// Helper functions
function displayError(message) {
    errorEl.textContent = `🚨 ${message}`;
    cityNameEl.textContent = '---';
    tempEl.textContent = '--°C';
    descEl.textContent = 'N/A';
    humidityEl.textContent = 'N/A';
    windSpeedEl.textContent = 'N/A';
    weatherIconEl.src = '';
    weatherIconEl.alt = '';
}

function clearError() { errorEl.textContent = ""; }
function clearForecast() { forecastContainer.innerHTML = ''; }

function showLoadingState() {
    clearForecast();
    for (let i = 0; i < 5; i++) {
        const card = document.createElement('div');
        card.classList.add('forecast-card', 'skeleton');
        forecastContainer.appendChild(card);
    }
}

function hideLoadingState() { /* skeleton replaced automatically */ }
