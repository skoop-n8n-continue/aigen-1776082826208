const LAHORE_COORDS = { lat: 31.5204, lon: 74.3587 };

// Weather data elements
const elements = {
    clock: document.getElementById('clock'),
    date: document.getElementById('date'),
    currentTemp: document.getElementById('current-temp'),
    condition: document.getElementById('weather-condition'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    visibility: document.getElementById('visibility'),
    uvIndex: document.getElementById('uv-index'),
    forecastContainer: document.getElementById('forecast-container'),
    lastUpdated: document.getElementById('last-updated'),
    weatherAnimation: document.getElementById('weather-animation-container'),
    tempChartCanvas: document.getElementById('tempChart')
};

let tempChart = null;

// Weather code mapping (WMO Weather interpretation codes)
const weatherMap = {
    0: { label: "Clear sky", icon: "☀️" },
    1: { label: "Mainly clear", icon: "🌤️" },
    2: { label: "Partly cloudy", icon: "⛅" },
    3: { label: "Overcast", icon: "☁️" },
    45: { label: "Foggy", icon: "🌫️" },
    48: { label: "Depositing rime fog", icon: "🌫️" },
    51: { label: "Drizzle: Light", icon: "🌦️" },
    53: { label: "Drizzle: Moderate", icon: "🌦️" },
    55: { label: "Drizzle: Dense intensity", icon: "🌦️" },
    61: { label: "Rain: Slight", icon: "🌧️" },
    63: { label: "Rain: Moderate", icon: "🌧️" },
    65: { label: "Rain: Heavy intensity", icon: "🌧️" },
    71: { label: "Snow fall: Slight", icon: "🌨️" },
    73: { label: "Snow fall: Moderate", icon: "🌨️" },
    75: { label: "Snow fall: Heavy intensity", icon: "🌨️" },
    80: { label: "Rain showers: Slight", icon: "🌦️" },
    81: { label: "Rain showers: Moderate", icon: "🌦️" },
    82: { label: "Rain showers: Violent", icon: "🌧️" },
    95: { label: "Thunderstorm: Slight or moderate", icon: "⛈️" },
    96: { label: "Thunderstorm with slight hail", icon: "⛈️" },
    99: { label: "Thunderstorm with heavy hail", icon: "⛈️" }
};

// Update Clock
function updateClock() {
    const now = new Date();

    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    elements.clock.textContent = `${hours}:${minutes}:${seconds}`;

    // Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    elements.date.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
}

// Fetch Weather Data
async function fetchWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAHORE_COORDS.lat}&longitude=${LAHORE_COORDS.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`;

        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();

        updateCurrentWeather(data.current);
        updateForecast(data.daily);
        updateChart(data.hourly);

        const now = new Date();
        elements.lastUpdated.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    } catch (error) {
        console.error("Error fetching weather:", error);
        elements.condition.textContent = "OFFLINE";
    }
}

function updateChart(hourly) {
    const next24Hours = hourly.time.slice(0, 24);
    const temperatures = hourly.temperature_2m.slice(0, 24);

    const labels = next24Hours.map(time => {
        const date = new Date(time);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    if (tempChart) {
        tempChart.data.labels = labels;
        tempChart.data.datasets[0].data = temperatures;
        tempChart.update();
    } else {
        const ctx = elements.tempChartCanvas.getContext('2d');
        tempChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatures,
                    backgroundColor: 'rgba(0, 183, 175, 0.6)',
                    borderColor: '#00b7af',
                    borderWidth: 1,
                    borderRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(16, 24, 31, 0.9)',
                        titleColor: '#00b7af',
                        bodyColor: '#ffffff',
                        borderColor: '#00b7af',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                family: 'Outfit'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                family: 'Outfit',
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
}

function updateCurrentWeather(current) {
    elements.currentTemp.textContent = Math.round(current.temperature_2m);

    const weatherInfo = weatherMap[current.weather_code] || { label: "Unknown", icon: "❓" };
    elements.condition.textContent = weatherInfo.label;

    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    elements.uvIndex.textContent = current.uv_index.toFixed(1);

    // Simple emoji animation/display
    elements.weatherAnimation.innerHTML = `<span style="font-size: 150px; display: inline-block; animation: float 3s ease-in-out infinite;">${weatherInfo.icon}</span>`;
}

function updateForecast(daily) {
    elements.forecastContainer.innerHTML = '';

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'TODAY' : days[date.getDay()];
        const weatherInfo = weatherMap[daily.weather_code[i]] || { icon: "❓" };

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        if (i === 0) forecastItem.style.background = 'rgba(0, 183, 175, 0.2)';

        forecastItem.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <span class="forecast-icon" style="font-size: 30px;">${weatherInfo.icon}</span>
            <span class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°</span>
            <span class="forecast-low">${Math.round(daily.temperature_2m_min[i])}°</span>
        `;

        elements.forecastContainer.appendChild(forecastItem);
    }
}

// Initialization
setInterval(updateClock, 1000);
updateClock();

fetchWeather();
// Refresh weather every 15 minutes
setInterval(fetchWeather, 15 * 60 * 1000);

// Add CSS animation for the icon
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
    }
`;
document.head.appendChild(style);
