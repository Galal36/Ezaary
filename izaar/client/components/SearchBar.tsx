import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Search, X, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { normalizeImageUrl } from "@/lib/data-mappers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  name_ar: string;
  slug: string;
  price: number;
  final_price: number;
  discount_percentage: number;
  primary_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  similarity: number;
  score: number;
}

interface SearchResponse {
  results: SearchResult[];
  count: number;
  suggestions: string[];
  did_you_mean: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setSuggestions([]);
      setDidYouMean(null);
      setIsOpen(false);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/search/search/?q=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // Log response for debugging
      console.log("Search response status:", response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: await response.text() };
        }
        console.error("Search API error:", response.status, errorData);
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      const data: SearchResponse = await response.json();
      
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
      setDidYouMean(data.did_you_mean);
      setIsOpen(data.results && data.results.length > 0);
      setShowSuggestions(data.suggestions && data.suggestions.length > 0 && data.results.length === 0);
    } catch (error: any) {
      console.error("Search error:", error);
      setResults([]);
      setSuggestions([]);
      // Show error message to user
      if (error.message && !error.message.includes('HTTP')) {
        toast.error(error.message || "فشل البحث");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const totalItems = results.length + (showSuggestions ? suggestions.length : 0);
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleResultClick(results[selectedIndex].slug);
      } else if (selectedIndex >= results.length && suggestions.length > 0) {
        const suggestionIndex = selectedIndex - results.length;
        setQuery(suggestions[suggestionIndex]);
        performSearch(suggestions[suggestionIndex]);
      } else if (query) {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };
  
  const handleResultClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };
  
  const handleSearchSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };
  
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const index = normalizedText.indexOf(normalizedQuery);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return (
      <>
        {before}
        <mark className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{match}</mark>
        {after}
      </>
    );
  };
  
  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || suggestions.length > 0) {
              setIsOpen(results.length > 0);
              setShowSuggestions(suggestions.length > 0 && results.length === 0);
            }
          }}
          placeholder="ابحث عن المنتجات..."
          className="w-full px-4 py-2 pr-10 pl-10 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {isLoading && (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary rounded"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {(isOpen || showSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Did You Mean */}
          {didYouMean && results.length === 0 && (
            <div className="p-3 border-b border-border bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-2">هل تقصد:</p>
              <button
                onClick={() => {
                  setQuery(didYouMean);
                  performSearch(didYouMean);
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                {didYouMean}
              </button>
            </div>
          )}
          
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2 px-2">اقتراحات:</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                  }}
                  className={cn(
                    "w-full text-right px-3 py-2 rounded hover:bg-secondary transition-colors text-sm",
                    selectedIndex === results.length + index && "bg-secondary"
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {/* Results */}
          {isOpen && results.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2 px-2">
                {results.length} نتيجة
              </p>
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  to={`/product/${result.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded hover:bg-secondary transition-colors",
                    selectedIndex === index && "bg-secondary"
                  )}
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-secondary">
                    {result.primary_image ? (
                      <img
                        src={normalizeImageUrl(result.primary_image)}
                        alt={result.name_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        صورة
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {highlightMatch(result.name_ar, query)}
                    </p>
                    {result.category_name && (
                      <p className="text-xs text-muted-foreground">{result.category_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-primary text-sm">
                        {result.final_price.toLocaleString("ar-EG")} جنيه
                      </span>
                      {result.discount_percentage > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          {result.price.toLocaleString("ar-EG")} جنيه
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* View All Results */}
              {results.length >= 10 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full mt-2 p-2 text-center text-sm text-primary hover:bg-secondary rounded font-medium"
                >
                  عرض جميع النتائج
                </button>
              )}
            </div>
          )}
          
          {/* No Results */}
          {!isOpen && !showSuggestions && query.length >= 2 && !isLoading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
}

