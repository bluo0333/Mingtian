interface LatticeFadeProps {
  dark?: boolean;
}

export default function LatticeFade({ dark = false }: LatticeFadeProps) {
  return (
    <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-[min(56%,340px)]">
      <div
        className="h-full w-full"
        style={{
          backgroundImage: dark
            ? `
              radial-gradient(circle at 24% 50%, rgba(212, 169, 90, 0.34) 0%, rgba(212, 169, 90, 0) 68%),
              linear-gradient(to left, rgba(212, 169, 90, 0.34), rgba(212, 169, 90, 0)),
              repeating-linear-gradient(
                to right,
                rgba(212, 169, 90, 0.14) 0px,
                rgba(212, 169, 90, 0.14) 2px,
                transparent 2px,
                transparent 18px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(212, 169, 90, 0.14) 0px,
                rgba(212, 169, 90, 0.14) 2px,
                transparent 2px,
                transparent 18px
              )
            `
            : `
              radial-gradient(circle at 24% 50%, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0) 68%),
              linear-gradient(to left, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0)),
              repeating-linear-gradient(
                to right,
                rgba(255, 255, 255, 0.16) 0px,
                rgba(255, 255, 255, 0.16) 2px,
                transparent 2px,
                transparent 18px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.16) 0px,
                rgba(255, 255, 255, 0.16) 2px,
                transparent 2px,
                transparent 18px
              )
            `,
          maskImage:
            'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 38%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 38%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0) 100%)',
        }}
      />
    </div>
  );
}
