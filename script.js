document.getElementById('getWeather').addEventListener('click', getWeather);
document.getElementById('getCurrentLocationWeather').addEventListener('click', getCurrentLocationWeather);
document.getElementById('toggleUnit').addEventListener('click', toggleUnit);

let isCelsius = true;

function getWeather() {
    const location = document.getElementById('location').value;
    if (location) {
        fetchWeatherDataByCity(location);
    } else {
        alert('Please enter a city name.');
    }
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByCoordinates(latitude, longitude);
        }, error => {
            console.error(error);
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

async function fetchWeatherDataByCity(city) {
    try {
        const apiKey = '165bc134b67cfac2abfefff70ea064a7';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeatherData(data);
        setBackground(data.weather[0].main.toLowerCase(), true);
    } catch (error) {
        document.getElementById('weatherData').innerText = error.message;
    }
}

async function fetchWeatherDataByCoordinates(lat, lon) {
    try {
        const apiKey = '165bc134b67cfac2abfefff70ea064a7';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error('Location not found');
        const data = await response.json();
        displayWeatherData(data);
        setBackground(data.weather[0].main.toLowerCase(), true);
    } catch (error) {
        document.getElementById('weatherData').innerText = error.message;
    }
}

function displayWeatherData(data) {
    const weatherDataDiv = document.getElementById('weatherData');
    weatherDataDiv.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${convertTemperature(data.main.temp)}</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function toggleUnit() {
    isCelsius = !isCelsius;
    const currentTemp = parseFloat(document.querySelector('#weatherData p:nth-child(2)').innerText.split(' ')[1]);
    document.querySelector('#weatherData p:nth-child(2)').innerText = `Temperature: ${convertTemperature(currentTemp)}`;
}

function convertTemperature(temp) {
    return isCelsius ? `${temp}°C` : `${(temp * 9/5 + 32).toFixed(2)}°F`;
}

function setBackground(weather, time) {
    let backgroundUrl = '';
    const hour = new Date().getHours();

    if (time) {
        backgroundUrl = (hour >= 6 && hour < 18) ? 'image/day1.jpeg' : 'image/night.jpeg';
    }

    switch (weather) {
        case 'clear':
            backgroundUrl = (hour >= 6 && hour < 18) ? 'image/sunny.jpeg' : 'image/clear_night.jpeg';
            break;
        case 'rain':
            backgroundUrl = 'image/rainy.jpeg';
            break;
        case 'clouds':
            backgroundUrl = 'image/cloudy.jpeg';
            break;
        case 'snow':
            backgroundUrl = 'image/snowy.webp';
            break;
        case 'thunderstorm':
            backgroundUrl = 'image/thunderstorm.jpeg';
            break;
        case 'drizzle':
            backgroundUrl = 'image/drizzle.jpeg';
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            backgroundUrl = 'image/mist.webp';
            break;
        default:
            backgroundUrl = 'image/day.jpeg';
    }

    document.body.style.backgroundImage = `url(${backgroundUrl})`;
}

document.getElementById('location').addEventListener('input', async function () {
    const query = this.value;
    if (query.length < 3) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    try {
        const apiKey = '165bc134b67cfac2abfefff70ea064a7';
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
        if (!response.ok) throw new Error('Error fetching city suggestions');
        const cities = await response.json();
        const suggestionsDiv = document.getElementById('suggestions');
        suggestionsDiv.innerHTML = '';
        cities.forEach(city => {
            const suggestion = document.createElement('div');
            suggestion.innerText = city.name;
            suggestion.addEventListener('click', () => {
                document.getElementById('location').value = city.name;
                suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(suggestion);
        });
    } catch (error) {
        console.error(error);
    }
});
