$(document).ready(function() {

  'use strict';

  var geolocation = navigator.geolocation;
  var defaultUnit = 'c';
  var currentUnit = defaultUnit;
  var currentWeather;
  var daysToForecast = 5;

  /*
   * DOM elements.
   */
  var bodyElement = $(document.body);
  var loaderElement = $('.loader');
  var weatherPanelElement = $('.weather-panel');
  var temperatureContainerElement = $('.temperature-container');
  var temperatureElement = $('.temperature-container__temperature');
  var unitElements = $('.temperature-container__unit');
  var cityElement = $('.weather-panel__city');
  var countryElement = $('.weather-panel__country');
  var currentConditionElement = $('.weather-panel__current-condition');

  function displayErrorMessage(message) {
    bodyElement.html('<p class="error-message">' + message + '</p>');
  }

  if (!geolocation) {
    handleUnsupportedGeolocation();
  } else {
    handleSupportedGeolocation();
  }

  function handleUnsupportedGeolocation() {
    displayErrorMessage('Geolocation is not supported by this browser');
  }

  function handleSupportedGeolocation() {
    geolocation.getCurrentPosition(
      handleGetCurrentPositionSuccess,
      handleGetCurrentPositionError,
      { enableHighAccuracy: true }
    );
  }

  function handleGetCurrentPositionSuccess(position) {
    var coords = position.coords;
    $.simpleWeather({
      location: coords.latitude + ',' + coords.longitude,
      unit: currentUnit,
      success: handleSimpleWeatherSuccess,
      error: handleSimpleWeatherError
    });
  }

  function handleSimpleWeatherSuccess(data) {
    currentWeather = data;

    // change current day name
    currentWeather.forecast[0].day = 'Today';
    
    temperatureContainerElement.css('background-image', 'url(' + currentWeather.image + ')');
    
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

  function setCurrentTemperature() {
    var currentTemperature = (currentUnit === defaultUnit) ? currentWeather.temp : currentWeather.alt.temp;
    temperatureElement.html(currentTemperature + '&deg;');
  }

  function setForecast() {
    for (var i = 0; i <= daysToForecast; i++) {
      var forecast = (currentUnit === defaultUnit) ? currentWeather.forecast[i] : currentWeather.forecast[i].alt;
      var dayId = '#day-' + i;
      $(dayId + ' .forecast-table__day').html(forecast.day);
      $(dayId + ' .forecast-table__thumbnail').attr({
        title: forecast.text,
        src: forecast.thumbnail
      });
      $(dayId + ' .forecast-table__high').html(forecast.high + '&deg;');
      $(dayId + ' .forecast-table__low').html(forecast.low + '&deg;');
    }
  }

  function handleSimpleWeatherError(error) {
    displayErrorMessage(error);
  }

  function handleGetCurrentPositionError(error) {
    displayErrorMessage('Could not get current position: ' + error.message);
  }

  unitElements.click(function() {
    // only update temperatures if unit is different
    if (currentUnit == this.value) {
      return;
    }

    currentUnit = this.value;
    setCurrentTemperature();
    setForecast();
  });

});