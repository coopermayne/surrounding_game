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

    //returns location on 1000x1000 svg canvas
    var center = scope.game.getProblemCenter();
    var rendered_w = $('.board_cont').width()
    var rendered_h = $('.board_cont').height()
    rendered_center = {}
    rendered_center.x = center.x*(rendered_w/1000);
    rendered_center.y = center.y*(rendered_h/1000);
    console.log(center);
    console.log(rendered_center);
    var center_viewport_x = $('.viewport').width()/2;
    var center_viewport_y = $('.viewport').height()/2;
    $(".board_cont").css({ 
      marginLeft: center_viewport_x - rendered_center.x,
      marginTop: center_viewport_y - rendered_center.y
    })
  }

  scope.game = new Game({
    element: document.getElementById("board"),
  });

  scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
  scope.current_lvl = scope.game.current_lvl;


  dynamic_sizing();
  $(window).resize( function() {
    dynamic_sizing();
  } )

  scope.game.setUpProblems();
  scope.game.setUpListener();
  dynamic_sizing();

  scope.$on('win', function(event, args) {
    timeout( function() {
      scope.game.nextProblem();
      scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
      scope.current_lvl = scope.game.current_lvl;

      dynamic_sizing();
      //var center = scope.game.getProblemCenter();
      //var w = $('.port').width()
      //var h = $('.port').height()
      //var margin_l = (w/2)-center.x;
      //var margin_t = (h/2)-center.y;
      //$("#board").animate({ 
        //marginLeft: margin_l,
        //marginTop: margin_t
      //}, 1000)
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
