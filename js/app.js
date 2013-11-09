/*
 *
 */

var app = angular.module('speedreadapp', ['ui.bootstrap']);

app.service("userSrv", function() {

  var streak = 0;
  var complexity = 0;
  var length = 3;
  var time = 500;
  var step = 3;

  return {

    calculateStep: function() {
      if (streak >= step)
        step = step * 1.61803398875;
    },
    calculateComplexity: function() {
      complexity = 2;
    },
    calculateLength: function() {
      length = length + Math.floor(streak / step);
      if (length < 3) length = 3;
    },

    calculateTime: function() {
      time = time - (streak * 10)  
      if (time > 1000) time = 1000;
      if (time < 10) time = 10;
    },

    increment: function() {
      streak++;
    },

    reset: function() {
      streak = 0;
    },

    decrement: function() {
      streak--;
    },

    getstreak: function() {
      return streak;
    },

    getcomplexity: function() {
      return complexity;
    },

    getlength: function() {
      return length;
    },

    gettime: function() {
      return time;
    }

  };

});

app.controller('MainCtrl', ['$scope', '$timeout', 'userSrv', function($scope, $timeout, user) {

  $scope.chars = [
    '1234567890',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*+-=,.?/',
  ];

  $scope.showmodal = true;
  $scope.showimage = false;
  $scope.showinput = false;
  $scope.text = "";
  $scope.validation = "";
  $scope.lastcorrect = false;
  

  $scope.gettext = function() {
    return $scope.text;
  };

  $scope.start = function() {
    $scope.showmodal = false;
    wait = $timeout(function() {
      $scope.show($scope.generate(user.getlength(), user.getcomplexity()), user.gettime());
    }, 2000);
  };


  /* complexity = 0, 1, or 2 */
  $scope.generate = function() {
    user.calculateComplexity();
    user.calculateLength();
    user.calculateTime();
    var randomstring = "";
    for (var i = user.getlength(); i > 0; --i) 
      randomstring += $scope.chars[user.getcomplexity()][Math.round(Math.random() * ($scope.chars[user.getcomplexity()].length - 1))];
      
      console.log(randomstring);
      return randomstring;
  };

  $scope.show = function(whattext, howlong) {
    wait = $timeout(function() { /* wait */ 
      $scope.showinput = false;
      $scope.text = whattext;
      $scope.showimage = true;
    
      /* Hide after howlong */
      hide = $timeout(function() {
        $scope.showimage = false;
        $scope.showinput = true;
      }, howlong);
    }, 500);

  };

  $scope.checkanswer = function() {
    return $scope.validation;
  };

  $scope.submit = function(input) {

    if ($scope.text == input) {
      if (!$scope.lastcorrect) user.reset();
      $scope.lastcorrect = true;
      user.increment();
      $scope.validation = "correct";
    } else {
      if ($scope.lastcorrect) user.reset();
      $scope.lastcorrect = false;
      user.decrement();
      $scope.validation = "incorrect";
    }

    wait = $timeout(function() {
      $scope.showinput = false;
      $scope.answer = "";
      $scope.validation = "";
      $scope.show($scope.generate(user.getlength(), user.getcomplexity()), user.gettime());
    }, 500);
  };

  $scope.streak = function() {
    return user.getstreak();
  };

  $scope.length = function() {
    return user.getlength();
  };

  $scope.complexity = function() {
    return user.getcomplexity();
  };

  $scope.time = function() {
    return user.gettime();
  };
}]);

app.directive('modal', function() {
    var definition = {
        priority: 1,
        templateUrl: 'about.html',
        replace: true,
        transclude: false,
        restrict: 'EAC',
        scope: false,
    };
    return definition;
});

app.directive('slideDown', function() {
    return {
        restrict: 'A',
	    link: function($scope, element, attrs) {
            $scope.$watch(attrs.show, function(value) {
                if (value) {
                    $(element).fadeIn(200);
                } else {
                    $(element).fadeOut(200);
                }
            });
        }
    };
});

app.directive('validateAnswer', function() {
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
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
