import { metaLine, type Letter, type Mood } from "@/lib/letter"

export const PLAY_MS: Record<Mood, number> = {
  fest: 8600,
  tyst: 11200,
  grattis: 9800,
}

export function Sequence({ letter }: { letter: Letter }) {
  const meta = metaLine(letter)

  if (letter.mood === "tyst") {
    return (
      <div className="stage stage-tyst" aria-label={letter.title}>
        <div className="rule" />
        <p className="title">{letter.title}</p>
        <p className="sentence">{letter.sentence}</p>
        {meta ? <p className="meta">{meta}</p> : null}
      </div>
    )
  }

  if (letter.mood === "grattis") {
    return (
      <div className="stage stage-grattis" aria-label={letter.title}>
        <div className="sun" />
        <h1 className="title">{letter.title}</h1>
        <p className="sentence">{letter.sentence}</p>
        {meta ? <p className="meta">{meta}</p> : null}
      </div>
    )
  }

  return (
    <div className="stage stage-fest" aria-label={letter.title}>
      <div className="flash" />
      <div className="slash" />
      <div className="tick" />
      <div className="cut" />
      <h1 className="title">{letter.title}</h1>
      <p className="sentence">{letter.sentence}</p>
      {meta ? <p className="meta">{meta}</p> : null}
    </div>
  )
}
