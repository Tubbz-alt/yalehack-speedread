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
  var higheststreak = 0;
  var mintime = 100;
  var time = mintime;
  var stepup = 5;
  var stepdown = -2;
  var level = 0;
  var highestlevel = 0;

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
      length = minlength + parseInt(level);
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

    gethighestlevel: function() {
      return highestlevel;
    },

    gethigheststreak: function() {
      return higheststreak;
    },

    setlevel: function(newlevel) {
      level = newlevel;
    },

    sethighestlevel: function(newlevel) {
      highestlevel = newlevel;
    },

    sethigheststreak: function(streak) {
      higheststreak = streak;
    },

    cleardata: function() {
      level = 0;
      highestlevel = 0;
      higheststreak = 0;
    }
  };
});

app.controller('MainCtrl', ['$scope', '$timeout', 'userSrv', 'localStorageService', function($scope, $timeout, user, local) {

  $scope.chars = [
    '1234567890',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ];

  $scope.views = {
    about: 'about',
    settings: 'settings',
    input: 'input',
    text: 'text',
    confirm: 'confirm',
    none: 'none'
  }
  $scope.scores = {
    simple: 'simple',
    more: 'more'
  }

  $scope.view = $scope.views.settings; // Available values are 'about', 'settings', 'input', 'text', 'confirm', or 'none'
  $scope.score = $scope.scores.simple; // Available values are 'simple', 'more'

  /* Getters */
  $scope.streak = function() {
    return user.getstreak();
  };

  $scope.higheststreak = function() {
    return user.gethigheststreak();
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
  
  $scope.highestlevel = function() {
    return user.gethighestlevel();
  };

  $scope.save = function(key, value) {
    if (local.isSupported) local.add(key, value);
    else local.cookie.add(key, value);
  };

  $scope.load = function(key) {
    if (local.isSupported) return local.get(key);
    else return local.cookie.get(key);
  };

  $scope.savedata = function() {
    $scope.save('level', $scope.level());

    if ($scope.higheststreak() == 0 || $scope.higheststreak() < $scope.streak()) {
      user.sethigheststreak($scope.streak());
      $scope.save('higheststreak', $scope.streak());
    }
    if ($scope.highestlevel() == 0 || $scope.highestlevel() < $scope.level()) {
      user.sethighestlevel($scope.level());
      $scope.save('highestlevel', $scope.level());
    }
  };

  $scope.loaddata = function() {
    user.setlevel($scope.load('level'));
    user.sethigheststreak($scope.load('higheststreak'));
    user.sethighestlevel($scope.load('highestlevel'));
  };

  $scope.hasdata = function() {
    return $scope.load('level') !== null;
  };
  
  $scope.init = function() {
    if (!$scope.hasdata())  {
      $scope.view = $scope.views.about;
      $scope.savedata();
    }
    $scope.loaddata();
  };

  $scope.init(); // Initialize the app

  $scope.gettext = function() {
    return $scope.text;
  };

  $scope.changeview = function(newview) {
    $scope.view = newview;
  };

  $scope.show = function(view) {
    return $scope.view == view;
  };

  $scope.start = function(value) {
    $scope.view = $scope.views.none;
    user.setMode(value);
    wait = $timeout(function() {
      if ($scope.hasdata()) { 
        $scope.flash($scope.generate(user.getlength(), user.getmode()), user.gettime());
      } else {
        $scope.flash($scope.generate(user.getlength(), user.getmode()), 500);
      }
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
      return randomstring;
  };

  $scope.flash = function(whattext, howlong) {
    wait = $timeout(function() { /* wait */ 
      $scope.text = whattext;
      $scope.view = $scope.views.text;
    
      /* Hide after howlong */
      hide = $timeout(function() {
        $scope.view = $scope.views.input;
        $scope.$apply();
        $(".textbox").focus();
      }, howlong);
    }, 500);

  };

  $scope.checkanswer = function() {
    return $scope.validation;
  };

  $scope.submit = function(input) {

    if ($scope.text == angular.uppercase(input)) {
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
      $scope.view = $scope.views.none;
      $scope.answer = "";
      $scope.validation = "";
      $scope.flash($scope.generate(user.getlength(), user.getmode()), user.gettime());
    }, 500);
  };

  $scope.reset = function() {
    local.clearAll();
    local.cookie.clearAll();
    user.cleardata();
  };

  $scope.togglescore = function() {
    if ($scope.score == $scope.scores.simple)
      $scope.score = $scope.scores.more;
    else
      $scope.score = $scope.scores.simple;
  };

  $scope.display = function(score) {
    return $scope.score == score;
  };
}]);

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

app.directive('prompt', function() {
    var definition = {
        priority: 1,
        templateUrl: 'prompt.html',
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
