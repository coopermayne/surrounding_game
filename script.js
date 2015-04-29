var app = angular.module("surroundingGame", []);

app.controller('main', 
               [ 'Game',
                 'Board',
                 '$scope',
                 '$timeout',
                 function(Game, Board, scope, timeout) {


  scope.game = new Game({
    element: document.getElementById("board"),
  });

  scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
  scope.current_lvl = scope.game.current_lvl;

  //fill whatever div its in
  var b = $('#board');
  b.css('width', b.height());
  $( window ).resize(function() {
    b.css('width', b.height());
  });

  var cont = $('#container');
  cont.css('width', cont.height());
  $( window ).resize(function() {
    cont.css('width', cont.height());
  });



  scope.game.setUpProblems();
  scope.game.setUpListener();

  //initial centering
  var center = scope.game.getProblemCenter();
  var center_viewport_x = $('.viewport').width()/2;
  var center_viewport_y = $('.viewport').height()/2;
  console.log(center_viewport_x,center_viewport_y);
  $(".b_cont").css({ 
  })

  /*scope.$on('win', function(event, args) {*/
    /*timeout( function() {*/
      /*scope.game.nextProblem();*/
      /*scope.varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";*/
      /*scope.current_lvl = scope.game.current_lvl;*/

      /*var center = scope.game.getProblemCenter();*/
      /*var w = $('.port').width()*/
      /*var h = $('.port').height()*/
      /*var margin_l = (w/2)-center.x;*/
      /*var margin_t = (h/2)-center.y;*/
      /*$("#board").animate({ */
        /*marginLeft: margin_l,*/
        /*marginTop: margin_t*/
      /*}, 1000)*/
    /*}, 1500)*/
    /*scope.$digest();*/
  /*});*/

  /*scope.$on('ai_turn', function(event, args) {*/
    /*timeout( function() {*/
      /*scope.game.aiRespond();*/
    /*}, 600)*/
  /*})*/

  //helper functions
  scope.getNumber = function(num) { return new Array(num); }

}]);
