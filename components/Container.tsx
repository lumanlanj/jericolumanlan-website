// Centered content column for the standalone routes (yurikim-style). The
// homepage composes its own sections, so it doesn't use this.
export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[var(--content-max)] px-6 pt-28 pb-24">
      {children}
    </main>
  );
}
