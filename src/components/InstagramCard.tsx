export default function InstagramCard() {
  const gradients = [
    "from-[#3a2a5e] to-[#2a1a4e]",
    "from-[#4a3a2e] to-[#3a2a1e]",
    "from-[#2a3a4e] to-[#1a2a3e]",
    "from-[#FF6B42] to-[#E84D26]",
  ];

  return (
    <div className="bg-surface rounded-2xl p-7 flex gap-5 w-[480px] border border-surface-border">
      <div className="flex-1">
        <h3 className="text-2xl font-extrabold mb-3 leading-tight">Follow us on Instagram.</h3>
        <p className="text-xs text-muted leading-relaxed mb-4">
          Stay up to date on the hottest events and exclusive promotions.
        </p>
        <div className="text-[13px] text-text-faint">@untzdrop</div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 w-40">
        {gradients.map((g, i) => (
          <div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${g}`} />
        ))}
      </div>
    </div>
  );
}
