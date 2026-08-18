/**
 * A template re-mounts on every navigation (unlike a layout), which makes it
 * the right place for a cross-page enter transition in the App Router.
 *
 * Enter-only by design: an exit animation would delay the new page behind an
 * animation of the old one, which is the wrong trade for a service where people
 * arrive with a task. The keyframe is disabled under prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
