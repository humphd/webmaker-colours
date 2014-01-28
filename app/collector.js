/*

TODO:

- validate scrape JSON against assets-schema.json

 */

angular.module('wmCollector', [])
  .controller('collectorController', ['$scope', '$http',
    function ($scope, $http) {

      $http({
        method: 'GET',
        url: 'mock2.json'
      })
        .success(function (data, status, headers, config) {
          $scope.scrapeData = data;
        })
        .error(function (data, status, headers, config) {});

      // Defaults

      $scope.swatchGroup = 'rgb';

    }
  ]);
