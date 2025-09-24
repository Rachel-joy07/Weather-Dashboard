// Persist unit preference
let units = localStorage.getItem("weatherUnits") || "metric";
updateUnitButtons();

const apiKey = "9ca5d6627598660cd5fe67a703e37d0b";

// Search history
let searchHistory = JSON.parse(localStorage.getItem("weatherHistory")) || [];
renderHistory();

// Load last searched city on page load
const lastCity = searchHistory[0];
if(lastCity) getWeather(lastCity);

// Search button
$("#searchBtn").click(() => {
  const city = $("#cityInput").val().trim();
  if(city) {
    getWeather(city);
    saveCity(city);
  }
});

// Unit toggle buttons
$("#celsiusBtn").click(() => {
  units = "metric";
  localStorage.setItem("weatherUnits", units);
  updateUnitButtons();
  const city = $("#cityInput").val().trim();
  if(city) getWeather(city);
});

$("#fahrenheitBtn").click(() => {
  units = "imperial";
  localStorage.setItem("weatherUnits", units);
  updateUnitButtons();
  const city = $("#cityInput").val().trim();
  if(city) getWeather(city);
});

function updateUnitButtons(){
  if(units === "metric"){
    $("#celsiusBtn").addClass("active");
    $("#fahrenheitBtn").removeClass("active");
  } else {
    $("#fahrenheitBtn").addClass("active");
    $("#celsiusBtn").removeClass("active");
  }
}

// Save city to history
function saveCity(city){
  searchHistory = searchHistory.filter(c => c.toLowerCase() !== city.toLowerCase());
  searchHistory.unshift(city);
  if(searchHistory.length > 5) searchHistory.pop();
  localStorage.setItem("weatherHistory", JSON.stringify(searchHistory));
  renderHistory();
}

// Render search history buttons
function renderHistory(){
  let html = "";
  searchHistory.forEach(city => {
    html += `<button class="btn btn-outline-dark btn-sm history-btn">${city}</button>`;
  });
  $("#searchHistory").html(html);
}

// History button click
$(document).on("click", ".history-btn", function(){
  const city = $(this).text();
  $("#cityInput").val(city);
  getWeather(city);
});

// Function to decide text color based on background
function getTextColor(bgGradient){
  const lightColors = ["#fff9c4","#ffe082","#fceabb","#f8b500","#ff9966","#ff5e62","#ff512f","#dd2476","#f1f2f6"];
  for(const color of lightColors){
    if(bgGradient.includes(color)) return "#000"; // black for light gradients
  }
  return "#fff"; // white for dark gradients
}

// Fetch weather
function getWeather(city){
  const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

  // Current Weather
  $.getJSON(currentURL, data => {
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    let bgGradient = "";

    // Temp-based fallback
    if(temp <= 0) bgGradient = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
    else if(temp > 0 && temp <= 15) bgGradient = "linear-gradient(to bottom, #d7d2cc, #304352)";
    else if(temp > 15 && temp <= 25) bgGradient = "linear-gradient(to bottom, #fceabb, #f8b500)";
    else if(temp > 25 && temp <= 35) bgGradient = "linear-gradient(to bottom, #ff9966, #ff5e62)";
    else bgGradient = "linear-gradient(to bottom, #ff512f, #dd2476)";

    // Override for strong conditions
    if(weather.includes("rain") || weather.includes("drizzle")) bgGradient = "linear-gradient(to bottom, #74b9ff, #0984e3)";
    else if(weather.includes("snow")) bgGradient = "linear-gradient(to bottom, #f1f2f6, #dfe6e9)";
    else if(weather.includes("thunderstorm")) bgGradient = "linear-gradient(to bottom, #434343, #000000)";
    else if(weather.includes("mist") || weather.includes("fog") || weather.includes("haze")) bgGradient = "linear-gradient(to bottom, #d7d2cc, #304352)";

    const textColor = getTextColor(bgGradient);
    $("body").css("background", bgGradient);

    $("#currentWeather").html(`
      <div class="card weather-card p-4 text-center" style="background:${bgGradient}; color:${textColor};">
        <h2>${data.name}, ${data.sys.country}</h2>
        <h4>${new Date().toLocaleDateString()}</h4>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
        <h3>${Math.round(temp)}°${units === "metric" ? "C" : "F"}</h3>
        <p>🌡️ Humidity: ${data.main.humidity}%</p>
        <p>💨 Wind: ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}</p>
        <p>☁️ ${data.weather[0].description}</p>
      </div>
    `);
  }).fail(() => {
    $("#currentWeather").html(`<div class="alert alert-danger">City not found!</div>`);
  });

  // Forecast
  $.getJSON(forecastURL, data => {
    let forecastHTML = "";
    for(let i = 0; i < data.list.length; i+=8){
      const day = data.list[i];
      const date = new Date(day.dt_txt).toLocaleDateString();
      const temp = day.main.temp;
      const weather = day.weather[0].main.toLowerCase();
      let cardGradient = "";

      // Temp fallback
      if(temp <= 0) cardGradient = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
      else if(temp > 0 && temp <= 15) cardGradient = "linear-gradient(to bottom, #d7d2cc, #304352)";
      else if(temp > 15 && temp <= 25) cardGradient = "linear-gradient(to bottom, #fceabb, #f8b500)";
      else if(temp > 25 && temp <= 35) cardGradient = "linear-gradient(to bottom, #ff9966, #ff5e62)";
      else cardGradient = "linear-gradient(to bottom, #ff512f, #dd2476)";

      // Override
      if(weather.includes("rain") || weather.includes("drizzle")) cardGradient = "linear-gradient(to bottom, #74b9ff, #0984e3)";
      else if(weather.includes("snow")) cardGradient = "linear-gradient(to bottom, #f1f2f6, #dfe6e9)";
      else if(weather.includes("thunderstorm")) cardGradient = "linear-gradient(to bottom, #434343, #000000)";
      else if(weather.includes("mist") || weather.includes("fog") || weather.includes("haze")) cardGradient = "linear-gradient(to bottom, #d7d2cc, #304352)";

      const cardTextColor = getTextColor(cardGradient);

      forecastHTML += `
        <div class="col-md-2 col-6">
          <div class="card forecast-card p-3 text-center" style="background:${cardGradient}; color:${cardTextColor};">
            <h6>${date}</h6>
            <img class="weather-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p><strong>${Math.round(temp)}°${units === "metric" ? "C" : "F"}</strong></p>
            <p>${day.weather[0].description}</p>
          </div>
        </div>
      `;
    }
    $("#forecast").html(forecastHTML);
  });
}
