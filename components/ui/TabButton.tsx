import { Icon } from "@/components/icons/Icon";

interface TabButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TabButton({
  label,
  icon,
  isActive,
  onClick,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
        isActive
          ? "border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--bg-surface-1)]"
          : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)]"
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
      {label}
    </button>
  );
}
