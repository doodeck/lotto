// alertcontroller.js

/* annihilate
.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);
*/


angular.module('myApp.version.alertcontroller', [])
.controller('AlertCtrl', ['$rootScope', '$scope', '$timeout', 'version', function ($rootScope, $scope, $timeout, version) {
  $scope.alerts = [
    // { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Lotto picker app: v' + version.toString() }
  ];
  $scope.runningIndex = 0;

  // $scope.classNameList=['Box1','Box2','Box3'];
  $scope.myGlyphicons={
      success: "glyphicon glyphicon-info-sign",
      danger: "glyphicon glyphicon-ban-circle",
      warning: "glyphicon glyphicon-warning-sign"
  };

  $rootScope.addAlert = $scope.addAlert = function(msg, type) {
    var newAlert = { index: $scope.runningIndex++, msg: msg };
    if (!!type) {
      newAlert.type = type;
    } else {
      newAlert.type = 'warning';
    }
    $scope.alerts.splice(0, 0, newAlert);
    $timeout(function() {
      console.log('Timeouted: ', newAlert);
      $scope.removeAlert(newAlert.index);
      $scope.$apply();
    }, 4000 /*delay*/, false /*invokeApply*/);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.removeAlert = function(index) {
    for (var i = 0; i < $scope.alerts.length; i++) {
      if (index === $scope.alerts[i].index) {
        $scope.alerts.splice(i, 1);
      }
    }
  }

}])
.directive('versionDiv', function() {
  return {
    template: '' +
      '<div ng-controller="AlertCtrl">' +
      '<alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)"> ' +
      '  <span ng-class="myGlyphicons[alert.type]" aria-hidden="true"></span>&nbsp;{{alert.msg}}</alert>' +
      '</div>'
  };
});
