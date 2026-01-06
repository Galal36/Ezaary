"""
Serializers for search models
"""
from rest_framework import serializers
from .search_models import SearchKeyword, SearchAnalytics, ZeroResultSearch


class SearchKeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchKeyword
        fields = ['id', 'keyword', 'synonyms', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SearchAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchAnalytics
        fields = ['id', 'query', 'normalized_query', 'result_count', 'has_results', 
                  'ip_address', 'user_agent', 'created_at']
        read_only_fields = ['id', 'created_at']


class ZeroResultSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZeroResultSearch
        fields = ['id', 'query', 'normalized_query', 'count', 'last_searched', 'created_at']
        read_only_fields = ['id', 'created_at']

