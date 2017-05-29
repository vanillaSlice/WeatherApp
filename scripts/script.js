$(document).ready(function () {
  
  'use strict';
  
  var geolocation = navigator.geolocation;
  
  // geolocation is not supported by this browser
  if (!geolocation) {
    // handler error
  }
  
  geolocation.getCurrentPosition(function (location) {
    $.simpleWeather({
      location: location.coords.latitude + ',' + location.coords.longitude,
      unit: 'c',
      success: function (weather) {
        console.log(weather);
        $('#loader').addClass('hidden');
        $('#weather-container').removeClass('hidden');
        $('#location').html(weather.city + ', ' + weather.country);
        $('#current-condition').html(weather.currently);
        $('#temperature').html(weather.temp + '&deg;');
        $('#condition-image').attr('title', weather.currently).attr('src', weather.image)
        for (var i = 0; i <= 5; i++) {
          $('#day-' + i + ' .day').html(weather.forecast[i].day);
          $('#day-' + i + ' .forecast-thumbnail').attr('title', weather.forecast[i].text).attr('src', weather.forecast[i].thumbnail);
          $('#day-' + i + ' .high').html(weather.forecast[i].high + '&deg;');
          $('#day-' + i + ' .low').html(weather.forecast[i].low + '&deg;');
        }
      }
    });
  });
  
});