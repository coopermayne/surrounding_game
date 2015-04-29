var app = angular.module("surroundingGame", []);

app.controller('main', 
               [ 'Game',
                 'Board',
                 '$scope',
                 '$timeout',
                 function(Game, Board, scope, timeout) {

  var dynamic_sizing = function() {
    //this function sizes everything correctly 
    var sum = $('.progress_cont').height() + $('#restart_button').height() + $('.status_bar').height();
    var win = window.innerHeight;
    $('.viewport').height(win-sum-70);
    $('.viewport').width(win-sum-70);
    $(".board_cont").css({ 
      marginLeft: determine_margin().left,
      marginTop: determine_margin().up 
    })
  }
  var determine_margin = function() {
    //returns location on 1000x1000 svg canvas
    var center = scope.game.getProblemCenter();
    var rendered_w = $('.board_cont').width()
    var rendered_h = $('.board_cont').height()
    rendered_center = {}
    rendered_center.x = center.x*(rendered_w/1000);
    rendered_center.y = center.y*(rendered_h/1000);
    var center_viewport_x = $('.viewport').width()/2;
    var center_viewport_y = $('.viewport').height()/2;
    return {left: center_viewport_x - rendered_center.x, up:center_viewport_y - rendered_center.y}
  }

  scope.game = new Game({
    element: document.getElementById("board"),
  });

  scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
  scope.current_lvl = scope.game.current_lvl;

  scope.game.setUpProblems();
  scope.game.setUpListener();

  var group = scope.game.getCurrentLevel().target_group;
  var libs = scope.game.getLiberties(group.x,group.y);

  //dynamic sizing using javascript
  dynamic_sizing();
  $(window).resize( function() {
    dynamic_sizing();
  })

  scope.$on('win', function(event, args) {
    timeout( function() {
      scope.game.nextProblem();
      scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
      scope.current_lvl = scope.game.current_lvl;

      $(".board_cont").animate({ 
        marginLeft: determine_margin().left,
        marginTop: determine_margin().up
      }, 1500)

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
