var app = angular.module("surroundingGame", []);


app.controller('main', ['Game', '$scope', '$timeout', function(Game, scope, timeout) {

  scope.game = new Game({
    element: document.getElementById("board"),
    width: 3300,
  });
  scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";


  scope.game.setUpProblems();
  scope.game.setUpListener();

  //initial centering
  var center = scope.game.getProblemCenter();
  var w = $('.port').width()
  var h = $('.port').height()
  var margin_l = (w/2)-center.x;
  var margin_t = (h/2)-center.y;
  $("#board").css({ 
    marginLeft: margin_l,
    marginTop: margin_t
  })

  scope.$on('win', function(event, args) {
    timeout( function() {
      scope.game.nextProblem();
      scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";

      var center = scope.game.getProblemCenter();
      var w = $('.port').width()
      var h = $('.port').height()
      var margin_l = (w/2)-center.x;
      var margin_t = (h/2)-center.y;
      $("#board").animate({ 
        marginLeft: margin_l,
        marginTop: margin_t
      }, 1000)
    }, 1500)
    scope.$digest();


  });

  scope.$on('ai_turn', function(event, args) {
    timeout( function() {
      scope.game.aiRespond();
    }, 600)
  })

  //helper functions
  scope.getNumber = function(num) { return new Array(num); }

}]);
