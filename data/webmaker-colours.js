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

  function getSrcsFor(name) {
    var srcs = [];
    var list = document.querySelectorAll(name);
    for(var item of list) {
      srcs.push(item.href || item.src);
    }
    return srcs;
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

    self.port.on("render-srcs", function(srcs) {
      count++;
      console.log("render-srcs has run " + count + " times.");

      // Show all interesting srcs
      console.log("Interesting video:", srcs.video);
      console.log("Interesting audio:", srcs.audio);
      console.log("Interesting iframe:", srcs.iframe);
      console.log("Interesting img:", srcs.img);
      console.log("Interesting a:", srcs.a);
    });

    self.port.on("find-elements", function() {
      // Find all <video>, <audio>, <iframe>, <img>, and <a>
      self.port.emit("found-elements", {
        // TODO: deal with <source> elements under <video>
        video: getSrcsFor('video'),
        // TODO: deal with <source> elements under <audio>
        audio: getSrcsFor('audio'),
        iframe: getSrcsFor('iframe'),
        img: getSrcsFor('img'),
        a: getSrcsFor('a')
      });
    });

    hasUI = true;
    self.port.emit("ui-ready");
  });

}(window, window.document, window.WebLitTools));
