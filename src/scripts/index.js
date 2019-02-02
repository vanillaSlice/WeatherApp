/*
 * Constants
 */

const apiKey = '1848f6048f074277990152812190202';
const baseUrl = 'https://api.apixu.com/v1/forecast.json';
const { geolocation } = navigator;
const defaultUnit = 'c';
const daysToForecast = 6;
const dayNames = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

/*
 * Variables
 */

let currentUnit = defaultUnit;
let currentWeather;

/*
 * DOM Elements
 */

const bodyElement = $('.js-body');
const loaderElement = $('.js-loader');
const weatherPanelElement = $('.js-weather-panel');
const temperatureContainerElement = $('.js-temperature-container');
const temperatureElement = $('.js-temperature');
const unitElements = $('.js-unit');
const cityElement = $('.js-city');
const countryElement = $('.js-country');
const currentConditionElement = $('.js-current-condition');

/*
 * Functions
 */

function displayErrorMessage(message) {
  bodyElement.html(`<p class="error-message js-error-message">${message}</p>`);
}

function handleUnsupportedGeolocation() {
  displayErrorMessage('Geolocation is not supported by this browser');
}

function setCurrentTemperature() {
  const currentTemperature = (currentUnit === 'c') ? currentWeather.current.temp_c : currentWeather.current.temp_f;
  temperatureElement.html(`${currentTemperature}&deg;`);
}

function setForecast() {
  for (let i = 0; i < daysToForecast; i += 1) {
    const forecast = currentWeather.forecast.forecastday[i];
    const dayName = dayNames[new Date(forecast.date).getDay()];
    const high = (currentUnit === 'c') ? forecast.day.maxtemp_c : forecast.day.maxtemp_f;
    const low = (currentUnit === 'c') ? forecast.day.mintemp_c : forecast.day.mintemp_f;
    $(`.js-day-${i} .js-day`).html(dayName);
    $(`.js-day-${i} .js-thumbnail`).attr({
      title: forecast.day.condition.text,
      src: forecast.day.condition.icon,
    });
    $(`.js-day-${i} .js-high`).html(`${high}&deg;`);
    $(`.js-day-${i} .js-low`).html(`${low}&deg;`);
  }
}

function handleGetWeatherSuccess(res) {
  currentWeather = res;

  temperatureContainerElement.css('background-image', `url(${res.current.condition.icon})`);

  setCurrentTemperature();

  cityElement.html(res.location.name);
  countryElement.html(res.location.country);
  currentConditionElement.html(res.current.condition.text);

  setForecast();

  loaderElement.addClass('hidden');

  weatherPanelElement.addClass('fade-in').removeClass('hidden');
}

function handleGetWeatherError(err) {
  displayErrorMessage(err.responseJSON.error.message);
}

function handleGetCurrentPositionSuccess(position) {
  const { coords } = position;
  const url = `${baseUrl}?key=${apiKey}&q=${coords.latitude},${coords.longitude}&days=${daysToForecast}`;

  $.get(url)
    .done(handleGetWeatherSuccess)
    .fail(handleGetWeatherError);
}

function handleGetCurrentPositionError(err) {
  displayErrorMessage(`Could not get current position: ${err.message}`);
}

function handleSupportedGeolocation() {
  geolocation.getCurrentPosition(
    handleGetCurrentPositionSuccess,
    handleGetCurrentPositionError,
    { enableHighAccuracy: true },
  );
}

function handleUnitChange(e) {
  currentUnit = e.target.value;
  setCurrentTemperature();
  setForecast();
}

/*
 * Initialise
 */

if (!geolocation) {
  handleUnsupportedGeolocation();
} else {
  handleSupportedGeolocation();
}

unitElements.click(handleUnitChange);
