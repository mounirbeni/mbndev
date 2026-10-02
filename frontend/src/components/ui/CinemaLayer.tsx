/**
 * Cinema finish for the public site: a fixed film-grain layer over
 * everything (pointer-events: none; hidden under reduced motion by CSS).
 */
export default function CinemaLayer() {
  return <div aria-hidden className="cinema-grain" />;
}
