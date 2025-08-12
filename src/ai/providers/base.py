"""
Base LLM Provider Interface
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None, 
        temperature: Optional[float] = None,
        **kwargs
    ) -> str:
        """
        Generate text completion from the LLM
        
        Args:
            prompt: Input prompt text
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0-1.0)
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Generated text response
            
        Raises:
            Exception: On generation failure
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return the name of the provider"""
        pass
    
    def get_model_info(self) -> Dict[str, Any]:
        """Return model information (optional override)"""
        return {
            "provider": self.get_provider_name(),
            "model": "unknown"
        }