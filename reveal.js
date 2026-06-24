/* OmniScape — reveal-on-scroll. Progressive enhancement; if anything fails,
 * content is shown by the .is-in fallback below. Safe on Mintlify SPA nav. */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function reveal(el) {
    el.classList.add('is-in');
  }

  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
  }

  function scan() {
    var nodes = document.querySelectorAll('.os-reveal:not(.is-in)');
    nodes.forEach(function (n) {
      if (io) {
        // already on screen at load? reveal immediately
        var r = n.getBoundingClientRect();
        if (r.top < (window.innerHeight || 0) * 0.96) reveal(n);
        else io.observe(n);
      } else {
        reveal(n);
      }
    });
  }

  function boot() {
    scan();
    // Watch for client-side route changes adding new content.
    var mo = new MutationObserver(function () {
      window.requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Safety net only if IntersectionObserver is unavailable.
    if (!io) {
      document.querySelectorAll('.os-reveal').forEach(reveal);
    }
    // Reveal any landing blocks still hidden after 1.5s (Mintlify inner scroll containers).
    window.setTimeout(function () {
      var landing = document.querySelector('.os-landing');
      if (!landing) return;
      landing.querySelectorAll('.os-reveal:not(.is-in)').forEach(reveal);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
