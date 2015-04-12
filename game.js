app.factory('Game', ['$timeout', '$rootScope', function(timeout, rootScope) {
  var Game = function(config) {
    //instantiate a new game
    console.log('game instantiated');

    this.current_lvl = 0;
    this.move_storage = [];

    //make a new game object
    this.game = new WGo.Game(70);

    //draw the board
    this.board = new WGo.Board(config.element, {
      width: config.width,
      stoneHandler: WGo.Board.drawHandlers.MONO,
      size: this.game.size,
      section: {
        top: 1,
        left: 1,
        right: 1,
        bottom: 1
      },
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
    ];

    //shift lvl over 10 places for each lvl
    this.shiftLevels();
  }

  Game.prototype.shiftLevels = function() {
    //moves the problems over
    var shift = 7
    angular.forEach(this.levels, function(value, key) {
      value.target_group.x += key * shift
      value.target_group.y += key * shift
      angular.forEach(value.init_moves, function(stone, k) {
        stone.x += shift*key;
        stone.y += shift*key;
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
    if (!game.isValid(x,y, WGo.W)) {return false}

    //remove any captured stones from the board
    var captures = game.play(x,y, WGo.W);
    angular.forEach(captures, function(value) {
      board.removeObject(value);
    });

    //add the valid move
    board.addObject({
      x: x,
      y: y,
      c: WGo.W
    });

    //add move to temp storage
    this.move_storage.push({x: x,y: y});

    //check if you won
    var target_group = this.getCurrentLevel().target_group;

    if (game.getStone(target_group.x, target_group.y) == 0) {
      //no more playing!
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

  Game.prototype.aiRespond = function() {
    //make a smart move and put event listener back on

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

    var t = this.getCurrentLevel().target_group;

    var black_group = {x:t.x, y:t.y, color: 1}
    examine_group(testSchema, libs, black_group.x, black_group.y, black_group.color)

    //TODO don't play self atari

    //play for maximum liberty extension
    var lx = libs[0].x
    var ly = libs[0].y
    this.game.play(lx, ly, WGo.B)
    this.board.addObject({
      x: lx,
      y: ly,
      c: WGo.B
    });
    this.move_storage.push({x: lx,y: ly})

    //reattach listener
    this.board.addEventListener('click', this.board._listener);
  }

  Game.prototype.nextProblem = function() {
    //set up listeners for next problem
    this.move_storage = []
    this.setUpListener();
  }

  Game.prototype.setUpProblems = function() {
    //add all problems to board
    console.log('setting up problems');
    var game = this.game;
    var board = this.board;

    //reset game and listeners
    game.firstPosition();
    this.clearListener();

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

    angular.forEach(this.move_storage, function(value, k) {
      self.game.removeStone(value.x, value.y)
    })

    this.move_storage = [];
    this.setUpPosition();

    //timeout( function() {
      //self.setUpProblem();
    //},500)
  }

  return Game;
}]);
