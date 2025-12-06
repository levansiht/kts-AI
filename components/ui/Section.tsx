interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-[var(--shadow-color)] p-6 rounded-xl">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
