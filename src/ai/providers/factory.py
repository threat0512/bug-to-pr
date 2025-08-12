"""
LLM Provider Factory
"""
import os
from typing import Optional
from .base import LLMProvider
from .groq_provider import GroqProvider
from .hf_public_provider import HuggingFaceInferenceAPIProvider


class ProviderFactory:
    """Factory for creating LLM providers"""
    
    @staticmethod
    def create_provider(provider_name: Optional[str] = None) -> LLMProvider:
        """
        Create an LLM provider based on configuration
        
        Args:
            provider_name: Override the provider name from env
            
        Returns:
            LLMProvider instance
            
        Raises:
            ValueError: If provider is not supported or configuration is invalid
        """
        provider_name = provider_name or os.getenv("AI_PROVIDER", "groq")
        
        if provider_name == "groq":
            return GroqProvider()
        elif provider_name == "hf_inference_api" or provider_name == "hf_public" or provider_name == "hf_providers":
            # Support multiple names for backward compatibility
            return HuggingFaceInferenceAPIProvider()
        else:
            raise ValueError(f"Unsupported provider: {provider_name}. Supported: groq, hf_inference_api, hf_providers")
    
    @staticmethod
    def create_fallback_provider(primary_provider: str) -> Optional[LLMProvider]:
        """
        Create a fallback provider if primary fails
        
        Args:
            primary_provider: The primary provider that failed
            
        Returns:
            Fallback provider or None if no fallback available
        """
        # Define fallback chain
        fallback_map = {
            "hf_inference_api": "groq",
            "hf_public": "groq",  # Backward compatibility
            "groq": None,  # No fallback for Groq currently
        }
        
        fallback_name = fallback_map.get(primary_provider)
        if not fallback_name:
            return None
            
        try:
            return ProviderFactory.create_provider(fallback_name)
        except Exception as e:
            print(f"Failed to create fallback provider {fallback_name}: {str(e)}")
            return None


def get_provider() -> LLMProvider:
    """
    Convenience function to get the configured provider
    
    Returns:
        LLMProvider instance
    """
    return ProviderFactory.create_provider()


def generate_with_fallback(
    prompt: str, 
    max_tokens: Optional[int] = None, 
    temperature: Optional[float] = None,
    **kwargs
) -> str:
    """
    Generate text with automatic fallback to secondary provider
    
    Args:
        prompt: Input prompt
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        **kwargs: Additional parameters
        
    Returns:
        Generated text
        
    Raises:
        Exception: If both primary and fallback providers fail
    """
    primary_provider = get_provider()
    primary_name = primary_provider.get_provider_name()
    
    try:
        return primary_provider.generate(prompt, max_tokens, temperature, **kwargs)
    except Exception as primary_error:
        print(f"Primary provider {primary_name} failed: {str(primary_error)}")
        
        # Try fallback
        fallback_provider = ProviderFactory.create_fallback_provider(primary_name)
        if fallback_provider:
            try:
                print(f"Attempting fallback to {fallback_provider.get_provider_name()}")
                return fallback_provider.generate(prompt, max_tokens, temperature, **kwargs)
            except Exception as fallback_error:
                print(f"Fallback provider failed: {str(fallback_error)}")
                raise Exception(f"Both primary ({primary_error}) and fallback ({fallback_error}) providers failed")
        else:
            # No fallback available, re-raise original error
            raise primary_error