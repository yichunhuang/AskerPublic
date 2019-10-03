  (function(){
    let Drawing = {};
  
    Drawing.CANVAS_WIDTH = 900;
    Drawing.CANVAS_HEIGHT = 860;
  
    Drawing.init = function() {
      // the html container.
      this.html = $("#whiteboard");
  
      // the canvas must exist on DOM or the Whiteboard
      // component won't be able to detects its dimension.
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.CANVAS_WIDTH;
      this.canvas.height = this.CANVAS_HEIGHT;
      this.html.append(this.canvas);
  
      // initialize the whiteboard component.
      this.whiteboard = new Whiteboard(this.canvas);
  
      // initialize the save button.
      this.saveButton = new Drawing.SaveButton(
          window
        , $(".save")
        , this.canvas
      );
  
  
      // initialize the color button toolbar.
      this.colorToolbar = new Drawing.ColorButtonToolbar(
          this.whiteboard
        , $(".color")
      );
  
      // initialize the Socket.IO connection.
      this.connection = socket; 
  
      // initialize the reset button.
      this.resetButton = new Drawing.ResetButton(
          this.connection
        , this.whiteboard
        , $(".reset")
      );

      // initialize the drawing events coordinator.
      this.broadcast = new Drawing.Coordinator(
          this.connection
        , this.whiteboard
      );
  
      // initialize the whiteboard.
      this.whiteboard.init();
    };
  
    // Drawing.Coordinator
    Drawing.Coordinator = class {
      constructor(connection, whiteboard) {
        this.connection = connection;
        this.whiteboard = whiteboard;
    
        this.addEventListeners();
      }
      
      addEventListeners() {
        this.connection.on("draw", this.draw.bind(this));
        this.whiteboard.on("move", this.emitDrawing.bind(this));
      };

      draw(info) {
        this.whiteboard.draw(
            info.from
          , info.to
          , info.lineColor
          , info.lineWidth
        );
      };

      emitDrawing(coords) {
        if (!this.whiteboard.isDrawing) {
          return;
        }
    
        this.connection.emit("draw", {
            from: this.whiteboard.history
          , to: coords
          , lineWidth: this.whiteboard.lineWidth
          , lineColor: this.whiteboard.lineColor
        });
      };
    };
  
  
    // Drawing.ColorButtonToolbar
    Drawing.ColorButtonToolbar = class {
      constructor(whiteboard, buttons) {
        this.buttons = buttons;
        this.whiteboard = whiteboard;
    
        this.addEventListeners();
        this.renderBackground();
      }

      addEventListeners() {
        this.buttons
          .on("click", this.onActivate.bind(this))
          .on("touchstart", this.onActivate.bind(this))
        ;
      };

      onActivate(event) {
        var button = $(event.target);
    
        this.buttons.removeClass("active");
        button.addClass("active");
    
        this.whiteboard.lineColor = button.data("color");
        this.whiteboard.lineWidth = button.data("width");
      };

      renderBackground() {
        this.buttons.each(function(){
          $(this).css({
            background: $(this).data("color")
          });
        });
      };
    };
  
    // Drawing.ResetButton
    Drawing.ResetButton = class {
      constructor(connection, whiteboard, button) {
        this.button = button;
        this.whiteboard = whiteboard;
        this.connection = connection;
        this.addEventListeners();
      }

      addEventListeners() {
        this.button
          .on("click", this.reset.bind(this))
          .on("touchstart", this.reset.bind(this));
        this.connection.on("reset", this.resetFromServer.bind(this));
      };

      reset() {
        this.whiteboard.reset();
        this.connection.emit("reset");
      };

      resetFromServer() {
        this.whiteboard.reset();
      };
    };
  
    // Drawing.SaveButton
    Drawing.SaveButton = class {
      constructor(window, button, canvas) {
        this.window = window;
        this.button = button;
        this.canvas = canvas;
    
        this.addEventListeners();
      }

      addEventListeners() {
        this.button.on("click", this.onClick.bind(this));
      };

      onClick(event) {
        let win = this.window.open();
        win.document.write('<iframe src="' + this.canvas.toDataURL("image/png")  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
      };
    };
  
    Drawing.init();
  })();


  