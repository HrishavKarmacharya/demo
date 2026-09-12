import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterDropdownProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ categories, value, onChange }: FilterDropdownProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue);
      }}
    >
      <SelectTrigger className="w-48 capitalize">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent className="capitalize">
  <SelectItem value="all">All categories</SelectItem>
  {categories.map((category) => (
    <SelectItem key={category} value={category}>
      {category}
    </SelectItem>
  ))}
</SelectContent>
    </Select>
  );
}

export default FilterDropdown;