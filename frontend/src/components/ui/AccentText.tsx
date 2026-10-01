interface AccentTextProps {
  text: string;
  /** How many trailing words get the italic serif accent. */
  last?: number;
}

/** Renders a title with its last word(s) in the editorial serif accent. */
export default function AccentText({ text, last = 1 }: AccentTextProps) {
  const words = text.trim().split(/\s+/);
  const n = Math.min(Math.max(last, 0), words.length);
  const lead = words.slice(0, words.length - n).join(' ');
  const accent = words.slice(words.length - n).join(' ');
  return (
    <>
      {lead}
      {lead && accent ? ' ' : null}
      {accent && <span className="serif-accent silk-text pr-[0.06em]">{accent}</span>}
    </>
  );
}
