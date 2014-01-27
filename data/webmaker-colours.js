(function(window, document, WebLitTools) {

  // Only do this once
  if(WebLitTools) {
    return;
  }
  window.WebLitTools = {};

  var count = 0;
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

    self.port.on("render-data", function(pageData) {
      var container = document.querySelector(".webmaker-colours");
      pageData.colours.forEach(function(colour) {
        var span = document.createElement("span");
        span.className = "webmaker-circle";
        span.style.background = "#" + colour.hex;
        span.innerHTML = colour.hex;
        container.appendChild(span);
      });

      console.log('render-data', pageData);
    });

    hasUI = true;
    self.port.emit("ui-ready");
  });

}(window, window.document, window.WebLitTools));
