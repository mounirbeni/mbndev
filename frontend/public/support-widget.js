/*! MBN Support AI widget loader — https://mbndev.ma/products/support-ai
 * Usage: <script src="https://mbndev.ma/support-widget.js" data-bot="BOT_ID" defer></script>
 * Renders the chat in an isolated iframe (no CSS or script conflicts with the host page).
 */
(function () {
  'use strict';
  if (window.__mbnSupportAi) return;
  window.__mbnSupportAi = true;

  var script = document.currentScript || document.querySelector('script[data-bot][src*="support-widget.js"]');
  if (!script) return;
  var bot = script.getAttribute('data-bot');
  if (!bot || !/^[a-z0-9]{10,40}$/i.test(bot)) return;
  var base = new URL(script.src).origin;

  var CLOSED = { w: '76px', h: '76px' };
  var iframe = document.createElement('iframe');
  iframe.src = base + '/widget/chat/' + encodeURIComponent(bot) + '?origin=' + encodeURIComponent(location.hostname);
  iframe.title = 'Chat';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = [
    'position:fixed', 'right:12px', 'bottom:12px', 'width:' + CLOSED.w, 'height:' + CLOSED.h,
    'border:0', 'background:transparent', 'color-scheme:normal', 'z-index:2147483000',
    'max-width:100vw', 'max-height:100vh', 'transition:width .2s,height .2s',
  ].join(';');

  function resize(open) {
    var small = window.innerWidth < 480;
    if (!open) {
      iframe.style.width = CLOSED.w; iframe.style.height = CLOSED.h;
      iframe.style.right = '12px'; iframe.style.bottom = '12px';
    } else if (small) {
      iframe.style.width = '100vw'; iframe.style.height = '100vh';
      iframe.style.right = '0'; iframe.style.bottom = '0';
    } else {
      iframe.style.width = '400px'; iframe.style.height = '640px';
      iframe.style.right = '12px'; iframe.style.bottom = '12px';
    }
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== base || !e.data || e.data.type !== 'mbn-support-ai') return;
    resize(Boolean(e.data.open));
  });

  function mount() { document.body.appendChild(iframe); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
