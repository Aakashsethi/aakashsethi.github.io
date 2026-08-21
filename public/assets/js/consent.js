/* Cookie consent + GA4 consent-mode gating.
   Pairs with the gtag snippet that sets default consent to "denied"
   for analytics_storage / ad_storage before the GA config call. */
(function () {
  var STORAGE_KEY = 'as_consent_v1';
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  function grant() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function deny() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function persist(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
  }

  if (saved === 'granted') { grant(); return; }
  if (saved === 'denied')  { deny();  return; }

  // No saved choice → render banner once DOM is ready.
  function render() {
    if (document.getElementById('as-cookie-banner')) return;
    var el = document.createElement('div');
    el.id = 'as-cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<div class="as-cookie-inner">' +
        '<div class="as-cookie-text">' +
          '<strong>Cookies &amp; analytics</strong>' +
          '<span>This site uses Google Analytics to understand traffic. No ads, no third-party tracking. <a href="/privacy/" style="color:inherit;text-decoration:underline;">Read the privacy policy</a>.</span>' +
        '</div>' +
        '<div class="as-cookie-actions">' +
          '<button type="button" class="as-cookie-btn as-cookie-deny">Decline</button>' +
          '<button type="button" class="as-cookie-btn as-cookie-accept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.as-cookie-accept').addEventListener('click', function () {
      grant(); persist('granted'); el.remove();
    });
    el.querySelector('.as-cookie-deny').addEventListener('click', function () {
      deny(); persist('denied'); el.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
