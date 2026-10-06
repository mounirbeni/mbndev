// Which websites may run a given assistant's chat widget.
const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };

/** Soft check that the widget runs on one of the bot's domains (or on mbndev.ma for previews). */
function originAllowed(bot, origin) {
  const host = hostOf(origin) || String(origin || '').replace(/^www\./, '').toLowerCase();
  if (!host) return true; // opened directly — rate limits still apply
  if (host === 'mbndev.ma') return true; // owner preview in the dashboard
  if (!bot.allowedDomains.length) return true;
  return bot.allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
}

module.exports = { originAllowed, hostOf };
