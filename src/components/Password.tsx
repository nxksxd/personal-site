import { useState, useCallback } from "react";
import "./Password.css";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";

type Options = {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
};

function randomIndex(max: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    let value = 0;
    do {
      crypto.getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function buildAlphabet(opts: Options): string {
  let alphabet = "";
  if (opts.upper) alphabet += UPPER;
  if (opts.lower) alphabet += LOWER;
  if (opts.digits) alphabet += DIGITS;
  if (opts.symbols) alphabet += SYMBOLS;
  return alphabet;
}

function generatePassword(opts: Options): string {
  const alphabet = buildAlphabet(opts);
  const pools: string[] = [];
  if (opts.upper) pools.push(UPPER);
  if (opts.lower) pools.push(LOWER);
  if (opts.digits) pools.push(DIGITS);
  if (opts.symbols) pools.push(SYMBOLS);

  const chars: string[] = [];
  for (const pool of pools) {
    chars.push(pool[randomIndex(pool.length)]);
  }
  while (chars.length < opts.length) {
    chars.push(alphabet[randomIndex(alphabet.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.slice(0, opts.length).join("");
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const anySelected = upper || lower || digits || symbols;

  const handleGenerate = useCallback(() => {
    if (!anySelected) {
      setError("Выберите хотя бы один набор символов");
      setPasswords([]);
      return;
    }
    setError(null);
    setCopiedIndex(null);
    const opts: Options = { length, upper, lower, digits, symbols };
    setPasswords(Array.from({ length: Math.min(Math.max(count, 1), 50) }, () => generatePassword(opts)));
  }, [length, count, upper, lower, digits, symbols, anySelected]);

  const copy = async (value: string, index: number) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
    } catch {
      setError("Не удалось скопировать пароль");
    }
  };

  return (
    <section className="password">
      <div className="password__inner">
        <a href="/" className="password__back">&larr; На главную</a>
        <h1 className="password__title">Paswrd</h1>
        <p className="password__subtitle">
          Генератор безопасных паролей. Всё считается локально в браузере, пароли никуда не отправляются.
        </p>

        <div className="password__panel">
          <div className="password__row">
            <label className="password__label">
              Длина пароля: <strong>{length}</strong>
            </label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="password__range"
            />
            <input
              type="number"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Math.min(64, Math.max(4, Number(e.target.value) || 4)))}
              className="password__number"
            />
          </div>

          <div className="password__row">
            <label className="password__label">
              Количество паролей: <strong>{count}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="password__range"
            />
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              className="password__number"
            />
          </div>

          <div className="password__checks">
            <label className="password__check">
              <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
              Заглавные буквы (A–Z)
            </label>
            <label className="password__check">
              <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />
              Строчные буквы (a–z)
            </label>
            <label className="password__check">
              <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} />
              Цифры (0–9)
            </label>
            <label className="password__check">
              <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
              Символы (!@#$…)
            </label>
          </div>

          <button className="password__btn password__btn--primary" onClick={handleGenerate}>
            Сгенерировать
          </button>

          {error && <div className="password__error">{error}</div>}

          {passwords.length > 0 && (
            <ul className="password__list">
              {passwords.map((pw, i) => (
                <li key={`${pw}-${i}`} className="password__item">
                  <button
                    type="button"
                    className={`password__value${copiedIndex === i ? " password__value--copied" : ""}`}
                    onClick={() => copy(pw, i)}
                    title="Нажмите, чтобы скопировать"
                  >
                    {pw}
                  </button>
                  <button
                    type="button"
                    className={`password__btn password__btn--copy${copiedIndex === i ? " password__btn--copied" : ""}`}
                    onClick={() => copy(pw, i)}
                  >
                    {copiedIndex === i ? "Скопировано" : "Копировать"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="password__info">
          <h2 className="password__info-title">Рекомендации по паролям</h2>
          <p>
            Генератор безопасных паролей. Всё считается локально в браузере, пароли никуда не отправляются.
          </p>
          <ul className="password__tips">
            <li>Пароли создаются с помощью криптографического генератора случайных чисел браузера — угадать или подобрать такой пароль практически невозможно.</li>
            <li>Рекомендуемая длина — не менее 12 символов, а для важных аккаунтов (почта, банк, госуслуги) — 16 и больше, с разными типами знаков: заглавные и строчные буквы, цифры, символы.</li>
            <li>Никогда и никому не сообщайте свои пароли. Банки, поддержка, «служба безопасности» и любые сервисы никогда не спрашивают пароль — если его просят в чате, письме или по телефону, это мошенники.</li>
            <li>Не пересылайте пароли в мессенджерах, письмах и заметках без защиты. Для передачи используйте одноразовые сервисы или защищённый менеджер паролей.</li>
            <li>Никогда не используйте один пароль на нескольких сайтах: утечка на одном сервисе откроет злоумышленникам доступ ко всем остальным аккаунтам.</li>
            <li>Храните пароли в менеджере паролей или записывайте в надёжном месте, но не в переписке, не в облачных заметках и не в файле на рабочем столе.</li>
            <li>Меняйте пароль сразу же, если сервис сообщил об утечке, если вы входили с чужого устройства или если есть подозрение, что пароль мог стать известен.</li>
            <li>Для важных аккаунтов включайте двухфакторную аутентификацию — это защитит даже при утечке пароля.</li>
            <li>Пароль лучше менять не «каждые 30 дней» автоматически, а при реальной необходимости: утечка, подозрительная активность, смена устройства. Слишком частая смена заставляет придумывать слабые и похожие пароли.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PasswordGenerator;
