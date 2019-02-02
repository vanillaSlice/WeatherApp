const { geolocation } = navigator;
const defaultUnit = 'c';
const daysToForecast = 5;
let currentUnit = defaultUnit;
let currentWeather;

/*
 * DOM elements
 */

const bodyElement = $(document.body);
const loaderElement = $('.loader');
const weatherPanelElement = $('.weather-panel');
const temperatureContainerElement = $('.temperature-container');
const temperatureElement = $('.temperature-container__temperature');
const unitElements = $('.temperature-container__unit');
const cityElement = $('.weather-panel__city');
const countryElement = $('.weather-panel__country');
const currentConditionElement = $('.weather-panel__current-condition');

function displayErrorMessage(message) {
  bodyElement.html(`<p class="error-message">${message}</p>`);
}

function handleUnsupportedGeolocation() {
  displayErrorMessage('Geolocation is not supported by this browser');
}

function setCurrentTemperature() {
  const currentTemperature = (currentUnit === defaultUnit) ? currentWeather.temp
    : currentWeather.alt.temp;
  temperatureElement.html(`${currentTemperature}&deg;`);
}

function setForecast() {
  for (let i = 0; i <= daysToForecast; i += 1) {
    const forecast = (currentUnit === defaultUnit) ? currentWeather.forecast[i]
      : currentWeather.forecast[i].alt;
    const dayId = `#day-${i}`;
    $(`${dayId} .forecast-table__day`).html(forecast.day);
    $(`${dayId} .forecast-table__thumbnail`).attr({
      title: forecast.text,
      src: forecast.thumbnail,
    });
    $(`${dayId} .forecast-table__high`).html(`${forecast.high}&deg;`);
    $(`${dayId} .forecast-table__low`).html(`${forecast.low}&deg;`);
  }
}

function handleSimpleWeatherSuccess(data) {
  currentWeather = data;

  // change current day name
  currentWeather.forecast[0].day = 'Today';

  temperatureContainerElement.css('background-image', `url(${currentWeather.image})`);

  setCurrentTemperature();

  cityElement.html(currentWeather.city);
  countryElement.html(currentWeather.country);
  currentConditionElement.html(currentWeather.currently);

  setForecast();

  // hide loader
  loaderElement.addClass('hidden');

  // show weather panel
  weatherPanelElement.addClass('fade-in').removeClass('hidden');
}

function handleSimpleWeatherError(error) {
  displayErrorMessage(error);
}

function handleGetCurrentPositionSuccess(position) {
  const { coords } = position.coords;
  $.simpleWeather({
    location: `${coords.latitude},${coords.longitude}`,
    unit: currentUnit,
    success: handleSimpleWeatherSuccess,
    error: handleSimpleWeatherError,
  });
}

function handleGetCurrentPositionError(error) {
  displayErrorMessage(`Could not get current position: ${error.message}`);
}

function handleSupportedGeolocation() {
  geolocation.getCurrentPosition(
    handleGetCurrentPositionSuccess,
    handleGetCurrentPositionError,
    { enableHighAccuracy: true },
  );
}

if (!geolocation) {
  handleUnsupportedGeolocation();
} else {
  handleSupportedGeolocation();
}

unitElements.click(() => {
  // only update temperatures if unit is different
  if (currentUnit === this.value) {
    return;
  }

  currentUnit = this.value;
  setCurrentTemperature();
  setForecast();
});
