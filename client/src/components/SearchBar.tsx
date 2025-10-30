import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string, country: string) => void;
  placeholder?: string;
}

const countries = [
  { code: 'ALL', name: 'All Countries' },
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

export function SearchBar({ onSearch, placeholder = "Search books..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('ALL');

  const handleSearch = () => {
    onSearch(query, country);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
          data-testid="input-search-global"
        />
      </div>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger className="w-48" data-testid="select-search-country">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} data-testid="button-search">
        Search
      </Button>
    </div>
  );
}
