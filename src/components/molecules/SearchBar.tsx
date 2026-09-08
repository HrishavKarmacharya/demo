import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void; //statebar receives value as prop
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:max-w-sm"
    />
  );
}

export default SearchBar;

// search box triggers refilter and re-render for large amt useMemo() more viable