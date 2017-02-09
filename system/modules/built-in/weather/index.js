const fetch = require("node-fetch");
const config = require("../../config");
const specialIds = require("./special-ids");

function onCurrentWeather(result) {
  const { city } = result.parameters;

  fetch(
    `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&APPID=${config.weather.openWeatherMapApiKey}`
  )
    .then(data => data.text(), err => handleNetworkError(err))
    .then(data => handleWeather(data, city))
    .catch(handleNetworkError);
}

function handleWeather(data, city) {
  let connectingWord = "a";

  try {
    const { weather } = JSON.parse(data);

    if (specialIds.includes(weather[0].id)) {
      connectingWord = "some";
    }

    console.log(
      `The current weather in ${city} consists of ${connectingWord} ${weather[
        0
      ].description}`
    );
  } catch (e) {
    handleNetworkError(e);
  }
}

function handleNetworkError(err) {
  throw err;
}

module.exports = {
  "weather.current": onCurrentWeather
};
