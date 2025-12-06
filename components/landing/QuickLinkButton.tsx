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
      className="group flex flex-col items-center gap-1.5 text-(--text-secondary) hover:text-(--text-primary) transition-colors duration-300"
    >
      <div className="p-3 bg-(--bg-surface-2) border border-(--border-1) rounded-full group-hover:bg-(--bg-surface-3) group-hover:border-(--border-interactive) transition-all duration-300">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );
}
