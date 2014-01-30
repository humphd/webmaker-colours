angular.module('wmCollector', ['wmCollector.directives'])
  .run(function () {

  })
  .config(function () {

  })
  .constant('lodash', window._)
  .controller('collectorController', ['$scope', '$http', 'lodash',
    function ($scope, $http, _) {

      function massageData(data) {
        data.fontFamilies = [];

        // Create an alphabetical list of font families from extracted fonts

        data.fonts.forEach(function (font) {
          data.fontFamilies.push(font.name);
        });

        data.fontFamilies = _.unique(data.fontFamilies).sort();

        return data;
      }

      // TEMP - Eventually json will be passed directly in from extension wrapper

      $http({
        method: 'GET',
        url: 'mock2.json'
      })
        .success(function (data, status, headers, config) {
          $scope.scrapeData = massageData(data);
        })
        .error(function (data, status, headers, config) {});

      // Defaults

      $scope.swatchGroup = 'rgb';

    }
  ]);
