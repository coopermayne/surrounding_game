var app = angular.module("surroundingGame", []);


app.controller('main', ['Game', '$scope', '$timeout', function(Game, scope, timeout) {

  scope.game = new Game({
    element: document.getElementById("board"),
  });

  scope.game.setUpProblem();

  scope.$on('win', function(event, args) {
    timeout( function() {
      scope.game.setUpProblem();
    }, 1000)
    scope.$digest();
  });

  scope.$on('ai_turn', function(event, args) {
    timeout( function() {
      scope.game.aiRespond();
    }, 1000)
  })

  //helper functions
  scope.getNumber = function(num) { return new Array(num); }

}]);

