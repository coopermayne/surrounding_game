app.factory('Game', ['$timeout', '$rootScope', function(timeout, rootScope) {
  var Game = function(config) {
    //instantiate a new game
    console.log('game instantiated');

    this.current_lvl = 0;

    //make a new game object
    this.game = new WGo.Game(80);

    //draw the board
    this.board = new WGo.Board(config.element, {
      width: config.width,
      stoneSize: 1,
      shadowSize: 0.4,
      stoneHandler: WGo.Board.drawHandlers.MONO,
      size: this.game.size,
      background: "",

    });

    //store current listener here...
    this.board.listener = null;
    //store initial problem position so they can return to it

    this.levels = [
      {
        id:0,
        type: 'static',
        description: 'capture one stone',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 5, color: WGo.B}
        ]
      },
      {
        id:1,
        type: 'static',
        description: 'capture two stones',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 6, color: WGo.B},
          {x: 9, y: 5, color: WGo.B}
        ]
      },
      {
        id:2,
        type: 'static',
        description: 'capture three stones',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 6, color: WGo.B},
          {x: 9, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.B}
        ]
      },
      {
        id:3,
        type: 'dynamic',
        target_group: {x:8, y:7},
        description: 'capture using ladder',
        init_moves: [
          {x: 7, y: 6, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 8, y:8, color: WGo.W},
          {x: 8, y: 7, color: WGo.B},
          {x: 11, y:4, color: WGo.W},
        ]
      },
      {
        id:4,
        type: 'dynamic',
        target_group: {x: 8, y:7},
        description: 'capture using net',
        init_moves: [
          {x: 7, y: 6, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 8, y:8, color: WGo.W},
          {x: 9, y:8, color: WGo.W},
          {x: 8, y: 7, color: WGo.B},
          {x: 10, y: 5, color: WGo.B},
        ]
      },
      {
        id:5,
        type: 'static',
        description: 'capture group with one eye',
        target_group: {x:9, y:6},
        init_moves: [
          {x: 9, y: 6, color: WGo.B},
          {x: 8, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 9, y: 4, color: WGo.B},
          {x: 8, y: 4, color: WGo.B},
          {x: 10, y: 4, color: WGo.B},
          {x: 8, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.B},
        ]
      },
      {
        id:6,
        type: 'static',
        description: 'capture group with big eye',
        target_group: {x:9, y:6},
        init_moves: [
          //black stones
          {x: 8, y: 6, color: WGo.B},
          {x: 9, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 11, y: 6, color: WGo.B},
          {x: 8, y: 4, color: WGo.B},
          {x: 9, y: 4, color: WGo.B},
          {x: 10, y: 4, color: WGo.B},
          {x: 11, y: 4, color: WGo.B},
          {x: 8, y: 5, color: WGo.B},
          {x: 11, y: 5, color: WGo.B},

          //white stones
          {x: 12, y: 4, color: WGo.W},
          {x: 12, y: 5, color: WGo.W},
          {x: 12, y: 6, color: WGo.W},
          {x: 7, y: 4, color: WGo.W},
          {x: 7, y: 5, color: WGo.W},
          {x: 7, y: 6, color: WGo.W},

          {x: 8, y: 7, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},
          {x: 10, y: 7, color: WGo.W},
          {x: 11, y: 7, color: WGo.W},

          {x: 8, y: 3, color: WGo.W},
          {x: 9, y: 3, color: WGo.W},
          {x: 10, y: 3, color: WGo.W},
          {x: 11, y: 3, color: WGo.W},
        ]
      },
      {
        id:7,
        type: 'dynamic',
        description: 'snapback',
        target_group: {x:9, y:7},
        init_moves: [
          //white moves
          {x: 8, y: 6, color: WGo.W},
          {x: 9, y: 6, color: WGo.W},
          {x: 6, y: 7, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 10, y: 7, color: WGo.W},
          {x: 10, y: 8, color: WGo.W},
          {x: 9, y: 9, color: WGo.W},

          //black moves 
          {x: 9, y: 7, color: WGo.B},
          {x: 8, y: 7, color: WGo.B},
          {x: 7, y: 8, color: WGo.B},
          {x: 7, y: 9, color: WGo.B},
          {x: 8, y: 9, color: WGo.B},
          {x: 8, y: 10, color: WGo.B},
        ]
      },
      {
        id:8,
        type: 'dynamic',
        description: 'kill by playing vital point',
        target_group: {x:6, y:9},
        vital_point: {x:8, y:8},
        init_moves: [
          {x: 6, y: 10, color: WGo.W},
          {x: 7, y: 10, color: WGo.W},
          {x: 8, y: 10, color: WGo.W},
          {x: 9, y: 10, color: WGo.W},

          {x: 5, y: 9, color: WGo.W},
          {x: 6, y: 9, color: WGo.B},
          {x: 7, y: 9, color: WGo.B},
          {x: 8, y: 9, color: WGo.B},
          {x: 9, y: 9, color: WGo.B},
          {x: 10, y: 9, color: WGo.W},

          {x: 5, y: 8, color: WGo.W},
          {x: 6, y: 8, color: WGo.B},
          {x: 9, y: 8, color: WGo.B},
          {x: 10, y: 8, color: WGo.W},

          {x: 5, y: 7, color: WGo.W},
          {x: 6, y: 7, color: WGo.B},
          {x: 7, y: 7, color: WGo.B},
          {x: 7, y: 7, color: WGo.B},
          {x: 9, y: 7, color: WGo.B},
          {x: 10, y: 7, color: WGo.W},

          {x: 6, y: 6, color: WGo.W},
          {x: 7, y: 6, color: WGo.B},
          {x: 8, y: 6, color: WGo.B},
          {x: 9, y: 6, color: WGo.W},

          {x: 7, y: 5, color: WGo.W},
          {x: 8, y: 5, color: WGo.W},
        ]
      },
      {
        id:9,
        type: 'dynamic',
        description: 'live by playing the vital point',
        target_group: {x:7, y:5},
        vital_point: {x:8, y:8},
        init_moves: [
          {x: 5, y: 4, color: WGo.W},
          {x: 6, y: 4, color: WGo.W},
          {x: 7, y: 4, color: WGo.W},
          {x: 8, y: 4, color: WGo.W},
          {x: 9, y: 4, color: WGo.W},
          {x: 10, y: 4, color: WGo.W},

          {x: 5, y: 5, color: WGo.W},
          {x: 6, y: 5, color: WGo.B},
          {x: 7, y: 5, color: WGo.B},
          {x: 8, y: 5, color: WGo.B},
          {x: 9, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.W},
          {x: 11, y: 5, color: WGo.W},

          {x: 4, y: 6, color: WGo.W},
          {x: 5, y: 6, color: WGo.B},
          {x: 6, y: 6, color: WGo.B},
          {x: 7, y: 6, color: WGo.W},
          {x: 8, y: 6, color: WGo.W},
          {x: 9, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 12, y: 6, color: WGo.W},

          {x: 4, y: 7, color: WGo.W},
          {x: 5, y: 7, color: WGo.B},
          {x: 6, y: 7, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},
          {x: 10, y: 7, color: WGo.B},
          {x: 12, y: 7, color: WGo.W},

          {x: 4, y: 8, color: WGo.W},
          {x: 5, y: 8, color: WGo.B},
          {x: 6, y: 8, color: WGo.W},
          {x: 9, y: 8, color: WGo.W},
          {x: 10, y: 8, color: WGo.B},
          {x: 12, y: 8, color: WGo.W},

          {x: 4, y: 9, color: WGo.W},
          {x: 5, y: 9, color: WGo.B},
          {x: 6, y: 9, color: WGo.B},
          {x: 7, y: 9, color: WGo.W},
          {x: 8, y: 9, color: WGo.W},
          {x: 9, y: 9, color: WGo.W},
          {x: 10, y: 9, color: WGo.B},
          {x: 12, y: 9, color: WGo.W},

          {x: 5, y: 10, color: WGo.W},
          {x: 6, y: 10, color: WGo.B},
          {x: 7, y: 10, color: WGo.B},
          {x: 8, y: 10, color: WGo.B},
          {x: 9, y: 10, color: WGo.B},
          {x: 10, y: 10, color: WGo.B},
          {x: 11, y: 10, color: WGo.W},

          {x: 5, y: 11, color: WGo.W},
          {x: 6, y: 11, color: WGo.W},
          {x: 7, y: 11, color: WGo.W},
          {x: 8, y: 11, color: WGo.W},
          {x: 9, y: 11, color: WGo.W},
          {x: 10, y: 11, color: WGo.W},
        ]
      }
    ];

    //shift lvl over 10 places for each lvl
    this.shiftLevels();
  }

  Game.prototype.shiftLevels = function() {
    //moves the problems over
    var shift = 7
    angular.forEach(this.levels, function(value, key) {
      var direction = ((key)%2)
      value.target_group.x += key * shift
      value.target_group.y += direction * shift
      if(value.vital_point) {
        value.vital_point.x += key * shift
        value.vital_point.y += direction * shift
      }
      angular.forEach(value.init_moves, function(stone, k) {
        stone.x += key * shift;
        stone.y += direction * shift;
      })
    })
  }

  Game.prototype.getProblemCenter = function() {
    var stones = this.getCurrentLevel().init_moves;
    //return average x,y coord for points in problem
    var res = {}
    res.x = {min: null, max: null}
    res.y = {min: null, max: null}
    angular.forEach(stones, function(stone, k) {
      res.x.max = res.x.max||stone.x
      res.x.min = res.x.min||stone.x
      if (stone.x<res.x.min) { res.x.min = stone.x }
      if (stone.x>res.x.max) { res.x.max = stone.x }
      res.y.max = res.y.max||stone.y
      res.y.min = res.y.min||stone.y
      if (stone.y<res.y.min) { res.y.min = stone.y }
      if (stone.y>res.y.max) { res.y.max = stone.y }
    });

    var rx = (res.x.min+res.x.max)/2;
    var ry = (res.y.min+res.y.max)/2;
    var px = this.board.getX(rx);
    var py = this.board.getY(ry);

    return {x:px, y:py};
  }

  Game.prototype.helpers = {
    idxToCoord: function(index, size) {
      var x = Math.floor(index/size);
      var y = index%size;
      return {
        x: x,
        y: y
      }
    }
  }


  Game.prototype.setUpPosition = function() {
    console.log('set up position');
    this.board.removeAllObjects();
    var schema = this.game.position.schema

    for (var i = 0, len = schema.length; i < len; i++) {
      if (schema[i] == 1) {
        this.board.addObject({
          x: this.helpers.idxToCoord(i, this.board.size).x,
          y: this.helpers.idxToCoord(i, this.board.size).y,
          c: WGo.B
        })
      } else if (schema[i]==-1){
        this.board.addObject({
          x: this.helpers.idxToCoord(i, this.board.size).x,
          y: this.helpers.idxToCoord(i, this.board.size).y,
          c: WGo.W
        })
      } else {

      }
    }
  }

  Game.prototype.getCurrentLevel = function() {
    //returns the level object with all info for current lvl
    return this.levels[this.current_lvl]
  }

  Game.prototype.clearListener = function() {
    //clear off listener save it in board._listener
    this.board._listener = this.board.listener;
    this.board.removeEventListener("click", this.board.listener);
  }

  Game.prototype.setUpListener = function() {
    var self = this

    this.board.listener = function(x,y) {
      //for one player problems
      self.clickListener(x,y);
    }

    this.board.addEventListener('click', this.board.listener);
  }

  Game.prototype.clickListener= function(x,y,z) {
    var board = this.board;
    var game = this.game;

    //handle invalid moves
    if (!game.isValid(x,y, WGo.W)) {
      console.log('invalid');
      return false
    }

    //remove any captured stones from the board
    var captures = game.play(x,y, WGo.W);
    this.setUpPosition()

    //check if you won
    var target_group = this.getCurrentLevel().target_group;

    //if player captured the target group they win lvl
    if (game.getStone(target_group.x, target_group.y) == 0) {
      board.removeEventListener("click", board.listener);
      //go to next lvl
      this.current_lvl += 1;

      //inform the scope
      console.log('BROADCAST: game won');
      rootScope.$broadcast('win');
      return;
    }

    if (this.getCurrentLevel().type == 'dynamic') {
      //if its a problem that needs and answer...
      //prevent further moves and tell scope whats happening 

      //store for reattachment
      board._listener = board.listener;
      board.removeEventListener("click", board.listener);

      console.log('BROADCAST: AI turn');
      rootScope.$broadcast('ai_turn');
      return;
    }
  }

  Game.prototype.getLiberties = function(x,y,color) {
    //recursive function -- find group and liberties-- 
    var self = this
    var examine_group = function(tested, liberties, x, y, color) {
      if (self.game.position.get(x,y) == 0) {
        //if no stone there add to group liberties and return
        liberties.push({x: x, y: y});
        return
      }
      if (self.game.position.get(x,y) == -color) {
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

    var testSchema = new WGo.Position(this.game.size)
    var libs = []

    examine_group(testSchema,
                  libs,
                  x,
                  y,
                  1);
    return libs;
  }

  Game.prototype.aiRespond = function() {
    //make a smart move and put event listener back on

    if (this.getCurrentLevel().vital_point) {
      var cl = this.getCurrentLevel();
      
      if (this.game.isValid(cl.vital_point.x, cl.vital_point.y, WGo.B)) {
      //if vital point hasn't been played play it...
        console.log('playing vital point');
        this.game.play(cl.vital_point.x, cl.vital_point.y, WGo.B);
      } else {
        //if it has been... and its problem 9 -- capture white group
        if (cl.id == 9) {
          console.log('keep capturing');
          if (this.game.isValid(cl.vital_point.x, cl.vital_point.y-1, WGo.B)) {
            this.game.play(cl.vital_point.x, cl.vital_point.y-1, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x-1, cl.vital_point.y, WGo.B)) {
            this.game.play(cl.vital_point.x-1, cl.vital_point.y, WGo.B);
          }

        }
      }

      this.setUpPosition();
      //reattach listener
      this.board.addEventListener('click', this.board._listener);

      return;
    }

    var self = this
    var group = this.getCurrentLevel().target_group;

    var libs = this.getLiberties(group.x,group.y)
    //find the best liberty to play on...
    var potential_moves = [];
    angular.forEach(libs, function(lib) {
      //play here and examine group... record how many libs you have...
      self.game.play(lib.x, lib.y, WGo.B);
      var libs_n = self.getLiberties(group.x, group.y);
      potential_moves.push({move: lib, libs: libs_n.length});

      //then remove the stone
      self.game.removeStone(lib.x, lib.y);
    });
    potential_moves = _.sortBy(potential_moves, 'libs');
    potential_moves.reverse();
    //don't play self atari
    if (potential_moves[0].libs<1) {
      console.log('self atari');
    }

    //play for maximum liberty extension
    var lx = potential_moves[0].move.x
    var ly = potential_moves[0].move.y
    this.game.play(lx, ly, WGo.B)
    this.setUpPosition();

    //reattach listener
    this.board.addEventListener('click', this.board._listener);
  }

  Game.prototype.nextProblem = function() {
    //set up listeners for next problem
    this.setUpListener();
  }

  Game.prototype.setUpProblems = function() {
    //add all problems to board
    console.log('setting up problems');
    var game = this.game;
    var board = this.board;

    //reset game and listeners
    game.firstPosition();
    //this.clearListener();

    //get array of initial moves for problem
    var init_moves = this.getCurrentLevel().init_moves;
    angular.forEach(this.levels, function(value, key) {
      angular.forEach(value.init_moves, function(stone, k) {
        //sync game position with pattern for problem
        game.play(stone.x,stone.y,stone.color)
      })
    })

    //populate board with pattern for problem
    this.setUpPosition();
  }

  Game.prototype.restart = function() {
    console.log('restart');
    var self = this;

    //attach listeners
    this.setUpProblems();
  }

  return Game;
}]);
