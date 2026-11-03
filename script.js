
const API_KEY = "ffd0566a2bb144c51eb1b90290428fdb";



const cityInput = document.getElementById("city");
const searchForm = document.getElementById("searchForm");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const weatherSection = document.getElementById("weatherSection");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const forecastContainer = document.getElementById("forecastContainer");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesList = document.getElementById("favoritesList");
const themeBtn = document.getElementById("themeBtn");




let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

let currentCity = "";
let debounceTimer;
let requestNumber = 0;




async function getWeather(city) {

    const thisRequest = ++requestNumber;

    try {

        loading.hidden = false;
        errorMsg.hidden = true;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }



        if (thisRequest !== requestNumber) return;

        

        currentCity = data.name;

        cityName.textContent = data.name;
        weatherDescription.textContent = data.weather[0].description;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} m/s`;

        weatherSection.hidden = false;

    

        await getForecast(city, thisRequest);

    }

    catch (error) {

        if (thisRequest !== requestNumber) return;

        errorMsg.textContent = error.message;
        errorMsg.hidden = false;
        weatherSection.hidden = true;

    }

    finally {

        if (thisRequest === requestNumber) {
            loading.hidden = true;
        }

    }

}




async function getForecast(city, thisRequest) {

    try {

        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (thisRequest !== requestNumber) return;

        forecastContainer.innerHTML = "";

        

        const dailyForecasts = {};

        data.list.forEach(item => {

            const date = item.dt_txt.split(" ")[0];

            const hour = Number(
                item.dt_txt.split(" ")[1].slice(0, 2)
            );

            if (!dailyForecasts[date]) {

                dailyForecasts[date] = item;

            } else {

                const savedHour = Number(
                    dailyForecasts[date].dt_txt.split(" ")[1].slice(0, 2)
                );

                if (Math.abs(hour - 12) < Math.abs(savedHour - 12)) {
                    dailyForecasts[date] = item;
                }

            }

        });

        

        Object.values(dailyForecasts).slice(0, 5).forEach(item => {

            const date = new Date(item.dt_txt.replace(" ", "T"));

            const day = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            const temp = Math.round(item.main.temp);
            const description = item.weather[0].description;

            const card = document.createElement("div");
            card.classList.add("forecast-card");

            const dayHeading = document.createElement("h3");
            dayHeading.textContent = day;

            const tempText = document.createElement("p");
            tempText.textContent = `${temp}°C`;

            const descriptionText = document.createElement("p");
            descriptionText.textContent = description;

            card.appendChild(dayHeading);
            card.appendChild(tempText);
            card.appendChild(descriptionText);

            forecastContainer.appendChild(card);

        });

    }

    catch (error) {

        if (thisRequest !== requestNumber) return;

        console.log("Forecast error:", error.message);

        forecastContainer.innerHTML = "<p>Forecast is currently unavailable.</p>";

    }

}




searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    clearTimeout(debounceTimer);

    const city = cityInput.value.trim();

    if (city === "") return;

    getWeather(city);

});




function debounceSearch() {

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function() {

        const city = cityInput.value.trim();

        if (city !== "") {
            getWeather(city);
        }

    }, 500);

}

cityInput.addEventListener("input", debounceSearch);


function addFavorite(city) {

    const alreadyExists = favorites.some(item =>
        item.toLowerCase() === city.toLowerCase()
    );

    if (alreadyExists) {

        alert("City already added!");
        return;

    }

    favorites.push(city);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayFavorites();

}


function displayFavorites() {

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

        const message = document.createElement("p");
        message.textContent = "No favorite cities yet.";

        favoritesList.appendChild(message);

        return;

    }

    favorites.forEach(city => {

        const cityItem = document.createElement("div");
        cityItem.classList.add("favorite-item");

        const cityButton = document.createElement("button");
        cityButton.classList.add("favorite-city");
        cityButton.textContent = city;

        

        cityButton.addEventListener("click", function() {

            cityInput.value = city;
            getWeather(city);

        });

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("removeBtn");
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", function() {

            removeFavorite(city);

        });

        cityItem.appendChild(cityButton);
        cityItem.appendChild(removeBtn);

        favoritesList.appendChild(cityItem);

    });

}


function removeFavorite(city) {

    favorites = favorites.filter(item =>
        item.toLowerCase() !== city.toLowerCase()
    );

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayFavorites();

}




favoriteBtn.addEventListener("click", function() {

    if (!currentCity || weatherSection.hidden) {

        alert("Please search for a city first!");
        return;

    }

    addFavorite(currentCity);

});




themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {

        themeBtn.textContent = "☀️ Light Mode";

    } else {

        themeBtn.textContent = "🌙 Dark Mode";

    }

});




displayFavorites();
