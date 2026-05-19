interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="text-sm font-semibold uppercase tracking-[0.13em] text-jade-600/90 dark:text-dark-300 mb-3">
      {title}
    </div>
  );
}
