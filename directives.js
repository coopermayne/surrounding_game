app.directive("gameTime", function() {
  return {
    restrict: "A",
    controller: function($scope, $element) {
      var g = $scope.game
      g.firstPosition();
      g.addStone(4,4,WGo.B);
    },
    template: "<h1>lvl: {{current_lvl}}</h1>" + 
              "<board game='game'></board>"
  }
})

app.directive("board", function() {
  return {
    restrict: "E",
    scope: {
      game: "=",
    },
    controller: function($scope, $element) {
      $scope.mode = "problem"

      $scope.determineBackground = function(index, val) {
        //return file name for cell
        var size = $scope.game.size;
        var coord = $scope.indexToCoordinates(index,size)

        //Stones 
        if (val==1) { return "blackStone" }
        if (val==-1) { return "whiteStone" } 
      }

      $scope.setPosition = function(index) {
        //return css style string
        var b = document.getElementsByClassName('boardContainer')[0]
        var total_width = b.clientWidth;
        var cell_width = total_width/$scope.game.size;
        var size = $scope.game.size;

        coord = $scope.indexToCoordinates(index,size)

        pos_x = coord.x*cell_width
        pos_y = coord.y*cell_width

        string = "top: " + pos_y + "px;" + "left: " +  pos_x + "px;";
        string += "width: " + cell_width+ "px;" + "height: "+ cell_width + "px;";
        string += "background-size: " + cell_width+  "px;";

        return string;
      }

      $scope.indexToCoordinates = function(index, size) {
        var x = Math.floor(index/size);
        var y = index%size;
        return {
          x: x,
          y: y
        }
      }
      $scope.beenClicked = function(index) {
        //tell controller that someone clicked - let the controller modify the game model

        coordinates = $scope.indexToCoordinates(index, $scope.game.size)
        console.log($scope.game);
        if ($scope.mode == "problem") {
          $scope.game.play(coordinates.x, coordinates.y, WGo.W)
        } else {
          $scope.game.play(coordinates.x,coordinates.y);
        }
      }
    },

    templateUrl: 'stone.html',

    link: function(scope, element, attrs) {

      var makeBoard = function(scope, config) {
        if (typeof(config) != 'object') { var config = {} }

        var config = {
          stroke_width: config.stroke_width || 1,
          stroke_color: config.stroke_color || 'black'
        }

        var line_config = {
          "stroke-width": config.stroke_width,
          "stroke": config.stroke_color
        }

        var el = document.getElementsByClassName('boardContainer')[0]
        var total_width = el.clientWidth;
        var interval = total_width/scope.game.size;
        var paper = new Raphael(el, total_width, total_width);

        for (var i = 0, len = scope.game.size; i < len; i++) {
          //verticle lines
          var start = {
            x: i*interval + interval/2,
            y: interval/2
          };
          var end = {
            y: total_width - interval/2
          };
          var line = paper.path( ["M", start.x, start.y, "V", end.y ] );
          line.attr(line_config)

          //horizontal lines
          var start = {
            y: i*interval + interval/2,
            x: interval/2
          };
          var end = {
            x: total_width - interval/2
          };
          var line = paper.path( ["M", start.x, start.y, "H", end.x ] );
          line.attr(line_config)
        }
      }

      makeBoard(scope, {})
    }
  }
});

app.directive("hover", function() {
  return function(scope, element) {
    element.bind("mouseenter", function() {
      element.addClass('ghost');
    });
    element.bind("mouseleave", function() {
      element.removeClass('ghost');
    })
  }
})
