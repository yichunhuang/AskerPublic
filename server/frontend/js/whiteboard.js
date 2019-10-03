(function(window){
    class Whiteboard {
      constructor(canvas) {
        this.isDrawing = false;
        this.canvas = canvas;
        this.offset = $(canvas).offset();
        this.context = canvas.getContext("2d");
        this.events = $({});
        this.history = null;
        this.backgroundColor = "white";
        this.lineColor = "#000000";
        this.lineWidth = 2;
        this.events = {move: [], start: [], end: []}; 
      }

      init() {
        this.reset();
  
        // Add listeners
        this.on("move", this.drawLines.bind(this));
        this.on("start", this.startDrawing.bind(this));
        this.on("end", this.stopDrawing.bind(this));
    
        // Watch for events and trigger the whiteboard's listeners.
        $(document)
          .on("mousemove",  this.watch("move"))
          .on("touchmove",  this.watch("move"))
          .on("mousedown",  this.watch("start"))
          .on("touchstart", this.watch("start"))
          .on("mouseup",    this.watch("end"))
          .on("touchend",   this.watch("end"))
        ;
    
        // Set some styles for the canvas element
        this.context.lineCap = "round";
        this.context.lineJoin = "round";
    
        // Remove the initialzer
        this.init = function() {
          throw new Error("The initializer can be executed only once.");
        };
      }

      // Calculate relative coordinates considering mouse position and canvas offset
      coordinates(event) {
        var touches = event.originalEvent.touches || event.originalEvent.changedTouches;
    
        if (touches) {
          event = touches[0];
        }
    
        if (!event) {
          return {};
        }
    
        return {
            x: (event.clientX - this.offset.left) + $(window).scrollLeft()
          , y: (event.clientY - this.offset.top) + $(window).scrollTop()
        };
      };

      // Handle the move event. Draw lines using the whiteboard canvas.
      drawLines(coords) {
        if (!this.history || !this.isDrawing) {
          this.history = coords;
          return;
        }
    
        this.draw(this.history, coords, this.lineColor, this.lineWidth);
        this.history = coords;
      };

      // Draw line between coords from and to.
      draw(from, to, color, width) {
        this.context.beginPath();
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.moveTo(from.x, from.y);
        this.context.lineTo(to.x, to.y);
        this.context.stroke();
        this.context.closePath();
      };

      // Start the drawing action, triggered when mouse button is down.
      startDrawing() {
        this.isDrawing = true;
      };

      // Stop the drawing action, triggered when mouse button is up
      stopDrawing() {
        this.isDrawing = false;
        this.history = null;
      };

      // Watch the specified event name
      // It will trigger each listener added by Whiteboard#on method.
      watch = function(eventName) {
        return function(event) {
          this.events[eventName].forEach(function(callback) {
            callback.call(this, this.coordinates(event));
          }, this);
        }.bind(this);
      }; 

      // Listen to the specified event. The callback will
      // receive coordinates as the parameter. The this context
      // will be set to the whiteboard instance.
      on(event, callback) {
        this.events[event].push(callback);
      };

      // Reset the whiteboard area. It will fill canvas with
      // color set on Whiteboard#backgroundColor.
      reset() {
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      };
    }

    // Expose the Whiteboard constructor.
    window.Whiteboard = Whiteboard;
  })(window);
  