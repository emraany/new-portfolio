export function ReelBumper({ from, to }: { from: number; to: number }) {
  return (
    <>
      <style>{`
        .reel-bumper {
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0.45;
          font-size: 10px;
          letter-spacing: 0.15em;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
          user-select: none;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .reel-bumper {
            gap: 0.5rem;
            font-size: 9px;
            letter-spacing: 0.1em;
          }
        }
      `}</style>
      <div className="reel-bumper">
        <span>·· TAIL OF REEL {String(from).padStart(2,'0')} ··</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>·· HEAD OF REEL {String(to).padStart(2,'0')} ··</span>
      </div>
    </>
  )
}
