import express, { Router, Request, Response, NextFunction } from 'express'
import { EnvironmentService } from '../services/environment.service.js'

const envService = new EnvironmentService()
const proxyBodyParser = express.raw({ type: '*/*', limit: '10mb' })

export const recorderRouter = Router()

recorderRouter.get('/client.js', (_req: Request, res: Response) => {
  res.type('application/javascript')
  res.setHeader('Cache-Control', 'no-store')
  res.send(getRecorderClientScript())
})

recorderRouter.all('/proxy/:environmentId', proxyBodyParser, proxyRecorderRequest)
recorderRouter.all('/proxy/:environmentId/*', proxyBodyParser, proxyRecorderRequest)

async function proxyRecorderRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const environment = await envService.findById(req.params.environmentId)

    if (!environment) {
      res.status(404).json({ error: 'Ambiente não encontrado' })
      return
    }

    const proxyBase = getProxyBase(req.params.environmentId)
    const upstreamUrl = buildUpstreamUrl(environment.baseURL, req)
    const requestBody = getRequestBody(req)
    const requestInit: RequestInit = {
      method: req.method,
      headers: buildUpstreamHeaders(req, normalizeStringRecord(environment.headers), upstreamUrl),
      redirect: 'manual',
    }

    if (requestBody) {
      requestInit.body = requestBody as unknown as RequestInit['body']
    }

    const upstreamResponse = await fetch(upstreamUrl, requestInit)

    applyProxyResponseHeaders(res, upstreamResponse.headers, proxyBase, environment.baseURL)

    const contentType = upstreamResponse.headers.get('content-type') ?? ''

    if (contentType.includes('text/html')) {
      const html = await upstreamResponse.text()
      res.status(upstreamResponse.status).send(injectRecorderIntoHtml(rewriteHtmlContent(html, proxyBase), proxyBase))
      return
    }

    const body = Buffer.from(await upstreamResponse.arrayBuffer())
    res.status(upstreamResponse.status).send(body)
  } catch (error) {
    next(error)
  }
}

function getProxyBase(environmentId: string): string {
  return `/api/recorder/proxy/${environmentId}`
}

function buildUpstreamUrl(baseURL: string, req: Request): string {
  const rawPath = req.params[0] ? `/${req.params[0]}` : '/'
  const queryIndex = req.originalUrl.indexOf('?')
  const rawQuery = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : ''

  return new URL(`${rawPath}${rawQuery}`, baseURL).toString()
}

function getRequestBody(req: Request): Uint8Array | undefined {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined
  }

  return Buffer.isBuffer(req.body) && req.body.length > 0 ? new Uint8Array(req.body) : undefined
}

function buildUpstreamHeaders(
  req: Request,
  environmentHeaders: Record<string, string>,
  upstreamUrl: string
): Headers {
  const headers = new Headers()
  const blockedHeaders = new Set([
    'accept-encoding',
    'connection',
    'content-length',
    'host',
    'origin',
    'referer',
  ])

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || blockedHeaders.has(key.toLowerCase())) {
      continue
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(', '))
      continue
    }

    headers.set(key, value)
  }

  for (const [key, value] of Object.entries(environmentHeaders)) {
    headers.set(key, value)
  }

  const upstream = new URL(upstreamUrl)
  headers.set('origin', upstream.origin)
  headers.set('referer', upstream.toString())

  return headers
}

function normalizeStringRecord(value: unknown): Record<string, string> {
  if (!value) {
    return {}
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string')
    )
  }

  if (typeof value === 'object') {
    const plainValue = 'toJSON' in value && typeof value.toJSON === 'function'
      ? value.toJSON()
      : value

    const entries = Object.entries(plainValue).filter(
      (entry): entry is [string, string] => !entry[0].startsWith('$') && typeof entry[1] === 'string'
    )

    return Object.fromEntries(entries)
  }

  return {}
}

function applyProxyResponseHeaders(
  res: Response,
  upstreamHeaders: Headers,
  proxyBase: string,
  targetBaseURL: string
) {
  const ignoredHeaders = new Set([
    'content-encoding',
    'content-length',
    'content-security-policy',
    'cross-origin-embedder-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'transfer-encoding',
    'x-frame-options',
  ])

  for (const [key, value] of upstreamHeaders.entries()) {
    if (ignoredHeaders.has(key.toLowerCase()) || key.toLowerCase() === 'set-cookie' || key.toLowerCase() === 'location') {
      continue
    }

    res.setHeader(key, value)
  }

  const location = upstreamHeaders.get('location')
  if (location) {
    res.setHeader('location', rewriteUpstreamUrl(location, proxyBase, targetBaseURL))
  }

  const setCookie = getSetCookieHeaders(upstreamHeaders)
  if (setCookie.length > 0) {
    res.setHeader('set-cookie', setCookie.map(cookie => rewriteSetCookie(cookie, proxyBase)))
  }
}

function getSetCookieHeaders(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof withGetSetCookie.getSetCookie === 'function') {
    return withGetSetCookie.getSetCookie()
  }

  const combined = headers.get('set-cookie')
  return combined ? [combined] : []
}

function rewriteSetCookie(cookie: string, proxyBase: string): string {
  const withoutDomain = cookie.replace(/;\s*Domain=[^;]+/gi, '')
  const pathValue = `${proxyBase}/`

  if (/;\s*Path=/i.test(withoutDomain)) {
    return withoutDomain.replace(/;\s*Path=[^;]*/i, `; Path=${pathValue}`)
  }

  return `${withoutDomain}; Path=${pathValue}`
}

function rewriteUpstreamUrl(location: string, proxyBase: string, targetBaseURL: string): string {
  if (location.startsWith('/')) {
    return `${proxyBase}${location}`
  }

  try {
    const targetBase = new URL(targetBaseURL)
    const parsed = new URL(location)

    if (parsed.origin === targetBase.origin) {
      return `${proxyBase}${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {
    return location
  }

  return location
}

function rewriteHtmlContent(html: string, proxyBase: string): string {
  return html
    .replace(/(href|src|action)=("|')\/(?!\/)/gi, `$1=$2${proxyBase}/`)
    .replace(/url\((["'])?\/(?!\/)/gi, `url($1${proxyBase}/`)
}

function injectRecorderIntoHtml(html: string, proxyBase: string): string {
  const bootstrap = [
    '<script>',
    `window.__TEST_STUDIO_RECORDER__ = ${JSON.stringify({ proxyBase })};`,
    '</script>',
    '<script src="/api/recorder/client.js"></script>',
  ].join('')

  if (html.includes('</head>')) {
    return html.replace('</head>', `${bootstrap}</head>`)
  }

  if (html.includes('</body>')) {
    return html.replace('</body>', `${bootstrap}</body>`)
  }

  return `${bootstrap}${html}`
}

function getRecorderClientScript(): string {
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
`.trim()
}
