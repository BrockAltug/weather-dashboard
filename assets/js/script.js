const apiKey = '9339048aac9b69968b3d913b436c111c'; // OpenWeather API key
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
    forecastDiv.innerHTML = ''; // Clear previous forecasts
    for (let i = 0; i < data.list.length; i += 8) { // Take data every 8 intervals (24 hours)
        const day = data.list[i];
        const weatherCondition = day.weather[0].main.toLowerCase(); // Get the main weather condition
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        forecastItem.innerHTML = `
            <p>Date: ${new Date(day.dt_txt).toLocaleDateString()}</p>
            <p>Temperature: ${day.main.temp}°F</p>
            <p>Wind Speed: ${day.wind.speed} MPH</p>
            <p>Humidity: ${day.main.humidity}%</p>
            <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather icon">
        `;

        forecastItem.addEventListener('mouseover', function() {
            updateBodyBackground(weatherCondition); // Change body background based on the weather condition
        });

        forecastItem.addEventListener('mouseleave', function() {
            updateBodyBackground('default'); // Revert to the default background
        });

        forecastDiv.appendChild(forecastItem);
    }
}

// Function to update the body's background based on weather condition
function updateBodyBackground(weatherCondition) {
    document.body.className = ''; // Reset any existing class
    switch (weatherCondition) {
        case 'clear':
            document.body.style.background = 'linear-gradient(135deg, #8EC5FC, #E0C3FC)'; // Clear sky gradient
            break;
        case 'clouds':
            document.body.style.background = 'linear-gradient(135deg, #B0BEC5, #78909C)'; // Cloudy gradient
            break;
        case 'rain':
        case 'drizzle':
            document.body.style.background = 'linear-gradient(135deg, #74EBD5, #ACB6E5)'; // Rainy gradient
            break;
        case 'snow':
            document.body.style.background = 'linear-gradient(135deg, #ECE9E6, #FFFFFF)'; // Snowy gradient
            break;
        case 'thunderstorm':
            document.body.style.background = 'linear-gradient(135deg, #141E30, #243B55)'; // Thunderstorm gradient
            break;
        case 'mist':
        case 'fog':
            document.body.style.background = 'linear-gradient(135deg, #D3D3D3, #ECECEC)'; // Mist/Fog gradient
            break;
        default:
            document.body.style.background = 'linear-gradient(135deg, #f4f4f4, #eaeaea)'; // Default gradient
            break;
    }
}

// initial render of search history
renderSearchHistory();