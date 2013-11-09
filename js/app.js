/*
 *
 */

var app = angular.module('speedreadapp', ['ui.bootstrap', 'LocalStorageModule']);

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
    setComplexity: function(value) {
      complexity = value;
    },
    calculateLength: function() {
      length = Math.floor(streak / step) + length;
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
      step = 3;
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
    },

    getstep: function() {
      return step;
    },

    set: function(newstreak, newcomplexity, newlength, newtime, newstep) {
      streak = newstreak;
      complexity = newcomplexity;
      length = newlength;
      time = newtime;
      step = newstep;
    }

  };

});

app.controller('MainCtrl', ['$scope', '$timeout', 'userSrv', 'localStorageService', function($scope, $timeout, user, local) {

  $scope.chars = [
    '1234567890',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ];

  $scope.showmodal = true;
  $scope.showsettings = false;
  $scope.showimage = false;
  $scope.showinput = false;
  $scope.text = "";
  $scope.validation = "";
  $scope.lastcorrect = false;
  $scope.showscore = true;


  $scope.savedata = function() {
    if (local.isSupported) {
      local.add('streak',user.getstreak());
      local.add('complexity',user.getcomplexity());
      local.add('length',user.getlength());
      local.add('time',user.gettime());
      local.add('step',user.getstep());
    } else { 
      local.cookie.add('streak',user.getstreak());
      local.cookie.add('complexity',user.getcomplexity());
      local.cookie.add('length',user.getlength());
      local.cookie.add('time',user.gettime());
      local.cookie.add('step',user.getstep());
    }
  };

  $scope.loaddata = function() {
    if (local.isSupported) {
      user.set(local.get("streak"), 
               local.get("complexity"), 
               local.get("length"),
               local.get("time"),
               local.get("step"));
    } else {
      user.set(local.cookie.get("streak"), 
               local.cookie.get("complexity"), 
               local.cookie.get("length"),
               local.cookie.get("time"),
               local.cookie.get("step"));
    }
  };

  $scope.isfirsttime = function() {
    if (local.isSupported) return local.get("new") == null;
    else return local.cookie.get("new") == null;
  };

  $scope.visited = function() {
    if (local.isSupported) local.add("new", false);
    else local.cookie.add("new", false);
  }
  
  $scope.init = function() {
    if (!$scope.isfirsttime())  {
      $scope.loaddata();
      $scope.showmodal = false;
      $scope.showsettings = true;
    }

    $scope.visited();
  };

  $scope.init();

  $scope.gettext = function() {
    return $scope.text;
  };

  $scope.about = function() {
    $scope.showinput = false;
    $scope.showsettings = false;
    $scope.showmodal = true;
  };

  $scope.settings = function() {
    $scope.showmodal = false;
    $scope.showsettings = true;
  };

  $scope.start = function(value) {
    $scope.showsettings = false;
    user.setComplexity(value);
    wait = $timeout(function() {
      $scope.show($scope.generate(user.getlength(), user.getcomplexity()), user.gettime());
    }, 2000);
  };


  /* complexity = 0, 1, or 2 */
  $scope.generate = function() {
    user.calculateLength();
    user.calculateTime();
    $scope.savedata();
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
        $(".textbox").focus();
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

  $scope.whichscore = function() {
    return $scope.showscore;
  };

  $scope.togglescore = function() {
    $scope.showscore = !$scope.showscore;
  };

}]);

function DropdownCtrl($scope) {
  $scope.items = [
    "A work in progress..."
  ];
}

app.directive('about', function() {
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

app.directive('settings', function() {
    var definition = {
        priority: 1,
        templateUrl: 'settings.html',
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

app.directive('slide', function() {
    return {
        restrict: 'A',
	    link: function($scope, element, attrs) {
            $scope.$watch(attrs.show, function(value) {
                if (value) {
                  $(element).slideDown();
                } else {
                  $(element).slideUp();
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
