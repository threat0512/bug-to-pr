"""
OpenAI LLM Provider Implementation
"""
import os
from typing import Optional
from openai import OpenAI
from .base import LLMProvider


class OpenAIProvider(LLMProvider):
    """OpenAI provider using OpenAI Python client"""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None
    ):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.default_temperature = temperature or float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI provider")
            
        self.client = OpenAI(api_key=self.api_key)
    
    def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None, 
        temperature: Optional[float] = None,
        **kwargs
    ) -> str:
        """Generate text using OpenAI LLM"""
        # Use provided temperature or default
        temp = temperature if temperature is not None else self.default_temperature
        

        api_params = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temp,
            **kwargs
        }

        if max_tokens is not None:
            api_params["max_tokens"] = max_tokens
        
        try:
            response = self.client.chat.completions.create(**api_params)
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"OpenAI API call failed: {str(e)}")
    
    def get_provider_name(self) -> str:
        return "openai"
    
    def get_model_info(self):
        return {
            "provider": "openai",
            "model": self.model,
            "temperature": self.default_temperature
        }
