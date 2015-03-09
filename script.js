Cooper = {}
Cooper.helpers = {
  idxToCoord: function(index, size) {
    var x = Math.floor(index/size);
    var y = index%size;
    return {
      x: x,
      y: y
    }
  }
}

var app = angular.module("surroundingGame", []);

app.controller('main', ['$scope', '$timeout', function(scope, timeout) {

  var idxToCoord = Cooper.helpers.idxToCoord;

  var play_to_maximize_liberties = function(board, game, black_group) {
    //find your group -- recursive function
    var brothers = []
    var find_brothers = function(brothers, x, y, color) {
      //ask you neighbors if they're your brother --
      //up
      if (game.position.get(x, y-1) == color) {
        
      }
      find_brothers(brothers, x, y-1)
      //right
      find_brothers(brothers, x+1, y)
      //down
      find_brothers(brothers, x, y+1)
      //left
      find_brothers(brothers, x-1, y)

      
    }
    find_brothers(brothers, black_group.x, black_group.y, black_group.color)

    //look at possible extensions of my group
    //take the one which gives most liberties
  }

  var setUpPosition = function(board, schema) {
    board.removeAllObjects();
    for (var i = 0, len = schema.length; i < len; i++) {
      if (schema[i] == 1) {
        board.addObject({
          x: idxToCoord(i, board.size).x,
          y: idxToCoord(i, board.size).y,
          c: WGo.B
        })
      } else if (schema[i]==-1){
        board.addObject({
          x: idxToCoord(i, board.size).x,
          y: idxToCoord(i, board.size).y,
          c: WGo.W
        })
      } else {

      }
    }
  }
  var setUpProblem = function(board, scope) {
    //set up the problem
    var game = scope.game;
    var current_lvl = scope.current_lvl;
    var listener;

    var levelSetUp = [
      //0
      [{x: 3, y: 3, color: WGo.B}],
      //1
      [
        {x: 3, y: 3, color: WGo.B},
        {x: 3, y: 2, color: WGo.B}
      ],
      //2
      [
        {x: 3, y: 3, color: WGo.B},
        {x: 3, y: 2, color: WGo.B},
        {x: 4, y:2, color: WGo.B}
      ],
      //3
      [
        {x: 3, y: 3, color: WGo.B},
        {x: 3, y: 2, color: WGo.B},
      ],
      //4
      [
        {x: 1, y: 3, color: WGo.W},
        {x: 1, y: 4, color: WGo.W},
        {x: 2, y:5, color: WGo.W},
        {x: 2, y: 4, color: WGo.B},
      ],
    ];
    var win_crit = [1,2,3,2]

    game.firstPosition()
    angular.forEach(levelSetUp[current_lvl], function(stone) {
      //sync game position with pattern for problem
      game.play(stone.x,stone.y,stone.color)
    })
    //populate board with pattern for problem
    setUpPosition(board, game.position.schema)

//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------

    var listener_for_static_problem = function(x, y) {
      //handle invalid moves
      if (!scope.game.isValid(x,y, WGo.W)) {return false}

      //remove any captured stones from the board
      var captures = scope.game.play(x,y, WGo.W);
      angular.forEach(captures, function(value) {
        board.removeObject(value);
      });

      //add the valid move
      board.addObject({
        x: x,
        y: y,
        c: WGo.W
      });

      //check if you won
      if (game.getCaptureCount(WGo.W) == win_crit[current_lvl]) {
        board.removeEventListener("click", listener);
        scope.$apply( function() { scope.current_lvl +=1 })
        //run the problem function again with new problem index
        setUpProblem(board, scope)
      }
    }
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------

    var listener_for_dynamic_problem = function(x, y) {
      //handle invalid moves
      if (!scope.game.isValid(x,y, WGo.W)) {return false}

      //remove any captured stones from the board
      var captures = scope.game.play(x,y, WGo.W);
      angular.forEach(captures, function(value) {
        board.removeObject(value);
      });

      //add the valid move
      board.addObject({
        x: x,
        y: y,
        c: WGo.W
      });

      //check if white captured black
      if (game.getCaptureCount(WGo.W) > 0) {
        board.removeEventListener("click", listener);
        scope.$apply( function() { scope.current_lvl +=1 })
        //run the problem function again with new problem index
        setUpProblem(board, scope)
      }

      //if not -- handle black response
      var black_group = {x:2, y:4, color: WGo.B}
      play_to_maximize_liberties(board, game, black_group)
    }
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------

    if (current_lvl < 4) {
      listener = listener_for_static_problem;
    } else {
      listener = listener_for_dynamic_problem;
    }

    //add event listeners and gameplay logic
    board.addEventListener("click", listener);
  }

  //START
  scope.game = new WGo.Game(7);

  var board = new WGo.Board(document.getElementById("board"), {
    width: 600,
    stoneHandler: WGo.Board.drawHandlers.MONO,
    size: scope.game.size,
    background: "",
  });

  //first problem
  scope.current_lvl = 4;

  setUpProblem(board, scope)
  
}]);
