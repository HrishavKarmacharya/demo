import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-full p-1 w-fit">
      <Button
        type="button"
        variant={value === "grid" ? "default" : "ghost"}
        size="icon-sm"
        className="rounded-full"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid size={15} />
      </Button>
      <Button
        type="button"
        variant={value === "list" ? "default" : "ghost"}
        size="icon-sm"
        className="rounded-full"
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <List size={15} />
      </Button>
    </div>
  );
}

export default ViewToggle;