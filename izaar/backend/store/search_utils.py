"""
Arabic text normalization and fuzzy search utilities
"""
import re
from typing import List, Tuple
from difflib import SequenceMatcher


def normalize_arabic_text(text: str) -> str:
    """
    Normalize Arabic text for search:
    - Normalize ا / أ / إ / آ to ا
    - Normalize ي / ى to ي
    - Normalize ة / ه to ه
    - Remove tashkeel (diacritics)
    - Remove tatweel (ـ)
    - Remove extra spaces
    """
    if not text:
        return ""
    
    # Convert to string and strip
    text = str(text).strip()
    
    # Normalize Alef variations: ا / أ / إ / آ → ا
    text = re.sub(r'[أإآ]', 'ا', text)
    
    # Normalize Yeh variations: ي / ى → ي
    text = re.sub(r'[ى]', 'ي', text)
    
    # Normalize Teh Marbuta: ة → ه
    text = re.sub(r'[ة]', 'ه', text)
    
    # Remove tashkeel (diacritics): َ ً ُ ٌ ِ ٍ ْ
    text = re.sub(r'[\u064B-\u0652\u0670]', '', text)
    
    # Remove tatweel (ـ)
    text = re.sub(r'[ـ]', '', text)
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip().lower()


def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity ratio between two texts (0-1)"""
    norm1 = normalize_arabic_text(text1)
    norm2 = normalize_arabic_text(text2)
    return SequenceMatcher(None, norm1, norm2).ratio()


def fuzzy_match(query: str, text: str, threshold: float = 0.3) -> Tuple[bool, float]:
    """
    Check if query matches text with fuzzy matching
    Returns: (is_match, similarity_score)
    """
    if not query or not text:
        return (False, 0.0)
    
    norm_query = normalize_arabic_text(query)
    norm_text = normalize_arabic_text(text)
    
    # Exact match
    if norm_query in norm_text:
        return (True, 1.0)
    
    # Word-by-word matching
    query_words = norm_query.split()
    text_words = norm_text.split()
    
    if not query_words:
        return (False, 0.0)
    
    # Check if all query words appear in text (partial match)
    matched_words = 0
    total_similarity = 0.0
    
    for q_word in query_words:
        best_match = 0.0
        for t_word in text_words:
            similarity = SequenceMatcher(None, q_word, t_word).ratio()
            if similarity > best_match:
                best_match = similarity
        
        if best_match >= threshold:
            matched_words += 1
            total_similarity += best_match
    
    if matched_words == 0:
        return (False, 0.0)
    
    # Calculate overall similarity
    word_similarity = total_similarity / len(query_words)
    
    # Also check full text similarity
    full_similarity = SequenceMatcher(None, norm_query, norm_text).ratio()
    
    # Use the better of the two
    final_similarity = max(word_similarity, full_similarity)
    
    return (final_similarity >= threshold, final_similarity)


def extract_search_terms(query: str) -> List[str]:
    """Extract search terms from query, handling Arabic text"""
    if not query:
        return []
    
    normalized = normalize_arabic_text(query)
    # Split by spaces and filter empty
    terms = [term for term in normalized.split() if term]
    return terms


def highlight_matches(text: str, query: str) -> str:
    """
    Highlight matching words in text (for display purposes)
    Returns HTML with <mark> tags around matches
    """
    if not query or not text:
        return text
    
    norm_query = normalize_arabic_text(query)
    norm_text = normalize_arabic_text(text)
    query_words = norm_query.split()
    
    # Find positions of matches
    result = text
    for q_word in query_words:
        # Find all occurrences (case-insensitive, normalized)
        pattern = re.compile(re.escape(q_word), re.IGNORECASE)
        # This is a simplified version - in production, you'd want more sophisticated matching
        result = pattern.sub(lambda m: f'<mark>{m.group()}</mark>', result)
    
    return result

