(function () {
  'use strict';

  // Copy to clipboard
  document.querySelectorAll('.copy-bibtex').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = document.getElementById(btn.dataset.target);
      if (!pre) return;
      var text = pre.textContent.trim();
      var orig = btn.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Kopiert!';
          setTimeout(function () { btn.textContent = orig; }, 2000);
        }).catch(function () {
          fallbackCopy(text, btn, orig);
        });
      } else {
        fallbackCopy(text, btn, orig);
      }
    });
  });

  function fallbackCopy(text, btn, orig) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      btn.textContent = 'Kopiert!';
      setTimeout(function () { btn.textContent = orig; }, 2000);
    } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  // Download as .bib file
  document.querySelectorAll('.download-bibtex').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var pre = document.getElementById(link.dataset.target);
      if (!pre) return;
      var blob = new Blob([pre.textContent.trim() + '\n'], { type: 'application/x-bibtex' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = link.getAttribute('download') || 'citation.bib';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
})();
