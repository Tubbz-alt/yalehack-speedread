/*
 *
 */

var app = angular.module('speedreadapp', []);

app.controller('MainCtrl', ['$scope', '$timeout', function($scope, $timeout) {

  $scope.chars = [
    '1234567890',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*+-=,.?/',
  ];

  $scope.started = false;
  $scope.showimage = false;
  $scope.showinput = false;
  $scope.text = "";
  $scope.correct = false;
  

  $scope.gettext = function() {
    return $scope.text;
  };

  $scope.start = function() {
    $scope.started = true;
    $scope.show($scope.generate(3, 0), 300);
  };

  /* complexity = 0, 1, or 2 */
  $scope.generate = function(length, complexity) {
    var randomstring = "";
    for (var i = length; i > 0; --i) 
      randomstring += $scope.chars[complexity][Math.round(Math.random() * ($scope.chars[complexity].length - 1))];
      
      console.log(randomstring);
      return randomstring;
  };

  $scope.show = function(whattext, howlong) {
    wait = $timeout(function() { /* wait */ }, 4000);

    $scope.showinput = false;
    $scope.text = whattext;
    $scope.showimage = true;
  
    /* Hide after howlong */
    hide = $timeout(function() {
      $scope.text = "";
      $scope.showimage = false;
      $scope.showinput = true;
    }, howlong);

  };

  $scope.checkanswer = function() {
    if ($scope.correct)
      return "correct";
    else
      return "incorrect";
  };

  $scope.submit = function(input) {
    $scope.correct = ($scope.text == input ? true : false);
    $scope.show($scope.generate(3, 0), 300);


    

  };


}]);

app.directive('validateAnswer', function() {
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
      console.log("testing", viewValue, scope.text);
        if (viewValue == scope.text) {
          ctrl.$setValidity('answer', true);
          return viewValue;
        } else {
          ctrl.$setValidity('answer', false);
          return 'Invalid UPC';
        }
      });
    }
  };
});
