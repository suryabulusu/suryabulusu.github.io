/*
 * from colah github io
 * ....
 *  inlineDisqussions
 *  By Tsachi Shlidor ( @shlidor )
 *  Inspired by http://mystrd.at/articles/multiple-disqus-threads-on-one-page/
 *
 *  USAGE:
 *
 *       disqus_shortname = 'your_disqus_shortname';
 *       $(document).ready(function() {
 *         $("p").inlineDisqussions(options);
 *       });
 *
 *  See https://github.com/tsi/inlineDisqussions for more info.
 */

// Disqus global vars.
let disqus_shortname;
let disqus_identifier;
let disqus_url;

(function ($) {
  let settings = {};

  $.fn.extend({
    inlineDisqussions: function (options) {
      // Set up defaults
      const defaults = {
        identifier: "disqussion",
        displayCount: true,
        highlighted: false,
        position: "right",
        background: "white",
        maxWidth: 9999,
      };

      // Overwrite default options with user provided ones.
      settings = $.extend({}, defaults, options);

      // Append #disqus_thread to body if it doesn't exist yet.
      if ($("#disqussions_wrapper").length === 0) {
        $('<div id="disqussions_wrapper"></div>').appendTo($("body"));
      }
      if ($("#disqus_thread").length === 0) {
        $('<div id="disqus_thread"></div>').appendTo("#disqussions_wrapper");
      } else {
        mainThreadHandler();
      }
      if (settings.highlighted) {
        $('<div id="disqussions_overlay"></div>').appendTo($("body"));
      }

      // Attach a discussion to each paragraph.
      $(this).each(function (i) {
        disqussionNotesHandler(i, $(this));
      });

      // Display comments count.
      if (settings.displayCount) {
        loadDisqusCounter();
      }

      // Hide the discussion.
      $("html").click(function (event) {
        if (
          $(event.target).parents(
            "#disqussions_wrapper, .main-disqussion-link-wrp"
          ).length === 0
        ) {
          hideDisqussion();
        }
      });
    },
  });

  var disqussionNotesHandler = function (i, node) {
    let identifier;
    // You can force a specific identifier by adding an attribute to the paragraph.
    if (node.attr("data-disqus-identifier")) {
      identifier = node.attr("data-disqus-identifier");
    } else {
      while (
        $(
          '[data-disqus-identifier="' +
            window.location.pathname +
            settings.identifier +
            "-" +
            i +
            '"]'
        ).length > 0
      ) {
        i++;
      }
      identifier = window.location.pathname + settings.identifier + "-" + i;
    }

    // Create the discussion note.
    const cls = settings.highlighted
      ? "disqussion-link disqussion-highlight"
      : "disqussion-link";
    const a = $('<a class="' + cls + '" />')
      .attr(
        "href",
        window.location.pathname +
          settings.identifier +
          "-" +
          i +
          "#disqus_thread"
      )
      .attr("data-disqus-identifier", identifier)
      .attr(
        "data-disqus-url",
        window.location.href + settings.identifier + "-" + i
      )
      .attr("data-disqus-position", settings.position)
      .text("+")
      .wrap('<div class="disqussion" />')
      .parent()
      .appendTo("#disqussions_wrapper");
    a.css({
      top: node.offset().top,
      left:
        settings.position == "right"
          ? node.offset().left + node.outerWidth()
          : node.offset().left - a.outerWidth(),
    });

    node
      .attr("data-disqus-identifier", identifier)
      .mouseover(function () {
        a.addClass("hovered");
      })
      .mouseout(function () {
        a.removeClass("hovered");
      });

    // Load the relative discussion.
    a.delegate("a.disqussion-link", "click", function (e) {
      e.preventDefault();

      if ($(this).is(".active")) {
        e.stopPropagation();
        hideDisqussion();
      } else {
        loadDisqus($(this), function (source) {
          relocateDisqussion(source);
        });
      }
    });
  };

  var mainThreadHandler = function () {
    // Create the discussion note.
    if ($("a.main-disqussion-link").length === 0) {
      const a = $('<a class="main-disqussion-link" />')
        .attr("href", window.location.pathname + "#disqus_thread")
        .text("Comments")
        .wrap('<h3 class="main-disqussion-link-wrp" />')
        .parent()
        .insertBefore("#disqus_thread");

      // Load the relative discussion.
      a.delegate("a.main-disqussion-link", "click", function (e) {
        e.preventDefault();

        if ($(this).is(".active")) {
          e.stopPropagation();
        } else {
          loadDisqus($(this), function (source) {
            relocateDisqussion(source, true);
          });
        }
      });
    }
  };

  var loadDisqus = function (source, callback) {
    const identifier = source.attr("data-disqus-identifier");
    const url = source.attr("data-disqus-url");

    if (window.DISQUS) {
      // If Disqus exists, call it's reset method with new parameters.
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = identifier;
          this.page.url = url;
        },
      });
    } else {
      disqus_identifier = identifier;
      disqus_url = url;

      // Append the Disqus embed script to <head>.
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "//" + disqus_shortname + ".disqus.com/embed.js";
      $("head").append(s);
    }

    // Add 'active' class.
    $("a.disqussion-link, a.main-disqussion-link")
      .removeClass("active")
      .filter(source)
      .addClass("active");

    // Highlight
    if (source.is(".disqussion-highlight")) {
      highlightDisqussion(identifier);
    }

    callback(source);
  };

  var loadDisqusCounter = function () {
    // Append the Disqus count script to <head>.
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "//" + disqus_shortname + ".disqus.com/count.js";
    $("head").append(s);

    // Add class to discussions that already have comments.
    window.setTimeout(function () {
      $(".disqussion-link")
        .filter(function () {
          return $(this).text().match(/[1-9]/g);
        })
        .addClass("has-comments");
    }, 1000);
  };

  var relocateDisqussion = function (el, main) {
    // Move the discussion to the right position.
    let css = {};
    if (main === true) {
      $("#disqus_thread").removeClass("positioned");
      css = {
        position: "static",
        width: "auto",
      };
    } else {
      $("#disqus_thread").addClass("positioned");
      css = {
        position: "absolute",
      };
    }
    css.backgroundColor = settings.background;

    let animate = {};
    if (el.attr("data-disqus-position") == "right") {
      animate = {
        top: el.offset().top,
        left: el.offset().left + el.outerWidth(),
        width: Math.min(
          parseInt(
            $(window).width() - (el.offset().left + el.outerWidth()),
            10
          ) - 80,
          settings.maxWidth
        ),
      };
    } else if (el.attr("data-disqus-position") == "left") {
      animate = {
        top: el.offset().top,
        left:
          el.offset().left -
          Math.min(parseInt(el.offset().left, 10), settings.maxWidth),
        width: Math.min(parseInt(el.offset().left, 10), settings.maxWidth),
      };
    }

    $("#disqus_thread").stop().fadeIn("fast").animate(animate, "fast").css(css);
  };

  var hideDisqussion = function () {
    $("#disqus_thread").stop().fadeOut("fast");
    $("a.disqussion-link").removeClass("active");

    // settings.highlighted
    $("#disqussions_overlay").fadeOut("fast");
    $("body").removeClass("disqussion-highlight");
    $("[data-disqus-identifier]").removeClass("disqussion-highlighted");
  };

  var highlightDisqussion = function (identifier) {
    $("body").addClass("disqussion-highlight");
    $("#disqussions_overlay").fadeIn("fast");
    $("[data-disqus-identifier]")
      .removeClass("disqussion-highlighted")
      .filter(
        '[data-disqus-identifier="' + identifier + '"]:not(".disqussion-link")'
      )
      .addClass("disqussion-highlighted");
  };
})(jQuery);
