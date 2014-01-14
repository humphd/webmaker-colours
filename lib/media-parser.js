
// Filter a list of iframe URLs for embeds, removing
// any that aren't YouTube, Vimeo, SoundCloud.

var embedFilterFns = [

  /**
   * YouTube:
   *
   * https://www.youtube.com/embed/CLg2JbELs9o?feature=youtube_gdata&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&origin=https%3A%2F%2Fpopcorn.webmaker.org&controls=0&wmode=opaque&enablejsapi=1
   */
  function YouTubeFilter(url) {
    return /^(https|http)\:\/\/www\.youtube\.com\/embed.+/.test(url);
  },

  /**
   * Vimeo:
   *
   * https://player.vimeo.com/video/46353153?api=1&player_id=1389718102887&title=0&byline=0&portrait=0
   */
  function VimeoFilter(url) {
    return /^(https|http)\:\/\/player\.vimeo\.com\/video.+/.test(url);
  },

  /**
   * SoundCloud
   *
   * https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/11921587&show_artwork=false&buying=false&liking=false&sharing=false&download=false&show_comments=false&show_user=false&single_active=false
   */
  function SoundCloudFilter(url) {
    return /^(https|http)\:\/\/w\.soundcloud\.com\/player.+/.test(url);
  }

];


function filter(urls) {
  var filtered = [];

  urls = Array.isArray(urls) ? urls : [urls];
  urls.forEach(function(url) {
    var include = false;
    embedFilterFns.forEach(function(fn) {
      if(fn(url)) include = true;
    });
    if(include) filtered.push(url);
  });
  return filtered;
}

exports.filter = filter;
