import DribbbleCard from "@/components/DribbbleCard";
import type { Shot } from "@/lib/dribbble";

// Responsive masonry-ish grid of Dribbble shots.
// 1 col on phones, 2 on iPad, 3 on desktop.
export default function DribbbleGallery({ shots }: { shots: Shot[] }) {
  if (shots.length === 0) {
    return <p className="text-(--color-muted)">No design work available right now.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {shots.map((shot) => (
        <DribbbleCard key={shot.id} shot={shot} />
      ))}
    </div>
  );
}
