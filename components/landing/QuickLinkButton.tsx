import { Icon } from "@/components/icons/Icon";

interface QuickLinkButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

export default function QuickLinkButton({
  label,
  icon,
  onClick,
}: QuickLinkButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300"
    >
      <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-1)] rounded-full group-hover:bg-[var(--bg-surface-3)] group-hover:border-[var(--border-interactive)] transition-all duration-300">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );
}
