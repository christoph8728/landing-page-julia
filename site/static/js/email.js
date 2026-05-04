/*
 * Email obfuscation — join user + domain at runtime so the raw address
 * never appears in the static HTML that crawlers see.
 *
 * Markup:
 *   <span class="email-protected" data-u="local-part" data-d="example.com">
 *     [E-Mail-Adresse wird im Browser angezeigt]
 *   </span>
 *
 * At load, each span is replaced with a real <a href="mailto:…"> element.
 */
(function () {
  'use strict';

  function reveal(el) {
    var u = el.getAttribute('data-u');
    var d = el.getAttribute('data-d');
    if (!u || !d) return;
    var addr = u + '@' + d;
    var link = document.createElement('a');
    link.href = 'mailto:' + addr;
    // If data-text is present, show that label instead of the raw address
    // (used by the nav "Kontakt" link). Otherwise render the full address.
    var label = el.getAttribute('data-text');
    link.textContent = label || addr;
    // Copy any classes other than the placeholder class so the new link
    // inherits hover / typography styling from its container (.hlink etc).
    var extra = (el.className || '').split(/\s+/).filter(function (c) {
      return c && c !== 'email-protected';
    });
    if (extra.length) link.className = extra.join(' ');
    el.replaceWith(link);
  }

  function init() {
    document.querySelectorAll('.email-protected').forEach(reveal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
