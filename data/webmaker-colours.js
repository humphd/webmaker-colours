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

  var twitterRegex = /^twitter\:/,
      ogRegex = /^og\:/,
      dcRegex = /^dc\./,
      dctermsRegex = /^dcterms\./;
  function parseMeta() {
    /**
     * Find social graph and other metadata we might care about:
     *   <meta property="og:title" content="This is a title">
     *   <meta name="og:url" content="http://foo.com">
     *   <meta name="twitter:title" content="This is also a title">
     */
    var metas = document.querySelectorAll("meta"),
        result = {},
        unprocessed = [],
        // Buckets for each namespaced type of meta data we look for
        og = {},
        twitter = {},
        dc = {},
        dcterms = {},
        name,
        content;

    // Try grabbing social graph data first
    for(var meta of metas) {
      // HTML5 spec says to use `name`, OG and others say `property`.
      name = meta.getAttribute('name') || meta.getAttribute('property');
      if(!name) {
        continue;
      }
      name = name.toLowerCase();

      // In the wild you'll find name/content, property/content, name/value, ...
      content = meta.getAttribute('content') || meta.getAttribute('value') || '';

      if ( ogRegex.test( name ) ) {
        og[ name ] = content;
      } else if ( twitterRegex.test( name ) ) {
        twitter[ name ] = content;
      } else if ( dcRegex.test( name ) ) {
        dc[ name ] = content;
      } else if ( dctermsRegex.test( name ) ) {
        dcterms[ name ] = content;
      } else {
        // Remember the ones we didn't use in case we don't get
        // any social graph data and want to look at it later
        unprocessed.push({
          name: name,
          content: content
        });
      }
    }

    // Attach any populated namespace buckets
    if ( Object.keys( og ).length ) {
      result.og = og;
    }
    if ( Object.keys( twitter ).length ) {
      result.twitter = twitter;
    }
    if ( Object.keys( dc ).length ) {
      result.dc = dc;
    }
    if ( Object.keys( dcterms ).length ) {
      result.dcterms = dcterms;
    }

    // If we didn't find any social graph data, look for more standard metadata.
    if ( !Object.keys( result ).length ) {
      unprocessed.forEach( function( m ) {
        name = m.name;
        content = m.content;

        switch( name ) {
        case 'description':
          result.description = content;
          break;
        case 'author':
        case 'creator':
          result.author = content;
          break;
        }
      });
    }

    // Add the document title.
    var title = document.title;
    if ( title ) {
      result.title = title;
    }

    return result;
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

      console.log("Interesting meta:", parseMeta());
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
