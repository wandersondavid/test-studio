import express, { Router } from 'express';
import { EnvironmentService } from '../services/environment.service.js';
const envService = new EnvironmentService();
const proxyBodyParser = express.raw({ type: '*/*', limit: '10mb' });
export const recorderRouter = Router();
recorderRouter.get('/client.js', (_req, res) => {
    res.type('application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.send(getRecorderClientScript());
});
recorderRouter.all('/proxy/:environmentId', proxyBodyParser, proxyRecorderRequest);
recorderRouter.all('/proxy/:environmentId/*', proxyBodyParser, proxyRecorderRequest);
async function proxyRecorderRequest(req, res, next) {
    try {
        const environment = await envService.findById(req.params.environmentId);
        if (!environment) {
            res.status(404).json({ error: 'Ambiente não encontrado' });
            return;
        }
        const proxyBase = getProxyBase(req.params.environmentId);
        const upstreamUrl = buildUpstreamUrl(environment.baseURL, req);
        const requestBody = getRequestBody(req);
        const requestInit = {
            method: req.method,
            headers: buildUpstreamHeaders(req, normalizeStringRecord(environment.headers), upstreamUrl),
            redirect: 'manual',
        };
        if (requestBody) {
            requestInit.body = requestBody;
        }
        const upstreamResponse = await fetch(upstreamUrl, requestInit);
        const cfMitigated = upstreamResponse.headers.get('cf-mitigated');
        if (cfMitigated === 'challenge' || upstreamResponse.status >= 400) {
            const reason = cfMitigated === 'challenge'
                ? 'cloudflare'
                : upstreamResponse.status === 401
                    ? 'unauthorized'
                    : upstreamResponse.status === 403
                        ? 'forbidden'
                        : 'upstream-error';
            res
                .status(200)
                .type('text/html; charset=utf-8')
                .send(renderRecorderBlockedPage({
                environmentName: environment.name,
                targetUrl: upstreamUrl,
                status: upstreamResponse.status,
                reason,
                proxyBase,
            }));
            return;
        }
        applyProxyResponseHeaders(res, upstreamResponse.headers, proxyBase, environment.baseURL);
        const contentType = upstreamResponse.headers.get('content-type') ?? '';
        if (contentType.includes('text/html')) {
            const html = await upstreamResponse.text();
            res.status(upstreamResponse.status).send(injectRecorderIntoHtml(rewriteHtmlContent(html, proxyBase), proxyBase));
            return;
        }
        const body = Buffer.from(await upstreamResponse.arrayBuffer());
        res.status(upstreamResponse.status).send(body);
    }
    catch (error) {
        next(error);
    }
}
function getProxyBase(environmentId) {
    return `/api/recorder/proxy/${environmentId}`;
}
function buildUpstreamUrl(baseURL, req) {
    const rawPath = req.params[0] ? `/${req.params[0]}` : '/';
    const queryIndex = req.originalUrl.indexOf('?');
    const rawQuery = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
    return new URL(`${rawPath}${rawQuery}`, baseURL).toString();
}
function getRequestBody(req) {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return undefined;
    }
    return Buffer.isBuffer(req.body) && req.body.length > 0 ? new Uint8Array(req.body) : undefined;
}
function buildUpstreamHeaders(req, environmentHeaders, upstreamUrl) {
    const headers = new Headers();
    const blockedHeaders = new Set([
        'accept-encoding',
        'connection',
        'content-length',
        'host',
        'origin',
        'referer',
    ]);
    for (const [key, value] of Object.entries(req.headers)) {
        if (!value || blockedHeaders.has(key.toLowerCase())) {
            continue;
        }
        if (Array.isArray(value)) {
            headers.set(key, value.join(', '));
            continue;
        }
        headers.set(key, value);
    }
    for (const [key, value] of Object.entries(environmentHeaders)) {
        headers.set(key, value);
    }
    const upstream = new URL(upstreamUrl);
    headers.set('origin', upstream.origin);
    headers.set('referer', upstream.toString());
    return headers;
}
function normalizeStringRecord(value) {
    if (!value) {
        return {};
    }
    if (value instanceof Map) {
        return Object.fromEntries(Array.from(value.entries()).filter((entry) => typeof entry[0] === 'string' && typeof entry[1] === 'string'));
    }
    if (typeof value === 'object') {
        const plainValue = 'toJSON' in value && typeof value.toJSON === 'function'
            ? value.toJSON()
            : value;
        const entries = Object.entries(plainValue).filter((entry) => !entry[0].startsWith('$') && typeof entry[1] === 'string');
        return Object.fromEntries(entries);
    }
    return {};
}
function applyProxyResponseHeaders(res, upstreamHeaders, proxyBase, targetBaseURL) {
    const ignoredHeaders = new Set([
        'content-encoding',
        'content-length',
        'content-security-policy',
        'cross-origin-embedder-policy',
        'cross-origin-opener-policy',
        'cross-origin-resource-policy',
        'transfer-encoding',
        'x-frame-options',
    ]);
    for (const [key, value] of upstreamHeaders.entries()) {
        if (ignoredHeaders.has(key.toLowerCase()) || key.toLowerCase() === 'set-cookie' || key.toLowerCase() === 'location') {
            continue;
        }
        res.setHeader(key, value);
    }
    const location = upstreamHeaders.get('location');
    if (location) {
        res.setHeader('location', rewriteUpstreamUrl(location, proxyBase, targetBaseURL));
    }
    const setCookie = getSetCookieHeaders(upstreamHeaders);
    if (setCookie.length > 0) {
        res.setHeader('set-cookie', setCookie.map(cookie => rewriteSetCookie(cookie, proxyBase)));
    }
}
function getSetCookieHeaders(headers) {
    const withGetSetCookie = headers;
    if (typeof withGetSetCookie.getSetCookie === 'function') {
        return withGetSetCookie.getSetCookie();
    }
    const combined = headers.get('set-cookie');
    return combined ? [combined] : [];
}
function rewriteSetCookie(cookie, proxyBase) {
    const withoutDomain = cookie.replace(/;\s*Domain=[^;]+/gi, '');
    const pathValue = `${proxyBase}/`;
    if (/;\s*Path=/i.test(withoutDomain)) {
        return withoutDomain.replace(/;\s*Path=[^;]*/i, `; Path=${pathValue}`);
    }
    return `${withoutDomain}; Path=${pathValue}`;
}
function rewriteUpstreamUrl(location, proxyBase, targetBaseURL) {
    if (location.startsWith('/')) {
        return `${proxyBase}${location}`;
    }
    try {
        const targetBase = new URL(targetBaseURL);
        const parsed = new URL(location);
        if (parsed.origin === targetBase.origin) {
            return `${proxyBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
    }
    catch {
        return location;
    }
    return location;
}
function rewriteHtmlContent(html, proxyBase) {
    return html
        .replace(/(href|src|action)=("|')\/(?!\/)/gi, `$1=$2${proxyBase}/`)
        .replace(/url\((["'])?\/(?!\/)/gi, `url($1${proxyBase}/`);
}
function injectRecorderIntoHtml(html, proxyBase) {
    const bootstrap = [
        '<script>',
        `window.__TEST_STUDIO_RECORDER__ = ${JSON.stringify({ proxyBase })};`,
        '</script>',
        '<script src="/api/recorder/client.js"></script>',
    ].join('');
    if (html.includes('</head>')) {
        return html.replace('</head>', `${bootstrap}</head>`);
    }
    if (html.includes('</body>')) {
        return html.replace('</body>', `${bootstrap}</body>`);
    }
    return `${bootstrap}${html}`;
}
function renderRecorderBlockedPage(input) {
    const reasonText = getBlockedReasonText(input.reason);
    const payload = JSON.stringify({
        source: 'test-studio-recorder',
        event: 'blocked',
        payload: {
            status: input.status,
            reason: input.reason,
            targetUrl: input.targetUrl,
            environmentName: input.environmentName,
        },
    });
    return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recorder bloqueado</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }
      .shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }
      .card {
        max-width: 720px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 28px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: #fff7ed;
        color: #b45309;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      h1 {
        margin: 16px 0 10px;
        font-size: 28px;
      }
      p {
        margin: 0 0 12px;
        line-height: 1.6;
      }
      code {
        display: block;
        margin-top: 16px;
        padding: 14px;
        border-radius: 12px;
        background: #0f172a;
        color: #e2e8f0;
        overflow-wrap: anywhere;
      }
      ul {
        margin: 16px 0 0;
        padding-left: 20px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <span class="badge">Preview bloqueado</span>
        <h1>O ambiente não deixou o recorder abrir a página.</h1>
        <p>${reasonText}</p>
        <p>Status retornado pelo alvo: <strong>${input.status}</strong></p>
        <p>Ambiente: <strong>${escapeHtml(input.environmentName)}</strong></p>
        <code>${escapeHtml(input.targetUrl)}</code>
        <ul>
          <li>Se esse ambiente usa Cloudflare, CAPTCHA ou proteção anti-bot, o modo gravar via proxy não consegue atravessar o bloqueio.</li>
          <li>Você pode testar com um ambiente sem proteção, normalmente local ou dev interno.</li>
          <li>Se precisar gravar exatamente esse ambiente, o próximo passo é fazer o recorder em sessão real de navegador via Playwright.</li>
        </ul>
      </div>
    </div>
    <script>
      window.parent?.postMessage(${payload}, window.location.origin);
    </script>
  </body>
</html>`;
}
function getBlockedReasonText(reason) {
    switch (reason) {
        case 'cloudflare':
            return 'O proxy encontrou um challenge do Cloudflare ou proteção anti-bot antes de chegar na aplicação.';
        case 'unauthorized':
            return 'A aplicação respondeu que este acesso precisa de autenticação antes de liberar a tela.';
        case 'forbidden':
            return 'A aplicação recusou a abertura da página pelo proxy com resposta 403.';
        default:
            return 'A aplicação retornou erro ao tentar abrir a página pelo proxy do recorder.';
    }
}
function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function getRecorderClientScript() {
    return `
(() => {
  if (window.__TEST_STUDIO_RECORDER_LOADED__) {
    return;
  }

  window.__TEST_STUDIO_RECORDER_LOADED__ = true;

  const config = window.__TEST_STUDIO_RECORDER__ ?? {};
  const proxyBase = config.proxyBase ?? '';
  const source = 'test-studio-recorder';
  let lastClick = null;
  let lastNavigation = '';

  const channel = window.parent !== window ? window.parent : window.opener;

  function send(event, payload) {
    if (!channel) {
      return;
    }

    channel.postMessage({ source, event, payload }, window.location.origin);
  }

  function normalizeCurrentPath() {
    const fullPath = window.location.pathname + window.location.search + window.location.hash;
    if (fullPath.startsWith(proxyBase)) {
      return fullPath.slice(proxyBase.length) || '/';
    }

    return fullPath || '/';
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }

    return String(value).replace(/["\\\\]/g, '\\\\$&');
  }

  function attrEscape(value) {
    return String(value).replace(/"/g, '&quot;');
  }

  function buildNthSelector(element) {
    const segments = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let segment = current.tagName.toLowerCase();

      if (current.id) {
        segment += '#' + cssEscape(current.id);
        segments.unshift(segment);
        break;
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(child => child.tagName === current.tagName);
        if (siblings.length > 1) {
          segment += ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')';
        }
      }

      segments.unshift(segment);
      current = parent;
    }

    return segments.join(' > ');
  }

  function buildSelector(target) {
    if (!(target instanceof Element)) {
      return '';
    }

    let current = target;
    while (current && current !== document.documentElement) {
      const testId = current.getAttribute('data-testid');
      if (testId) {
        return '[data-testid="' + attrEscape(testId) + '"]';
      }
      current = current.parentElement;
    }

    if (target.id) {
      return '#' + cssEscape(target.id);
    }

    const tag = target.tagName.toLowerCase();
    const name = target.getAttribute('name');
    if (name) {
      return tag + '[name="' + attrEscape(name) + '"]';
    }

    const ariaLabel = target.getAttribute('aria-label');
    if (ariaLabel) {
      return tag + '[aria-label="' + attrEscape(ariaLabel) + '"]';
    }

    return buildNthSelector(target);
  }

  function buildLabel(target) {
    if (!(target instanceof Element)) {
      return '';
    }

    const explicit = target.getAttribute('data-testid') || target.getAttribute('aria-label') || target.getAttribute('name');
    if (explicit) {
      return explicit;
    }

    const text = (target.textContent || '').trim().replace(/\\s+/g, ' ');
    return text.slice(0, 80);
  }

  function prefixUrl(value) {
    if (!value) {
      return value;
    }

    if (/^(data:|blob:|mailto:|tel:|javascript:)/i.test(value)) {
      return value;
    }

    try {
      const absolute = new URL(value, window.location.href);
      if (absolute.origin !== window.location.origin) {
        return value;
      }

      if (absolute.pathname.startsWith(proxyBase)) {
        return absolute.toString();
      }

      return window.location.origin + proxyBase + absolute.pathname + absolute.search + absolute.hash;
    } catch {
      return value;
    }
  }

  function patchNetwork() {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (typeof input === 'string') {
        return originalFetch(prefixUrl(input), init);
      }

      if (input instanceof URL) {
        return originalFetch(new URL(prefixUrl(input.toString())), init);
      }

      if (input instanceof Request) {
        return originalFetch(new Request(prefixUrl(input.url), input), init);
      }

      return originalFetch(input, init);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      return originalOpen.call(this, method, prefixUrl(url), async, user, password);
    };
  }

  function patchHistory() {
    const emitNavigation = () => {
      const currentPath = normalizeCurrentPath();
      if (currentPath === lastNavigation) {
        return;
      }

      lastNavigation = currentPath;
      send('navigation', { url: currentPath });
    };

    const originalPushState = history.pushState.bind(history);
    history.pushState = function(...args) {
      originalPushState(...args);
      window.setTimeout(emitNavigation, 0);
    };

    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = function(...args) {
      originalReplaceState(...args);
      window.setTimeout(emitNavigation, 0);
    };

    window.addEventListener('popstate', emitNavigation);
    window.addEventListener('hashchange', emitNavigation);
    emitNavigation();
  }

  function handleClick(event) {
    const element = event.target instanceof Element ? event.target.closest('a, button, [role="button"], [data-testid]') || event.target : null;
    if (!(element instanceof Element)) {
      return;
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      return;
    }

    const selector = buildSelector(element);
    if (!selector) {
      return;
    }

    const nextClick = { selector, timestamp: Date.now() };
    if (lastClick && lastClick.selector === nextClick.selector && nextClick.timestamp - lastClick.timestamp < 400) {
      return;
    }

    lastClick = nextClick;
    send('step', {
      stepType: 'click',
      selector,
      description: buildLabel(element),
    });
  }

  function handleChange(event) {
    const element = event.target;
    if (!(element instanceof Element)) {
      return;
    }

    const selector = buildSelector(element);
    if (!selector) {
      return;
    }

    if (element instanceof HTMLSelectElement) {
      send('step', {
        stepType: 'select',
        selector,
        value: element.value,
        description: buildLabel(element),
      });
      return;
    }

    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        send('step', {
          stepType: element.checked ? 'check' : 'click',
          selector,
          description: buildLabel(element),
        });
        return;
      }

      send('step', {
        stepType: 'fill',
        selector,
        value: element.value,
        description: buildLabel(element),
      });
      return;
    }

    if (element instanceof HTMLTextAreaElement) {
      send('step', {
        stepType: 'fill',
        selector,
        value: element.value,
        description: buildLabel(element),
      });
    }
  }

  patchNetwork();
  patchHistory();
  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);

  send('ready', {
    url: normalizeCurrentPath(),
    title: document.title,
  });
})();
`.trim();
}
//# sourceMappingURL=recorder.routes.js.map