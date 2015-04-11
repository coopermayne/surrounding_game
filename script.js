var app = angular.module("surroundingGame", []);


app.controller('main', ['Game', '$scope', '$timeout', function(Game, scope, timeout) {

  scope.game = new Game({
    element: document.getElementById("board"),
    width: 3300,
  });

  scope.game.setUpProblems();
  scope.game.setUpListener();

  //for testing purposes only
  var problem_center = scope.game.getCurrentLevel().target_group.x;
  var px = scope.game.board.getX(problem_center);
  var w = $('.port').width()
  var margin = (w/2)-px;
  console.log(margin);
  $("#board").css({ 
    marginLeft: margin
  }, 500)

  scope.$on('win', function(event, args) {
    timeout( function() {
      scope.game.nextProblem();
    }, 1000)
    scope.$digest();
    var problem_center = scope.game.getCurrentLevel().target_group.x;
    var px = scope.game.board.getX(problem_center);
    var w = $('.port').width()
    var margin = (w/2)-px;
    console.log(margin);
    $("#board").animate({ 
      marginLeft: margin
    });


  });

  scope.$on('ai_turn', function(event, args) {
    timeout( function() {
      scope.game.aiRespond();
    }, 100)
  })

  //helper functions
  scope.getNumber = function(num) { return new Array(num); }

}]);
