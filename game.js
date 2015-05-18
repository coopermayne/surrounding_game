app.factory('Board', ['$timeout', function(timeout) {
  var Board = function(config) {
    /*store all objects on board*/
    this.objects = new WGo.Position(config.size)

    //store listeners for removal or reattachment
    this.l = null;
    this.listener = null;
    this._listener = null;

    //rendering settings
    this.w = 1000;
    this.h = 1000;
    this.size = config.size;  
    this.el = config.element;
    this.line_width=0.5;

    this.drawBoard();
  }

  Board.prototype.drawBoard = function() {
    this.paper = new Raphael(this.el);
    this.paper.setViewBox(0,0,this.w,this.h,true);
    this.paper.setSize('100%', '100%');
    this.drawLines();
  }

  Board.prototype.drawLines = function() {
    var top_row = this.getY(0);
    var bottom_row = this.getY(this.size-1)
    var left_col = this.getX(0);
    var right_col = this.getX(this.size-1)

    _(this.size).times( function(i) {
      var col_coord = this.getX(i)
      var vpath = "M "+ col_coord + " " + top_row +" l 0 " + ( bottom_row - top_row );
      var line_v = this.paper.path(vpath);
      line_v.attr({'stroke-width': this.line_width})

      var row_coord = this.getY(i)
      var tpath = "M "+ left_col + " " + row_coord +" l " + ( right_col - left_col ) + " 0";
      var line_h = this.paper.path(tpath);
      line_h.attr({'stroke-width': this.line_width})
    },this);
  }

  Board.prototype.addObject = function(x,y,c) {
    var color;
    if ( c==0 ) return;

    if (c==WGo.B) {
      color = 'black';
    } else if (c==WGo.W){
      color = 'white';
    }
    var radius = this.w/(this.size + 2);
    radius = radius/2
    var obj = this.paper.circle(this.getX(x), this.getY(y), radius).attr({'stroke-width':this.line_width,fill: color});


    //store it
    this.objects.set(x, y, obj);
  }

  Board.prototype.removeAllObjects = function() {
    _.each(this.objects.schema, function(object, key) {
      if(object) object.remove();
    })
    this.objects.clear();
  }

  Board.prototype.removeObject = function(params) {
    /*pararms = {x: xval, y: yval}*/
    //fade out captures
    var _this = this

    timeout( function() {
      var obj = _this.objects.get(params.x,params.y)
      var color = obj.attr('fill');
      if (color == 'white') {
        //var sound = new Howl({
          //urls: ['sounds/capture.wav'],
          //volume: 0.7
        //}).play();
      } else if (color =='black') {
        //var sound = new Howl({
          //urls: ['sounds/level_up.wav'],
          //volume: 0.06
        //}).play();
      }
      obj.animate({ opacity : 0 }, 750, function () { this.remove() });
      _this.objects.set(params.x,params.y,0);
    }, 500)
  }

  Board.prototype.addEventListener = function(type, callback) {
    var _this = this;
    var evListener = {
      type: type,
      callback: callback,
      handleEvent: function(e) {
        var coo = _this.findCoordinate.call(_this, e);
        //run the call back with coordinates as parameters
        callback(coo.x, coo.y, e);
      }
    }
    this.el.addEventListener(type, evListener, true);
    this.l = evListener;
  }

  Board.prototype.removeEventListener = function() {
    //remove current listener
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

  Board.prototype.findCoordinate= function(e) {
    var coo = {};
    var el = $(this.el)

    var off_x = e.offsetX;
    var off_y = e.offsetY;

    coo.x = Math.round( (off_x/el.width()) * ( this.size + 1 )) -1;
    coo.y = Math.round( (off_y/el.height()) * ( this.size + 1 )) -1;
    coo.e = e;

    return coo;
  }

  return Board;
}]);

app.factory('Levels', function() {
  return [
    {
    id:0,
    type: 'play',
    description: 'capture one stone',
    center_coord: {x:9, y:5},
    init_moves: [
    ]
  },
  {
    id:1,
    type: 'static',
    description: 'capture one stone',
    center_coord: {x:9, y:5},
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
    center_coord: {x:9, y:5},
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
    center_coord: {x:10, y:6},
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
    center_coord: {x:9, y:6},
    target_group: {x:8, y:7},
    description: 'capture using ladder',
    init_moves: [
      //ladder breaker
      {x: 11, y:5, color: WGo.W},

      {x: 7, y: 6, color: WGo.W},
      {x: 7, y: 7, color: WGo.W},
      {x: 8, y:8, color: WGo.W},
      {x: 8, y: 7, color: WGo.B},
    ]
  },
  {
    id:5,
    type: 'dynamic',
    center_coord: {x:9, y:6},
    target_group: {x: 8, y:7},
    description: 'capture using net',
    init_moves: [
      {x: 7, y: 6, color: WGo.W},
      {x: 7, y: 7, color: WGo.W},
      {x: 8, y:8, color: WGo.W},
      {x: 9, y:8, color: WGo.W},
      {x: 8, y: 7, color: WGo.B},
      {x: 11, y: 4, color: WGo.B},
    ]
  },
  //{
    //id:6,
    //type: 'static',
    //description: 'capture group with one eye',
    //center_coord: {x:9, y:5},
    //target_group: {x:9, y:5},
    //init_moves: [
      //{x: 9, y: 4, color: WGo.W},
      //{x: 8, y: 4, color: WGo.W},
      //{x: 10, y: 4, color: WGo.W},
      //{x: 9, y: 5, color: WGo.B},
      //{x: 8, y: 5, color: WGo.B},
      //{x: 10, y: 5, color: WGo.B},
      //{x: 8, y: 6, color: WGo.B},
      //{x: 10, y: 6, color: WGo.B},
      //{x: 9, y: 7, color: WGo.B},
      //{x: 8, y: 7, color: WGo.B},
      //{x: 10, y: 7, color: WGo.B},
      //{x: 9, y: 8, color: WGo.W},
      //{x: 8, y: 8, color: WGo.W},
      //{x: 10, y: 8, color: WGo.W},


      //{x: 7, y: 5, color: WGo.W},
      //{x: 7, y: 6, color: WGo.W},
      //{x: 7, y: 7, color: WGo.W},

      //{x: 11, y: 5, color: WGo.W},
      //{x: 11, y: 6, color: WGo.W},
      //{x: 11, y: 7, color: WGo.W},
    //]
  //},
  {
    id:7,
    type: 'dynamic',
    description: 'capture group with big eye',
    center_coord: {x:8, y:6},
    target_group: {x:9, y:7},
    init_moves: [
      //black stones
      {x: 7, y: 7, color: WGo.B},
      {x: 8, y: 7, color: WGo.B},
      {x: 9, y: 7, color: WGo.B},
      {x: 10, y: 7, color: WGo.B},
      {x: 7, y: 5, color: WGo.B},
      {x: 8, y: 5, color: WGo.B},
      {x: 9, y: 5, color: WGo.B},
      {x: 10, y: 5, color: WGo.B},
      {x: 7, y: 6, color: WGo.B},
      {x: 10, y: 6, color: WGo.B},

      //white stones
      {x: 11, y: 5, color: WGo.W},
      {x: 11, y: 6, color: WGo.W},
      {x: 11, y: 7, color: WGo.W},
      {x: 6, y: 5, color: WGo.W},
      {x: 6, y: 6, color: WGo.W},
      {x: 6, y: 7, color: WGo.W},

      {x: 7, y: 8, color: WGo.W},
      {x: 8, y: 8, color: WGo.W},
      {x: 9, y: 8, color: WGo.W},
      {x: 10, y: 8, color: WGo.W},

      {x: 7, y: 4, color: WGo.W},
      {x: 8, y: 4, color: WGo.W},
      {x: 9, y: 4, color: WGo.W},
      {x: 10, y: 4, color: WGo.W},
    ]
  },
  {
    id:8,
    type: 'dynamic',
    description: 'snapback',
    center_coord: {x:8, y:6},
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

      //tail
      {x: 8, y: 9, color: WGo.B},
      {x: 8, y: 10, color: WGo.B},
      {x: 8, y: 11, color: WGo.B},
      {x: 8, y: 12, color: WGo.B},
    ]
  },
  {
    id:9,
    type: 'dynamic',
    description: 'kill by playing vital point',
    center_coord: {x:7, y:7},
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
    center_coord: {x:9, y:7},
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
  ]
})

app.factory('Game', ['$timeout', '$rootScope','Board', 'Levels', function(timeout, rootScope, Board, Levels) {
  var Game = function(config) {
    //instantiate a new game

    //current level
    this.current_lvl = 9;

    //make a new game object
    this.game = new WGo.Game(62);

    //draw the board
    this.board = new Board({
      size: this.game.size,
      element: config.element,
    })

    //get levels and shift them around
    this.levels = Levels;
    this.shiftLevels();
  }

  Game.prototype.shiftLevels = function() {
    //moves the problems over
    var shift = 15
    var vertical_padding = 1;
    var h_padding = 5;
    _.each(this.levels, function(value, key) {
      var row = Math.floor(key/3);
      var col = key%3;

      //make an s pattern in the layout
      if (row == 1 || row == 3) {
        col = 2-col;
      }

      var shift_point = function(point) {
        point.x += col * shift + h_padding
        point.y += row * shift + vertical_padding;
      }

      shift_point(value.center_coord);
      if(value.target_group) shift_point(value.target_group); 
      if(value.vital_point) shift_point(value.vital_point);

      _.each(value.init_moves, function(stone, k) {
        shift_point(stone);
      })
    })
  }

  Game.prototype.getProblemCenter = function() {
    var stones = this.currentLvl().init_moves;
    //return average x,y coord for points in problem
    var coords = {};
    coords.x = [];
    coords.y = [];
    _.each(stones, function(stone, k) {
      coords.x.push(stone.x);
      coords.y.push(stone.y);
    });

    var rx = ( _.min(coords.x) + _.max(coords.x) )/2;
    var ry = ( _.min(coords.y) + _.max(coords.y) )/2;

    //exception for problem 0
    if (this.currentLvl().id==0 || this.currentLvl().id==8) {
      var cc = this.currentLvl().center_coord
      var rx = cc.x;
      var ry = cc.y
    }

    var px = this.board.getX(rx);
    var py = this.board.getY(ry);

    return {x:px, y:py};
  }

  Game.prototype.idxToCoord = function(index, size) {
    var x = Math.floor(index/size);
    var y = index%size;
    return {
      x: x,
      y: y
    }
  }

  Game.prototype.setUpPosition = function() {
    this.board.removeAllObjects();
    var schema = this.game.position.schema;

    _.each(schema, function(color, i) {
      var coord = this.idxToCoord(i, this.board.size);

      this.board.addObject(coord.x, coord.y, color)

    }, this)
  }

  Game.prototype.currentLvl = function() {
    //returns the level object with all info for current lvl
    return this.levels[this.current_lvl]
  }

  Game.prototype.clearListener = function() {
    //clear off listener save it in board._listener
    this.board._listener = this.board.listener;
    this.board.removeEventListener("click", this.board.listener);
  }

  Game.prototype.setUpListener = function() {
    var self = this;

    this.board.listener = function(x,y) {
      self.clickListener(x,y);
    }

    this.board.addEventListener('click', this.board.listener);
  }

  Game.prototype.play = function(x,y,c) {
    //handle invalid moves
    if (!this.game.isValid(x,y,c)) {
      return false
    }

    var caps = this.game.play(x,y,c)
    this.board.addObject(x,y,c);

    //remove captures
    var _this = this
    _.each(caps, function(cap,index) {
      //var color = _this.game.getStone(cap.x,cap.y)
      //if (color == -1) {
        //var sound = new Howl({
          //urls: ['sounds/capture.wav'],
          //volume: 0.1
        //}).play();
      //}
      _this.board.removeObject(cap)
    })


    //play sound
    //var sound = new Howl({
      //urls: ['sounds/play.wav'],
      //volume: 0.1
    //}).play();

    return true
  }

  Game.prototype.beat_lvl = function() {
    //lvl 0 
    if (this.currentLvl().id==0) return true;

    //lvl 1-10
    var target_group = this.currentLvl().target_group;
    //check if player captured the target group
    return (this.game.getStone(target_group.x, target_group.y) == 0) 
  }

  Game.prototype.clickListener= function(x,y,z) {

    var _this = this

    //as soon as they click disable event listeners
    this.board._listener = this.board.listener;
    this.board.removeEventListener("click", this.board.listener);

    //play the stone
    timeout( function() {

      //reattach listener
      //_this.board.addEventListener('click', _this.board._listener);

      //play and update board
      var res = _this.play(x,y,WGo.W);

      //if its an invalid move just skip the rest of this script
      if (!res) return;

      //check if the move won
      if (_this.beat_lvl()) {

        _this.current_lvl += 1;
        _this.board.removeEventListener("click", _this.board.listener);

        //tell scope player won
        rootScope.$broadcast('win');

      } else if (_this.currentLvl().type == 'dynamic') {
        //if its a problem that needs and answer...
        //prevent further moves and tell scope whats happening 

        //store for reattachment
        _this.board._listener = _this.board.listener;
        _this.board.removeEventListener("click", _this.board.listener);

        rootScope.$broadcast('ai_turn');
      }

    }, 100)

  }

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
    var cl = this.currentLvl()

    //logic for problem 9 and 10
    if (cl.vital_point) {
      //TODO cleaner logic for lvls 9 and 10
      if (this.game.isValid(cl.vital_point.x, cl.vital_point.y, WGo.B)) {
      //if vital point hasn't been played play it...
        this.play(cl.vital_point.x, cl.vital_point.y, WGo.B);
      } else {
        //if it has been... and its problem 9 -- capture white group
        if (cl.id == 10) {
          if (this.game.isValid(cl.vital_point.x-1, cl.vital_point.y, WGo.B)) {
            this.play(cl.vital_point.x-1, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x+1, cl.vital_point.y, WGo.B)) {
            this.play(cl.vital_point.x+1, cl.vital_point.y, WGo.B);
            //TODO make a better solution to this problem...
          } else if (this.game.isValid(cl.vital_point.x+2, cl.vital_point.y, WGo.B)) {
            this.play(cl.vital_point.x+2, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x-2, cl.vital_point.y, WGo.B)) {
            this.play(cl.vital_point.x-2, cl.vital_point.y, WGo.B);
          } else if (this.game.isValid(cl.vital_point.x, cl.vital_point.y+1, WGo.B)) {
            this.play(cl.vital_point.x, cl.vital_point.y+1, WGo.B);
          } 
        } else if (cl.id == 9) {
        //if it has been and its problem 8
          var l = this.getLiberties(cl.target_group.x, cl.target_group.y)
          if (this.game.getStone(cl.target_group.x,cl.target_group.y) == 1) {
            if (l.length<2) {
              this.play(l[0].x, l[0].y, WGo.B)
            }
          }
        }
      }
    } else {

      //if there is no vital point
      var best_move = this.find_best_move();
      var cap = this.play(best_move.x,best_move.y, WGo.B);
    }

    if (cap) {
      var _this = this;
      timeout( function() {
        //reattach listener
        _this.board.addEventListener('click', _this.board._listener);
      },1500);
    } else {
      //reattach listener
      this.board.addEventListener('click', this.board._listener);
    }
  }

  Game.prototype.find_best_move = function() {
    var self = this
    var group = this.currentLvl().target_group;

    var libs = this.getLiberties(group.x,group.y)
    //find the best liberty to play on...
    var potential_moves = [];
    _.each(libs, function(lib) {
      //play here and examine group... record how many libs you have...
      var caps = self.game.play(lib.x, lib.y, WGo.B);
      var libs_n = self.getLiberties(group.x, group.y);
      potential_moves.push({move: lib, libs: libs_n.length});

      //then remove the stone
      self.game.removeStone(lib.x, lib.y);
      _.each(caps, function(cap) {
        self.game.addStone(cap.x, cap.y, WGo.W)
      })
    });
    potential_moves = _.sortBy(potential_moves, 'libs');
    potential_moves.reverse();
    //don't play self atari
    if (potential_moves[0].libs<1) {
      console.log('self atari');
    }
    var best_move = {};
    best_move.x = potential_moves[0].move.x;
    best_move.y = potential_moves[0].move.y;
    return best_move;
  }

  Game.prototype.setUpProblems = function() {
    //add all problems to board
    var game = this.game;
    var board = this.board;

    //reset game and listeners
    game.firstPosition();
    //this.clearListener();

    //get array of initial moves for problem
    var init_moves = this.currentLvl().init_moves;
    _.each(this.levels, function(value, key) {
      _.each(value.init_moves, function(stone, k) {
        //sync game position with pattern for problem
        game.play(stone.x,stone.y,stone.color)
      })
    })

    //populate board with pattern for problem
    this.setUpPosition();
  }

  Game.prototype.restart = function() {
    var self = this;

    //var sound = new Howl({
      //urls: ['sounds/restart.wav'],
      //volume: 1
    //}).play();

    //attach listeners
    this.setUpProblems();
  }

  return Game;
}]);
