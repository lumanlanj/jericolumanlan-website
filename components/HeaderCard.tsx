import Image from "next/image";

export default function HeaderCard() {
  return (
    <header className="mb-12">
      <Image
        src="/photo.jpg"
        alt="Jerico Lumanlan"
        width={310}
        height={413}
        priority
        className="w-full max-w-[310px] aspect-[3/4] object-cover object-top grayscale mb-9"
      />
      <p className="text-[16px] text-(--color-bio) max-w-[480px] leading-relaxed">
        <strong className="text-(--color-ink) font-semibold">Jerico Lumanlan</strong> is a product
        manager in climate tech. He writes about the craft, builds agents he actually uses, and
        treats this site as the working log.
      </p>
    </header>
  );
}
