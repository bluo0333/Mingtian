interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="text-xs font-medium uppercase tracking-wider text-jade-500 dark:text-charcoal-400 mb-3">
      {title}
    </div>
  );
}