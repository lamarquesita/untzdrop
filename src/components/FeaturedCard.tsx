export default function FeaturedCard() {
  return (
    <div className="lg:hidden mx-5 mb-7 rounded-2xl overflow-hidden bg-surface border border-surface-border">
      <div className="w-full h-[180px] bg-gradient-to-br from-[#2a2040] to-[#2A2A2A]" />
      <div className="p-4 flex justify-between items-end">
        <div>
          <div className="text-base font-bold mb-1">Experts Only: Miami Music Week</div>
          <div className="text-xs text-muted leading-relaxed">
            Tue, March 24 &middot; 11PM<br />Club Space
          </div>
          <div className="text-sm font-bold text-white mt-1">From $71</div>
        </div>
        <div className="text-[22px] text-muted">&#9825;</div>
      </div>
    </div>
  );
}
