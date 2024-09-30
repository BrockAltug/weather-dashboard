const apiKey = 'f14a51468bf238f2fda7fa02919b143a'; // OpenWeather API key
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const searchHistoryDiv = document.getElementById('search-history');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const clearListButton = document.getElementById('clear-list');

// store search history in localStorage
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// event listener for form submission
cityForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = ''; // clear the input after submitting
    }
});

// event listener for clearing the search history
clearListButton.addEventListener('click', function() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    renderSearchHistory();
});

// fetch weather data using the OpenWeather API
function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            const properCityName = data.name; // use city name from API response (properly capitalized)
            displayCurrentWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
            updateSearchHistory(properCityName); // add properly capitalized city name to search history
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// update search history and save to localStorage
function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        renderSearchHistory();
    }
}

// render search history from localStorage
function renderSearchHistory() {
    searchHistoryDiv.innerHTML = '';
    searchHistory.forEach(city => {
        const cityBtn = document.createElement('button');
        cityBtn.textContent = city; // Display city name with correct capitalization
        cityBtn.addEventListener('click', function() {
            fetchWeather(city);
        });
        searchHistoryDiv.appendChild(cityBtn);
    });
}

// display current weather
function displayCurrentWeather(data) {
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${data.name}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Temperature: ${data.main.temp}°F</p>
        <p>Wind Speed: ${data.wind.speed} MPH</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather icon">
    `;
}

// fetch 5-day forecast data
function fetchForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching forecast');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// display 5-day forecast
function displayForecast(data) {
    forecastDiv.innerHTML = `<h2>5-Day Forecast</h2>`;
    for (let i = 0; i < data.list.length; i += 8) { // take data every 8 intervals (24 hours)
        const day = data.list[i];
        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <p>Date: ${new Date(day.dt_txt).toLocaleDateString()}</p>
                <p>Temperature: ${day.main.temp}°F</p>
                <p>Wind Speed: ${day.wind.speed} MPH</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather icon">
            </div>
        `;
    }
}

// initial render of search history
renderSearchHistory();