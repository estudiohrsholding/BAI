"""
Services Package

This package contains all business logic services.
Services are injectable and can be used by API routes or other services.
"""

# Import services lazily to avoid circular dependencies
__all__ = ["AIService", "get_ai_service"]
