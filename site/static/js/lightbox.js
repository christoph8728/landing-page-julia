(function () {
  'use strict';

  var overlay = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);
  }

  function open(src, alt) {
    if (!overlay) createOverlay();

    overlay.innerHTML = '';

    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    overlay.appendChild(img);

    if (alt) {
      var caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.textContent = alt;
      overlay.appendChild(caption);
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // Attach to images inside content/article areas. Also includes publication
  // cover images and inline figure elements.
  function bind() {
    var images = document.querySelectorAll(
      '.content img, article img, .sp-cover img, .bc-img img, .prose-img-pair img, figure img'
    );
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.dataset.lightboxBound === '1') continue;
      img.dataset.lightboxBound = '1';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function (ev) {
        ev.stopPropagation();
        open(this.src, this.alt);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
