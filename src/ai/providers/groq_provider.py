"""
Groq LLM Provider Implementation
"""
import os
from typing import Optional
from langchain_groq.chat_models import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from .base import LLMProvider


class GroqProvider(LLMProvider):
    """Groq provider using LangChain integration"""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None
    ):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model or os.getenv("GROQ_MODEL", "deepseek-r1-distill-llama-70b")
        self.default_temperature = temperature or float(os.getenv("GROQ_TEMPERATURE", "0.3"))
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required for Groq provider")
            
        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model=self.model,
            temperature=self.default_temperature,
        )
    
    def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None, 
        temperature: Optional[float] = None,
        **kwargs
    ) -> str:
        """Generate text using Groq LLM"""
        # Create a simple prompt template for raw string input
        template = ChatPromptTemplate.from_messages([
            ("human", "{prompt}")
        ])
        
        # Configure temperature if provided
        if temperature is not None:
            # Create a new LLM instance with updated temperature
            llm = ChatGroq(
                groq_api_key=self.api_key,
                model=self.model,
                temperature=temperature,
            )
        else:
            llm = self.llm
        
        # Generate response
        chain = template | llm
        response = chain.invoke({"prompt": prompt})
        
        return response.content.strip()
    
    def get_provider_name(self) -> str:
        return "groq"
    
    def get_model_info(self):
        return {
            "provider": "groq",
            "model": self.model,
            "temperature": self.default_temperature
        }