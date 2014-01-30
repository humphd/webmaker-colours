angular.module('wmCollector.directives', [])
  .directive('verifySrc', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var elPreloader = angular.element('<img>');

        elPreloader.on('load', function () {
          element.attr('src', attrs.verifySrc);
        });

        elPreloader.attr('src', attrs.verifySrc);
      }
    };
  });
