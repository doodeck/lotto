// alertcontroller.js

/* annihilate
.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
*/


angular.module('myApp.version.alertcontroller', [])
.controller('AlertCtrl', ['$scope', 'version', function ($scope, version) {
  $scope.alerts = [
    // { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Lotto picker app: v' + version.toString() }
  ];

  $scope.addAlert = function(type) {
    var newAlert = {msg: 'Another alert!'};
    if (!!type) {
      newAlert.type = type;
    }
    $scope.alerts.push(newAlert);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
}])
.directive('versionDiv', function() {
  return {
    template: '' +
      '<div ng-controller="AlertCtrl">' +
      '<alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)"> ' +
      '  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>&nbsp;{{alert.msg}}</alert>' +
      '</div>'
  };
});
