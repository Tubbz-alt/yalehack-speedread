/* SpeedReader - A tool for improving reading speed and comprehension
 * Robert Rotaru & Daniel Friedman, Y-Hack 2013
 */

angular.module('speedread', ['ngAnimate', 'ui.bootstrap', 'LocalStorageModule'])

.service("userSrv", function() {

  var mode = -1; // Check if mode has been set once before
  var minlength = 3;
  var length = minlength;
  var streak = 0;
  var hiddenstreak = 0;
  var higheststreak = 0;
  var mintime = 100;
  var time = mintime;
  var stepup = 12;
  var stepdown = -4;
  var level = 0;
  var highestlevel = 0;

  return {

    calculateLevel: function() {
      if (hiddenstreak >= stepup) {
        level++;
        hiddenstreak = 0;
      }
      if (hiddenstreak < 0) {
        if (level > 0) {
          hiddenstreak = 12 + hiddenstreak;
        } else {
          hiddenstreak = 0;
        }
        level--;
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
      if (time < 20) time = 20;
    },

    increment: function(val) {
      streak += val;
      hiddenstreak += val;
    },

    decrement: function(val) {
      hiddenstreak -= val;
    },

    resetstreak: function() {
      streak = 0;
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

    getprogress: function() {
      return hiddenstreak / stepup;
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
})

.controller('MainCtrl', ['$scope', '$timeout', 'userSrv', 'localStorageService', 'animate', function($scope, $timeout, user, local, animate) {

  $scope.chars = [
    '1234567890',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ];

  $scope.words = words;

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

  $scope.progress = function() {
    return user.getprogress() * 100;
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
    return $scope.load('uuid') !== null;
  };
  
  $scope.init = function() {
    $scope.loaddata();
    if (!$scope.hasdata())  {
      $scope.firsttime = true;
      $scope.view = $scope.views.about;
      $scope.save('uuid', uuid());
      user.cleardata();
      $scope.savedata();
    }
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
    // Wait for modal to fade out
    $timeout(function() {
        animate(function() {
            // First turn easy, otherwise normal.
            if ($scope.firsttime) { 
              $scope.flash($scope.generate(), 500);
            } else {
              $scope.flash($scope.generate(), 100); // Weird error where text doesn't display if this goes below 60
            }
        });
    }, 1000);
  };

  /* mode = 0, 1, 2, or 3 */
  $scope.generate = function() {
    user.calculateLevel();
    user.calculateLength();
    user.calculateTime();
    $scope.savedata();
    var time = user.gettime();
    var randomstring = "";
    if (user.getmode() != 3) {
        for (var i = user.getlength(); i > 0; --i) 
          randomstring += $scope.chars[user.getmode()][Math.round(Math.random() * ($scope.chars[user.getmode()].length - 1))];
    } else {
        randomstring = $scope.words[user.getlength()][Math.round(Math.random() * ($scope.words[user.getlength()].length - 1))];
    }
    return {text: randomstring, duration: time};
  };

  $scope.flash = function(args, overrideduration) {
      var duration = overrideduration? overrideduration : args.duration;
      var text = args.text;

      // Pause before flashing text
      $timeout(function() {
          animate(function() {
              $scope.text = text;
              $scope.view = $scope.views.text;
          });
          // Hide text
          $timeout(function() {
              animate(function() {
                  $scope.view = $scope.views.input;
              });
          }, duration);
      }, duration * 2);
  };

  $scope.checkanswer = function() {
    return $scope.validation;
  };

  $scope.submit = function(input) {

    if ($scope.text == angular.uppercase(input)) {
      $scope.lastcorrect = true;
      user.increment(1);
      $scope.validation = "correct";
    } else {
      $scope.lastcorrect = false;
      user.resetstreak();
      user.decrement(3);
      $scope.validation = "incorrect";
    }

    $scope.view = $scope.views.none;
    $scope.answer = "";
    $scope.validation = "";
    $scope.flash($scope.generate());
  };

  $scope.reset = function() {
    local.clearAll();
    local.cookie.clearAll();
    user.cleardata();
  };

  $scope.togglescore = function() {
    $scope.score == $scope.scores.simple ? $scope.score = $scope.scores.more : $scope.score = $scope.scores.simple;
  };

  $scope.display = function(score) {
    return $scope.score == score;
  };
}])

.directive('about', function() {
    var definition = {
        priority: 1,
        templateUrl: 'about.html',
        replace: true,
        transclude: false,
        restrict: 'EAC',
        scope: false,
    };
    return definition;
})

.directive('prompt', function() {
    var definition = {
        priority: 1,
        templateUrl: 'prompt.html',
        replace: true,
        transclude: false,
        restrict: 'EAC',
        scope: false,
    };
    return definition;
})

.directive('settings', function() {
    var definition = {
        priority: 1,
        templateUrl: 'settings.html',
        replace: true,
        transclude: false,
        restrict: 'EAC',
        scope: false,
    };
    return definition;
})

.directive('setFocus', function () {
    return {
        restrict: 'A',
        scope: {
          isFocused: "=setFocus"
        },
        link: function (scope, element) {
          scope.$watch("isFocused", function(val, oldval) {
            if (val) element[0].focus();
          });
        }
    };
})

.directive('validateAnswer', function() {
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        if (viewValue == scope.text) {
          ctrl.$setValidity('answer', true);
          return viewValue;
        } else {
          ctrl.$setValidity('answer', false);
          return viewValue;
        }
      });
    }
  };
})

.factory('animate', function($window, $rootScope) {
  var requestAnimationFrame = $window.requestAnimationFrame ||
       $window.mozRequestAnimationFrame ||
       $window.msRequestAnimationFrame ||
       $window.webkitRequestAnimationFrame;
  
   return function(tick) {
       requestAnimationFrame(function() {
           $rootScope.$apply(tick);
       });
   };
});

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
