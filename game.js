app.factory('Board', function() {
  var Board = function(config) {
    console.log('board initiated');

    /*store all objects on board*/
    this.objects = [];

    //store listeners for removal or reattachment
    this.l = null;
    this.listener = null;
    this._listener = null;

    /*attach to element and make sure it dynamically sizes to div*/
    this.w = 1000;
    this.h = 1000;
    this.size = config.size;  
    this.line_width=0.5;
    this.el = config.element;
    this.paper = new Raphael(config.element);
    this.paper.setViewBox(0,0,this.w,this.h,true);
    this.paper.setSize('100%', '100%');

    this.drawLines();
  }

  Board.prototype.drawLines = function() {
    var top_row = this.getY(0);
    var bottom_row = this.getY(this.size-1)
    var left_col = this.getX(0);
    var right_col = this.getX(this.size-1)

    for (var i = 0, len = this.size; i < len; i++) {
      var col_coord = this.getX(i)
      var vpath = "M "+ col_coord + " " + top_row +" l 0 " + ( bottom_row - top_row );
      var line_v = this.paper.path(vpath);
      line_v.attr({'stroke-width': this.line_width})

      var row_coord = this.getY(i)
      var tpath = "M "+ left_col + " " + row_coord +" l " + ( right_col - left_col ) + " 0";
      var line_h = this.paper.path(tpath);
      line_h.attr({'stroke-width': this.line_width})
    }
  }

  Board.prototype.addObject = function(params) {
    /*pararms = {x: xval, y: yval, type: 'white'}*/
    var color;
    if (params.type == 'black') {
      var color = 'black';
    } else if (params.type == 'white'){
      var color = 'white';
    }
    var radius = this.w/(this.size + 2);
    radius = radius/2
    var obj = this.paper.circle(this.getX(params.x), this.getY(params.y), radius).attr({'stroke-width':this.line_width,fill: color});
    this.objects.push(obj);
  }

  Board.prototype.removeAllObjects = function() {
    this.objects
    angular.forEach(this.objects, function(object, key) {
      object.remove();
    })
    this.objects = [];
  }

  Board.prototype.addEventListener = function(type, callback) {
    var _this = this;
    var evListener = {
      type: type,
      callback: callback,
      handleEvent: function(e) {
        var coo = getMousePos.call(_this, e);
        callback(coo.x, coo.y, e);
      }
    }
    this.el.addEventListener(type, evListener, true);
    this.l = evListener;
  }

  Board.prototype.removeEventListener = function() {
    console.log('remove listener');
    this.el.removeEventListener(this.l.type, this.l, true);
  }

  Board.prototype.getX = function(x) {
    var gap = this.w/(this.size+1)
    var col = gap*(x+1);
    return col
  }

  Board.prototype.getY = function(y) {
    var gap = this.h/(this.size+1)
    var row = gap*(y+1);
    return row
  }

  return Board;
});

app.factory('Game', ['$timeout', '$rootScope','Board', function(timeout, rootScope, Board) {
  var Game = function(config) {
    //instantiate a new game
    console.log('game instantiated');

    this.current_lvl = 0;

    //make a new game object
    this.game = new WGo.Game(62);

    //draw the board
    this.board = new Board({
      size: this.game.size,
      element: config.element,
    })

    this.levels = [
      //{
        //id:0,
        //type: 'static',
        //description: 'capture one stone',
        //target_group: {x:9, y:5},
        //init_moves: [
        //]
      //},
      {
        id:1,
        type: 'static',
        description: 'capture one stone',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 5, color: WGo.B},

          {x: 9, y: 4, color: WGo.W},
          {x: 9, y: 6, color: WGo.W},
          {x: 8, y: 5, color: WGo.W}
        ]
      },
      {
        id:2,
        type: 'static',
        description: 'capture two stones',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 6, color: WGo.B},
          {x: 9, y: 5, color: WGo.B},

          {x: 9, y: 4, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},
          {x: 8, y: 5, color: WGo.W},
          {x: 8, y: 6, color: WGo.W},

          {x: 10, y: 5, color: WGo.W},
        ]
      },
      {
        id:3,
        type: 'static',
        description: 'capture three stones',
        target_group: {x:9, y:6},
        init_moves: [
          {x: 10, y: 3, color: WGo.W},
          {x: 11, y: 3, color: WGo.W},
          {x: 12, y: 4, color: WGo.W},
          {x: 12, y: 5, color: WGo.W},
          {x: 12, y: 6, color: WGo.W},
          {x: 10, y: 7, color: WGo.W},
          {x: 11, y: 7, color: WGo.W},
          {x: 9, y: 8, color: WGo.W},
          {x: 9, y: 4, color: WGo.W},
          {x: 9, y: 5, color: WGo.W},
          {x: 8, y: 6, color: WGo.W},
          {x: 8, y: 7, color: WGo.W},

          {x: 10, y: 4, color: WGo.B},
          {x: 11, y: 4, color: WGo.B},
          {x: 11, y: 5, color: WGo.B},
          {x: 9, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 11, y: 6, color: WGo.B},
          {x: 9, y: 7, color: WGo.B},
        ]
      },
      {
        id:4,
        type: 'dynamic',
        target_group: {x:8, y:7},
        description: 'capture using ladder',
        init_moves: [
          //ladder breaker
          {x: 10, y:5, color: WGo.W},

          {x: 7, y: 6, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},
          {x: 8, y:8, color: WGo.W},
          {x: 8, y: 7, color: WGo.B},
        ]
      },
      {
        id:5,
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
        id:6,
        type: 'static',
        description: 'capture group with one eye',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 9, y: 4, color: WGo.W},
          {x: 8, y: 4, color: WGo.W},
          {x: 10, y: 4, color: WGo.W},
          {x: 9, y: 5, color: WGo.B},
          {x: 8, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.B},
          {x: 8, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 9, y: 7, color: WGo.B},
          {x: 8, y: 7, color: WGo.B},
          {x: 10, y: 7, color: WGo.B},
          {x: 9, y: 8, color: WGo.W},
          {x: 8, y: 8, color: WGo.W},
          {x: 10, y: 8, color: WGo.W},


          {x: 7, y: 5, color: WGo.W},
          {x: 7, y: 6, color: WGo.W},
          {x: 7, y: 7, color: WGo.W},

          {x: 11, y: 5, color: WGo.W},
          {x: 11, y: 6, color: WGo.W},
          {x: 11, y: 7, color: WGo.W},
        ]
      },
      {
        id:7,
        type: 'dynamic',
        description: 'capture group with big eye',
        target_group: {x:9, y:6},
        init_moves: [
          //black stones
          {x: 7, y: 6, color: WGo.B},
          {x: 8, y: 6, color: WGo.B},
          {x: 9, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 7, y: 4, color: WGo.B},
          {x: 8, y: 4, color: WGo.B},
          {x: 9, y: 4, color: WGo.B},
          {x: 10, y: 4, color: WGo.B},
          {x: 7, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.B},

          //white stones
          {x: 11, y: 4, color: WGo.W},
          {x: 11, y: 5, color: WGo.W},
          {x: 11, y: 6, color: WGo.W},
          {x: 6, y: 4, color: WGo.W},
          {x: 6, y: 5, color: WGo.W},
          {x: 6, y: 6, color: WGo.W},

          {x: 7, y: 7, color: WGo.W},
          {x: 8, y: 7, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},
          {x: 10, y: 7, color: WGo.W},

          {x: 7, y: 3, color: WGo.W},
          {x: 8, y: 3, color: WGo.W},
          {x: 9, y: 3, color: WGo.W},
          {x: 10, y: 3, color: WGo.W},
        ]
      },
      {
        id:8,
        type: 'dynamic',
        description: 'snapback',
        target_group: {x:9, y:5},
        init_moves: [
          {x: 8, y: 4, color: WGo.W},
          {x: 9, y: 4, color: WGo.W},
          {x: 6, y: 5, color: WGo.W},
          {x: 7, y: 5, color: WGo.W},
          {x: 9, y: 5, color: WGo.B},
          {x: 8, y: 5, color: WGo.B},
          {x: 10, y: 5, color: WGo.W},
          {x: 10, y: 6, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},

          {x: 7, y: 6, color: WGo.B},
          {x: 7, y: 7, color: WGo.B},
          {x: 8, y: 7, color: WGo.B},
          {x: 8, y: 8, color: WGo.B},
        ]
      },
      {
        id:9,
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
        id:10,
        type: 'dynamic',
        description: 'live by playing the vital point',
        target_group: {x:9, y:6},
        vital_point: {x:9, y:8},
        init_moves: [
          //top white
          {x: 7, y: 4, color: WGo.W},
          {x: 8, y: 4, color: WGo.W},
          {x: 9, y: 4, color: WGo.W},
          {x: 10, y: 4, color: WGo.W},
          {x: 6, y: 5, color: WGo.W},
          {x: 11, y: 5, color: WGo.W},
          {x: 12, y: 5, color: WGo.W},

          //top black
          {x: 6, y: 6, color: WGo.B},
          {x: 7, y: 6, color: WGo.B},
          {x: 8, y: 6, color: WGo.B},
          {x: 9, y: 6, color: WGo.B},
          {x: 10, y: 6, color: WGo.B},
          {x: 11, y: 6, color: WGo.B},
          {x: 12, y: 6, color: WGo.B},

          //b side
          {y: 7, x: 6, color: WGo.B},
          {y: 8, x: 6, color: WGo.B},
          {y: 9, x: 6, color: WGo.B},

          //b side
          {y: 7, x: 12, color: WGo.B},
          {y: 8, x: 12, color: WGo.B},
          {y: 9, x: 12, color: WGo.B},

          //w side
          {y: 6, x: 5, color: WGo.W},
          {y: 7, x: 5, color: WGo.W},
          {y: 8, x: 5, color: WGo.W},
          {y: 9, x: 5, color: WGo.W},
          {y: 10, x: 5, color: WGo.W},

          //w side
          {y: 6, x: 13, color: WGo.W},
          {y: 7, x: 13, color: WGo.W},
          {y: 8, x: 13, color: WGo.W},
          {y: 9, x: 13, color: WGo.W},
          {y: 10, x: 13, color: WGo.W},

          //bottom black
          {x: 6, y: 10, color: WGo.B},
          {x: 7, y: 10, color: WGo.B},
          {x: 8, y: 10, color: WGo.B},
          {x: 9, y: 10, color: WGo.B},
          {x: 10, y: 10, color: WGo.B},
          {x: 11, y: 10, color: WGo.B},
          {x: 12, y: 10, color: WGo.B},

          //bottom white
          {x: 6, y: 11, color: WGo.W},
          {x: 7, y: 11, color: WGo.W},
          {x: 8, y: 11, color: WGo.W},
          {x: 9, y: 11, color: WGo.W},
          {x: 10, y: 11, color: WGo.W},
          {x: 11, y: 11, color: WGo.W},
          {x: 12, y: 11, color: WGo.W},

          //inside white top
          {x: 7, y: 7, color: WGo.W},
          {x: 8, y: 7, color: WGo.W},
          {x: 9, y: 7, color: WGo.W},
          {x: 10, y: 7, color: WGo.W},
          {x: 11, y: 7, color: WGo.W},

          //inside white top
          {x: 7, y: 9, color: WGo.W},
          {x: 8, y: 9, color: WGo.W},
          {x: 9, y: 9, color: WGo.W},
          {x: 10, y: 9, color: WGo.W},
          {x: 11, y: 9, color: WGo.W},

          //inside white sides
          {x: 11, y: 8, color: WGo.W},
          {x: 7, y: 8, color: WGo.W},
]
      }
    ];

    //shift lvl over 10 places for each lvl
    this.shiftLevels();
  }

  Game.prototype.shiftLevels = function() {
    //moves the problems over
    var shift = 15
    var vertical_padding = 1;
    var h_padding = 5;
    angular.forEach(this.levels, function(value, key) {
      var row = Math.floor(key/3);
      var col = key%3;

      if (row == 1 || row == 3) {
        col = 2-col;
      }

      value.target_group.x += col * shift + h_padding
      value.target_group.y += row * shift + vertical_padding;
      if(value.vital_point) {
        value.vital_point.x += col * shift + h_padding
        value.vital_point.y += row * shift + vertical_padding;
      }

      angular.forEach(value.init_moves, function(stone, k) {
        stone.x +=  col  * shift + h_padding;
        stone.y +=  row * shift + vertical_padding;
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
    var schema = this.game.position.schema;

    for (var i = 0, len = schema.length; i < len; i++) {
      if (schema[i] == 1) {
        this.board.addObject({
          x: this.helpers.idxToCoord(i, this.board.size).x,
          y: this.helpers.idxToCoord(i, this.board.size).y,
          type: 'black'
        })
      } else if (schema[i]==-1){
        this.board.addObject({
          x: this.helpers.idxToCoord(i, this.board.size).x,
          y: this.helpers.idxToCoord(i, this.board.size).y,
          type: 'white'
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

  //TODO important - this function is not working correctly!!
  Game.prototype.getLiberties = function(x,y,color) {
    //recursive function -- find group and liberties-- 
    var self = this
    var examine_group = function(tested, liberties, x, y, color) {

      //if already tested -- end recursion
      if (tested.get(x,y) == true) {
        return tested
      }

      if (self.game.position.get(x,y) == 0) {
        //if no stone there add to group liberties and return
        tested.set(x,y,true);
        liberties.push({x: x, y: y});
        return tested
      }
      if (self.game.position.get(x,y) == -color) {
        //if opposite color just end the recurse
        return tested
      }

      //add me to group
      tested.set(x,y,true);

      //check neighbors
      //up
      tested = examine_group(tested, liberties, x, y-1, color);
      //right
      tested = examine_group(tested, liberties, x+1, y, color);
      //down
      tested = examine_group(tested, liberties, x, y+1, color);
      //left
      tested = examine_group(tested, liberties, x-1, y, color);

      return tested
    }

    var testSchema = new WGo.Position(this.game.size)
    var libs = []

    examine_group(testSchema, libs, x, y, 1);

    return libs;
  }

  Game.prototype.aiRespond = function() {
    //make a smart move and put event listener back on

    if (this.getCurrentLevel().vital_point) {
      var cl = this.getCurrentLevel();
      
      //TODO cleaner logic for lvls 8 and 9
      if (this.game.isValid(cl.vital_point.x, cl.vital_point.y, WGo.B)) {
      //if vital point hasn't been played play it...
        this.game.play(cl.vital_point.x, cl.vital_point.y, WGo.B);
      } else {
        //if it has been... and its problem 9 -- capture white group
        if (cl.id == 10) {
          if (this.game.isValid(cl.vital_point.x-1, cl.vital_point.y, WGo.B)) {
            this.game.play(cl.vital_point.x-1, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x+1, cl.vital_point.y, WGo.B)) {
            this.game.play(cl.vital_point.x+1, cl.vital_point.y, WGo.B);
            //TODO make a better solution to this problem...
          } else if (this.game.isValid(cl.vital_point.x+2, cl.vital_point.y, WGo.B)) {
            this.game.play(cl.vital_point.x+2, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x-2, cl.vital_point.y, WGo.B)) {
            this.game.play(cl.vital_point.x-2, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x, cl.vital_point.y+1, WGo.B)) {
            this.game.play(cl.vital_point.x, cl.vital_point.y+1, WGo.B);
          } 
        } else if (cl.id == 9) {
        //if it has been and its problem 8
          var l = this.getLiberties(cl.target_group.x, cl.target_group.y)
          console.log('blarg');
          if (this.game.getStone(cl.target_group.x,cl.target_group.y) == 1) {
            if (l.length<2) {
              this.game.play(l[0].x, l[0].y, WGo.B)
            }
          }
        }
      }

      this.setUpPosition();
      //reattach listener
      this.board.addEventListener('click', this.board._listener);

      //don't keep playing....
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
    var self = this;

    //attach listeners
    this.setUpProblems();
  }

  return Game;
}]);


var getMousePos= function(e) {
  var coo = {};
  var el = $(this.el)

  var off_x = e.offsetX;
  var off_y = e.offsetY;

  coo.x = Math.round( (off_x/el.width()) * ( this.size + 1 )) -1;
  coo.y = Math.round( (off_y/el.height()) * ( this.size + 1 )) -1;
  coo.e = e;

  return coo;
}
