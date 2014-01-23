var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var ColorThief = require("./color-thief").ColorThief;
var filter = require("./media-parser").filter;
var parseUri = require("./parse-uri").parseUri;
var utils = require("sdk/window/utils");

var workersMap = new WeakMap();

function getContentWindow() {
  var browserWindow = utils.getMostRecentBrowserWindow();
  return browserWindow.content;
}

/**
 * Draw the current content window to a canvas, using either
 * the viewable area (viewPortOnly=true) or else the entire page.
 */
function windowToCanvas(viewPortOnly) {
  var win = getContentWindow();
  var x, y, width, height;
  if(viewPortOnly) {
    x = win.pageXOffset;
    y = win.pageYOffset;
    width = win.innerWidth;
    height = win.innerHeight;
  } else /* entire page */ {
    x = 0;
    y = 0;
    width = win.innerWidth + win.scrollMaxX;
    height = win.innerHeight + win.scrollMaxY;
  }

  var canvas = win.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext("2d");
  ctx.drawWindow(win, x, y, width, height, "rgb(255,255,255)");

  return canvas;
}

function getWindowPalette() {
  // Draw the active window's DOM to a canvas, then extract palette info
  var canvas = windowToCanvas(true);
  var colorThief = new ColorThief();

  function toHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + toHex(r) + toHex(g) + toHex(b);
  }
  // TODO: also convert rgb to HEX when returning

  return colorThief.getPalette(canvas, 4);
}

function findFonts() {
  // iterate over document.styleSheets, and then look @font-face rules
  var o = {},
      win = getContentWindow(),
      document = win.document,
      sheet = document.styleSheets,
      rule = null,
      i = sheet.length, j,
      fontName, fontSrc, fontInfo;

  // TODO: could also try and get typekit, google font, etc. info
  // https://github.com/chengyin/WhatFont-Bookmarklet/blob/master/src/js/whatfont_core.js#L244

  function stripQuotes(s) {
    return s.replace(/"|'/g, '');
  }

  function getFontInfo(src) {
    // Split fontSrc into "url(...) format(...)" pair
    var rUrl = /url\("?([^)]+)"?\)/;
    var rFormat = /format\("?([^)]+)"?\)/;

    return {
      url: stripQuotes(rUrl.exec(src)[1]),
      format: stripQuotes(rFormat.exec(src)[1])
    };
  }

  while( 0 <= --i ){
    rule = sheet[i].cssRules;
    j = rule.length;
    while( 0 <= --j ){
      if(rule[j].cssText.indexOf("@font-face") > -1) {
        fontName = stripQuotes(rule[j].style.getPropertyValue("font-family"));
        fontSrc = rule[j].style.getPropertyValue("src");
        fontInfo = fontSrc.split(/\s*,\s*/).map(function(details) {
          return getFontInfo(details);
        });
        o[fontName] = fontInfo;
      }
    }
  }
  return o;
}

function makeWorker(tab) {
  return tab.attach({
    contentScriptFile: data.url("webmaker-colours.js")
  });
}

function getWorkerForTab(tab) {
  if(workersMap.has(tab)) {
    return workersMap.get(tab);
  }

  // If the tab gets recycled, and a new page loaded, invalidate
  function invalidateTab(tab) {
    workersMap.delete(tab);
  }
  tab.on("ready", invalidateTab);
  tab.on("close", invalidateTab);

  var worker = makeWorker(tab);
  workersMap.set(tab, worker);

  worker.port.on("found-elements", function(elements) {
    elements.iframe = filter(elements.iframe);

    // Parse out different aspects of URLs
    for(var name in elements) {
      elements[name] = elements[name].map(function(url) {
        return parseUri(url);
      });
    }

    worker.port.emit("render-srcs", elements);
  });

  worker.port.on("ui-ready", function() {
    var palette = getWindowPalette();
    worker.port.emit("render-palette", palette);
    worker.port.emit("find-elements");

    var fonts = findFonts();
    Object.keys(fonts).forEach(function(font) {
      console.log("Found Font:", font, fonts[font]);
    });
  });

  return worker;
}

var widget = widgets.Widget({
  id: "webmaker-colours",
  label: "Webmaker Colours",
  contentURL: "https://webmaker.org/img/favicon.ico",
  onClick: function() {
    var worker = getWorkerForTab(tabs.activeTab);
    worker.port.emit("setup-ui", {
      html: data.load("webmaker-colours.html"),
      css: data.load("webmaker-colours.css")
    });
  }
});

// TODO: add a context menu for this too.