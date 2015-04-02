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
  scope.lvls = 10;
  scope.getNumber = function(num) {
    return new Array(num);
  }

  scope.restart_lvl = function() {
    //clear board and start over
    setUpProblem(board, scope)
  }

  var play_to_maximize_liberties = function(board, game, black_group) {

    //find your group and group liberties-- recursive function
    var examine_group = function(tested, liberties, x, y, color) {
      if (game.position.get(x,y) == 0) {
        //if no stone there add to group liberties and return
        liberties.push({x: x, y: y});
        return
      }
      if (game.position.get(x,y) == -color) {
        //if opposite color just end the recurse
        return
      }
      //if already tested -- end recursion
      if (tested.get(x,y) !== 0) {
        return
      }

      //add me to group
      tested.set(x,y,true);

      //check neighbors
      //up
      examine_group(tested, liberties, x, y-1, color)
      //right
      examine_group(tested, liberties, x+1, y, color)
      //down
      examine_group(tested, liberties, x, y+1, color)
      //left
      examine_group(tested, liberties, x-1, y, color)
    }

    var testSchema = new WGo.Position(game.size)
    var libs = []
    examine_group(testSchema, libs, black_group.x, black_group.y, black_group.color)

    //play for maximum liberty extension
    var lx = libs[0].x
    var ly = libs[0].y
    game.play(lx, ly, WGo.B)
    board.addObject({
      x: lx,
      y: ly,
      c: WGo.B
    });
    //TODO play the move that gives most liberties
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
    scope.computer_turn = false;

    var levelSetUp = [
      //0 capture 1
      [{x: 9, y: 9, color: WGo.B}],
      //1 capture 2
      [
        {x: 9, y: 10, color: WGo.B},
        {x: 9, y: 9, color: WGo.B}
      ],
      //2 capture 3
      [
        {x: 9, y: 10, color: WGo.B},
        {x: 9, y: 9, color: WGo.B},
        {x: 10, y: 9, color: WGo.B}
      ],
      //3 ladder
      [
        {x: 7, y: 10, color: WGo.W},
        {x: 7, y: 11, color: WGo.W},
        {x: 8, y:12, color: WGo.W},
        {x: 8, y: 11, color: WGo.B},
        {x: 12, y:7, color: WGo.W},
      ],
      //4 net
      [
        {x: 7, y: 10, color: WGo.W},
        {x: 7, y: 11, color: WGo.W},
        {x: 8, y:12, color: WGo.W},
        {x: 9, y:12, color: WGo.W},
        {x: 8, y: 11, color: WGo.B},
        {x: 12, y: 7, color: WGo.B},
      ],
      //5 capture black with eye
      [
        {x: 9, y: 10, color: WGo.B},
        {x: 8, y: 10, color: WGo.B},
        {x: 10, y: 10, color: WGo.B},
        {x: 9, y: 8, color: WGo.B},
        {x: 8, y: 8, color: WGo.B},
        {x: 10, y: 8, color: WGo.B},
        {x: 8, y: 9, color: WGo.B},
        {x: 10, y: 9, color: WGo.B},
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

      //console.log('caps: ' + game.getCaptureCount(WGo.W));
      //console.log('wincrit:' + win_crit[current_lvl]);
      //console.log('currentlvl:' + current_lvl);

      //check if you won
      if (game.getCaptureCount(WGo.W) == win_crit[current_lvl]) {
        console.log('win');
        //no more playing!
        board.removeEventListener("click", listener);
        //run the problem function again with new problem index
        timeout( function() {
          scope.$apply( function() { scope.current_lvl +=1 })
          setUpProblem(board, scope)
        }, 1000)
      }
    }
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------

    var listener_for_dynamic_problem = function(x, y) {
      //do nothing if black hasn't responded...
      if (scope.computer_turn) { return false };

      //handle invalid moves
      if (!scope.game.isValid(x,y, WGo.W)) {return false}

      //play and remove any captured stones from the board
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
      
      //tell scope it is blacks turn
      scope.$apply( function() { scope.computer_turn = true })

      //check if white captured black
      if (game.getCaptureCount(WGo.W) > 0) {
        //if capture play wins -- set to next lvl
        board.removeEventListener("click", listener);

        //pause before setting up new problem
        //run the problem function again with new problem index
        timeout( function() {
          scope.$apply( function() { scope.current_lvl +=1 })
          setUpProblem(board, scope)
        }, 1000)
      } else {
        //if no capture -- black plays back
        //TODO - make this dynamic -- this is ugly! 
        var black_group = {x:8, y:11, color: 1}
        //wait to "think"
        timeout( function() {
          //play move
          play_to_maximize_liberties(board, game, black_group)

          //tell scope you have played
          scope.$apply( function() { scope.computer_turn = false })
        }, 400)
      }

      //if not -- handle black response
    }
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------

    if (current_lvl < 3) {
      listener = listener_for_static_problem;
    } else if (current_lvl>4) {  
      listener = listener_for_static_problem;
    } else {
      listener = listener_for_dynamic_problem;
    }

    //add event listeners and gameplay logic
    board.addEventListener("click", listener);
  }

  //START
  scope.game = new WGo.Game(19);

  var board = new WGo.Board(document.getElementById("board"), {
    width: 600,
    stoneHandler: WGo.Board.drawHandlers.MONO,
    size: scope.game.size,
    background: "",
    section: {
      top: 4, right: 4, bottom: 4, left: 4
    },
  });

  //first problem
  scope.current_lvl = 0;
  setUpProblem(board, scope)
  
}]);
