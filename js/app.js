/*
 *
 */

var app = angular.module('speedreadapp', ['ui.bootstrap', 'LocalStorageModule']);

app.service("userSrv", function() {

  var mode = -1; // Check if mode has been set once before
  var minlength = 3;
  var length = minlength;
  var streak = 0;
  var hiddenstreak = 0;
  var mintime = 100;
  var time = mintime;
  var stepup = 12;
  var stepdown = -4;
  var level = 0;

  return {

    calculateLevel: function() {
      if (hiddenstreak >= stepup) {
        level++;
        hiddenstreak = 0;
      }
      if (hiddenstreak <= stepdown) {
        level--;
        hiddenstreak = 0;
      }
      if (level < 0) level = 0;
    },

    setMode: function(value) {
      mode = value;
    },

    calculateLength: function() {
      length = minlength + level;
      if (length > 9) length = 9;
    },

    calculateTime: function() {
      time = mintime - (20 * level)  
      if (time < 10) time = 10;
    },

    increment: function() {
      streak++;
      hiddenstreak++;
    },

    reset: function() {
      streak = 0;
      hiddenstreak = 0;
    },

    /* Let's not have the visible streak go below 0 */
    decrement: function() {
      hiddenstreak--;
    },

    getlevel: function() {
      return level;
    },

    getstreak: function() {
      return streak;
    },

    getmode: function() {
      return mode;
    },

    getlength: function() {
      return length;
    },

    gettime: function() {
      return time;
    },

    setlevel: function(newlevel) {
      level = newlevel;
    }

  };

});

app.controller('MainCtrl', ['$scope', '$timeout', 'userSrv', 'localStorageService', function($scope, $timeout, user, local) {

  $scope.chars = [
    '1234567890',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
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
    if (local.isSupported) 
      local.add('level',user.getlevel());
    else 
      local.cookie.add('level',user.getlevel());
  };

  $scope.loaddata = function() {
    if (local.isSupported)
      user.setlevel(local.get("level"));
    else
      user.setlevel(local.cookie.get("level"));
  };

  $scope.isfirsttime = function() {
    if (local.isSupported) return local.get("level") == null;
    else return local.cookie.get("level") == null;
  };
  
  $scope.init = function() {
    if (!$scope.isfirsttime())  {
      $scope.loaddata();
      $scope.showmodal = false;
      $scope.showsettings = true;
    }
    user.setlevel(0);
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

  $scope.close = function() {
    $scope.showmodal = false;
    $scope.showsettings = false;
  };

  $scope.start = function(value) {
    $scope.showinput = false;
    $scope.showsettings = false;
    user.setMode(value);
    wait = $timeout(function() {
      $scope.show($scope.generate(user.getlength(), user.getmode()), user.gettime());
    }, 2000);
  };


  /* mode = 0, 1, or 2 */
  $scope.generate = function() {
    user.calculateLevel();
    user.calculateLength();
    user.calculateTime();
    $scope.savedata();
    var randomstring = "";
    for (var i = user.getlength(); i > 0; --i) 
      randomstring += $scope.chars[user.getmode()][Math.round(Math.random() * ($scope.chars[user.getmode()].length - 1))];
      
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
      $scope.show($scope.generate(user.getlength(), user.getmode()), user.gettime());
    }, 500);
  };

  $scope.streak = function() {
    return user.getstreak();
  };

  $scope.length = function() {
    return user.getlength();
  };

  $scope.mode = function() {
    return user.getmode();
  };

  $scope.time = function() {
    return user.gettime();
  };

  $scope.level = function() {
    return user.getlevel();
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
