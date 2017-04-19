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
    var height = win-sum-70;
    height = Math.max(height, 400)
    height = Math.min(height, 900)
    $('.viewport').height(height);
    $('.viewport').width(height);
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
  $('#portal').hide();

  //dynamic sizing using javascript
  dynamic_sizing();
  $(window).resize( function() {
    dynamic_sizing();
  })

  //reveal
  $('#cover').fadeOut(100)

  scope.$on('win', function(event, args) {
    var time = 3000;
    console.log(scope.game.current_lvl);

    //play win sound on first
    if (scope.game.current_lvl < 8) {
      time = 3000;
      timeout( function() {
        var sound = new Howl({
          urls: ['sounds/gong.wav'],
          volume: 0.4
        }).play();
      }, 200 )
    } else if (scope.game.current_lvl == 8) {
      //last level -- portal time

      timeout( function() {
        var sound = new Howl({
          urls: ['sounds/gong.wav'],
          volume: 0.4
        }).play();
      }, 3000 )

      //fade it in
      timeout( function() {
        $("#portal").show();
        var sound = new Howl({
          urls: ['sounds/portal.wav'],
          volume: 0.1
        }).play();
        
        $('#board').fadeOut(2000)

        $("#portal").animate({
          opacity: 1
        }, 5000, function() {
          location.href = 'http://www.surroundinggamemovie.com/';
        })

        //$("video").delay(2000).fadeIn(2000, function() {
          //$('#portal video').get(0).play()
        //})
      }, 3000 )
    }

    timeout( function() {

      scope.game.setUpListener();
      var varvar = scope.game.current_lvl/scope.game.levels.length*100 + "%";
      $(".progress").animate({
        width: varvar
      }, 200)
      scope.current_lvl = scope.game.current_lvl;

      $(".board_cont").animate({ 
        marginLeft: determine_margin().left,
        marginTop: determine_margin().up
      }, 1500)

    }, time)
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
