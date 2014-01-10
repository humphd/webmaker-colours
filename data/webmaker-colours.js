(function() {

  var hasUI = false;

  function HTMLtoDOMFragment(htmlString) {
    var range = document.createRange(),
        container = document.body || document.head;

    range.selectNode(container);
    return range.createContextualFragment(htmlString);
  }

  function CSStoStyle(cssString) {
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent = cssString;
    return style;
  }

  self.port.on("setup-ui", function(data) {
    if(hasUI) {
      self.port.emit("ui-ready");
      return;
    }
    var fragment = HTMLtoDOMFragment(data.html);
    document.body.appendChild(fragment);

    var style = CSStoStyle(data.css);
    document.head.appendChild(style);

    hasUI = true;
    self.port.emit("ui-ready");
  });

  self.port.on("render-palette", function(palette) {
    var container = document.querySelector(".webmaker-colours");
    palette.forEach(function(colour) {
      var span = document.createElement("span");
      span.className = "webmaker-circle";
      span.style.background = "rgb(" + colour.join(",") + ")";
      span.innerHTML = colour.join(",");
      container.appendChild(span);
    });

    console.log('render-palette', palette);
  });

}());
