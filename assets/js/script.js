const apiKey = '9339048aac9b69968b3d913b436c111c'; // OpenWeather API key
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const searchHistoryDiv = document.getElementById('search-history');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const clearListButton = document.getElementById('clear-list');
const header = document.querySelector('h1'); // Target the h1 element

// Store search history in localStorage
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Event listener for form submission
cityForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = ''; // Clear the input after submitting
    }
});

// Event listener for clearing the search history
clearListButton.addEventListener('click', function() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    renderSearchHistory();
});

// Fetch weather data using the OpenWeather API
function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            const properCityName = data.name; // Use city name from API response (properly capitalized)
            displayCurrentWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
            updateSearchHistory(properCityName); // Add properly capitalized city name to search history
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Update search history and save to localStorage
function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        renderSearchHistory();
    }
}

// Render search history from localStorage
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

// Display current weather
function displayCurrentWeather(data) {
    const weatherCondition = data.weather[0].main.toLowerCase();
    const iconCode = mapWeatherToIcon(data.weather[0].id); // Get the Weatherbit icon
    const weatherDescription = data.weather[0].description; // Get weather description (e.g., clear sky, snow)

    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${data.name}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Temperature: ${data.main.temp}°F</p>
        <p>Wind Speed: ${data.wind.speed} MPH</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <img src="https://www.weatherbit.io/static/img/icons/${iconCode}.png" alt="Weather icon">
        <p>${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
    `;

    // Hover effect for current weather
    currentWeatherDiv.addEventListener('mouseover', function() {
        updateBodyBackground(iconCode);
    });

    currentWeatherDiv.addEventListener('mouseleave', function() {
        updateBodyBackground('default');
    });
}

// Fetch 5-day forecast data, excluding the current day
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

// Display 5-day forecast excluding the current day
function displayForecast(data) {
    forecastDiv.innerHTML = ''; // Clear previous forecasts
    const currentDate = new Date().getDate();

    let dayCount = 0;
    for (let i = 0; i < data.list.length && dayCount < 5; i++) {
        const day = data.list[i];
        const forecastDate = new Date(day.dt_txt).getDate();

        // Only include forecasts for days after today
        if (forecastDate !== currentDate && day.dt_txt.includes("12:00:00")) {
            const weatherCondition = day.weather[0].main.toLowerCase();
            const iconCode = mapWeatherToIcon(day.weather[0].id); // Use Weatherbit icon
            const weatherDescription = day.weather[0].description; // Get weather description

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');

            forecastItem.innerHTML = `
                <p>Date: ${new Date(day.dt_txt).toLocaleDateString()}</p>
                <p>Temperature: ${day.main.temp}°F</p>
                <p>Wind Speed: ${day.wind.speed} MPH</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <img src="https://www.weatherbit.io/static/img/icons/${iconCode}.png" alt="Weather icon">
                <p>${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
            `;

            forecastItem.addEventListener('mouseover', function() {
                updateBodyBackground(iconCode);
            });

            forecastItem.addEventListener('mouseleave', function() {
                updateBodyBackground('default');
            });

            forecastDiv.appendChild(forecastItem);
            dayCount++;
        }
    }
}

// Function to map OpenWeather condition code to Weatherbit icon
function mapWeatherToIcon(weatherCode) {
    const weatherIcons = {
        200: "t01d", 201: "t02d", 202: "t03d", 230: "t04d", 231: "t04d", 232: "t04d", 233: "t05d",
        300: "d01d", 301: "d02d", 302: "d03d",
        500: "r01d", 501: "r02d", 502: "r03d", 511: "f01d", 520: "r04d", 521: "r05d", 522: "r06d",
        600: "s01d", 601: "s02d", 602: "s03d", 610: "s04d", 611: "s05d", 621: "s01d", 622: "s02d", 623: "s06d",
        700: "a01d", 711: "a02d", 721: "a03d", 741: "a05d",
        800: "c01d", 801: "c02d", 802: "c02d", 803: "c03d", 804: "c04d"
    };

    return weatherIcons[weatherCode] || "u00d"; // Default to unknown if no match found
}

function updateBodyBackground(iconCode) {
    const header = document.querySelector('h1');
    document.body.className = ''; // Reset any existing class

    switch (iconCode) {
        case 'c01d': // Clear sky (day)
            document.body.style.background = 'linear-gradient(135deg, #87CEEB, #FFD700)'; // Clear blue sky with sunlight
            header.style.backgroundImage = 'linear-gradient(135deg, #FF4500, #FFD700)'; // Vibrant h1 background
            header.style.color = '#000'; // Solid black for crisp text
            break;

        case 'c02d': // Few Clouds, Scattered Clouds
            document.body.style.background = 'linear-gradient(135deg, #A9C9FF, #FFDEE9)'; // Soft blue with scattered clouds
            header.style.backgroundImage = 'linear-gradient(135deg, #FF69B4, #FFDEE9)';
            header.style.color = '#000'; // Solid black
            break;

        case 'c03d': // Broken Clouds
            document.body.style.background = 'linear-gradient(135deg, #B0BEC5, #808080)'; // Grayish clouds with dim light
            header.style.backgroundImage = 'linear-gradient(135deg, #808080, #A9A9A9)';
            header.style.color = '#000';
            break;

        case 'c04d': // Overcast Clouds
            document.body.style.background = 'linear-gradient(135deg, #6E7F80, #4B515D)'; // Dark gray overcast skies
            header.style.backgroundImage = 'linear-gradient(135deg, #4B515D, #6E7F80)';
            header.style.color = '#000';
            break;

        case 'r01d': // Light Rain
            document.body.style.background = 'linear-gradient(135deg, #6D8299, #A9C9FF)'; // Light blue with a touch of rain
            header.style.backgroundImage = 'linear-gradient(135deg, #6D8299, #A9C9FF)';
            header.style.color = '#000';
            break;

        case 'r02d': // Moderate Rain
        case 'r03d': // Heavy Rain
            document.body.style.background = 'linear-gradient(135deg, #4E5C6E, #717D91)'; // Darker gray/blue for heavier rain
            header.style.backgroundImage = 'linear-gradient(135deg, #4E5C6E, #717D91)';
            header.style.color = '#000';
            break;

        case 's01d': // Light Snow
            document.body.style.background = 'linear-gradient(135deg, #E6E9F0, #FFFFFF)'; // Soft white snow with gentle light
            header.style.backgroundImage = 'linear-gradient(135deg, #FFFFFF, #E6E9F0)';
            header.style.color = '#000';
            break;

        case 's02d': // Snow
        case 's03d': // Heavy Snow
            document.body.style.background = 'linear-gradient(135deg, #DCEFFF, #F0F8FF)'; // Cold, icy blue for heavy snow
            header.style.backgroundImage = 'linear-gradient(135deg, #DCEFFF, #F0F8FF)';
            header.style.color = '#000';
            break;

        case 't01d': // Thunderstorm
        case 't02d':
        case 't03d':
            document.body.style.background = 'linear-gradient(135deg, #2C3E50, #4B79A1)'; // Dark stormy clouds with a hint of lightning
            header.style.backgroundImage = 'linear-gradient(135deg, #2C3E50, #4B79A1)';
            header.style.color = '#000';
            break;

        case 'a01d': // Mist, Fog
        case 'a05d':
            document.body.style.background = 'linear-gradient(135deg, #BEC9C9, #D8E2E2)'; // Light gray mist or fog
            header.style.backgroundImage = 'linear-gradient(135deg, #BEC9C9, #D8E2E2)';
            header.style.color = '#000';
            break;

        case 'a02d': // Smoke
            document.body.style.background = 'linear-gradient(135deg, #4E4E50, #757575)'; // Smoky, hazy gray
            header.style.backgroundImage = 'linear-gradient(135deg, #4E4E50, #757575)';
            header.style.color = '#000';
            break;

        case 'f01d': // Freezing Rain
            document.body.style.background = 'linear-gradient(135deg, #BCC0C4, #DDE1E5)'; // Icy gray for freezing rain
            header.style.backgroundImage = 'linear-gradient(135deg, #BCC0C4, #DDE1E5)';
            header.style.color = '#000';
            break;

        default:
            document.body.style.background = 'linear-gradient(135deg, #E0E0E0, #FAFAFA)'; // Neutral default for unknown conditions
            header.style.backgroundImage = 'linear-gradient(135deg, #E0E0E0, #FAFAFA)';
            header.style.color = '#000';
            break;
    }
}

// Initial render of search history
renderSearchHistory();