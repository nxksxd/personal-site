import { useEffect, useState } from "react";

/**
 * Detects the visitor's country via free geo-IP (no API key).
 * Returns an ISO-3166 alpha-2 code (e.g. "FI") or null while loading / on failure.
 * Result is cached in sessionStorage so we hit the network only once per session.
 */
export function useVisitorCountry(): { code: string | null; name: string | null } {
  const [code, setCode] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Show the cached country immediately (avoids an empty flag / flicker
    //    on every reload). This is only the *initial* paint — we still verify
    //    against the network below, so a changed location is picked up.
    try {
      const cached = sessionStorage.getItem("visitor_country");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.code) {
          setCode(parsed.code);
          setName(parsed.name ?? null);
        }
      }
    } catch {
      // ignore cache errors
    }

    const cache = (c: string, n: string | null) => {
      try {
        sessionStorage.setItem(
          "visitor_country",
          JSON.stringify({ code: c, name: n })
        );
      } catch {
        // ignore
      }
    };

    const tryIpwho = async () => {
      const r = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(6000) });
      const d = await r.json();
      if (d && d.success !== false && d.country_code) {
        return { code: d.country_code as string, name: (d.country as string) ?? null };
      }
      throw new Error("ipwho.is: no country");
    };

    const tryIpapi = async () => {
      const r = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(6000) });
      const d = await r.json();
      if (d && d.country_code) {
        return { code: d.country_code as string, name: (d.country_name as string) ?? null };
      }
      throw new Error("ipapi.co: no country");
    };

    // 2. Always re-check the live location on every page load. If it differs
    //    from what we painted from cache, update the flag and rewrite cache.
    (async () => {
      for (const attempt of [tryIpwho, tryIpapi]) {
        try {
          const res = await attempt();
          if (cancelled) return;
          setCode((prev) => (prev === res.code ? prev : res.code));
          setName((prev) => (prev === res.name ? prev : res.name));
          cache(res.code, res.name);
          return;
        } catch {
          // try next provider
        }
      }
      // Both failed — keep whatever we showed from cache (or nothing).
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { code, name };
}

/**
 * Converts an ISO-3166 alpha-2 country code to its flag emoji
 * using Unicode regional indicator symbols. No image assets needed.
 */
export function countryCodeToFlag(code: string | null): string {
  if (!code || code.length !== 2 || !/^[a-zA-Z]{2}$/.test(code)) return "";
  const upper = code.toUpperCase();
  const codePoints = [...upper].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}
