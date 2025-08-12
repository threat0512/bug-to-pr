"""
HuggingFace Inference API Provider Implementation
"""
import os
import json
import time
import requests
from typing import Optional, Dict, Any
from .base import LLMProvider


class HuggingFaceInferenceAPIProvider(LLMProvider):
    """HuggingFace Inference API provider for hosted inference"""
    
    def __init__(
        self,
        model_id: Optional[str] = None,
        api_key: Optional[str] = None,
        max_new_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        timeout_ms: Optional[int] = None
    ):
        self.model_id = model_id or os.getenv("HF_MODEL_ID", "Qwen/Qwen3-4B-Instruct-2507")
        self.api_key = api_key or os.getenv("HF_API_KEY", "")
        self.max_new_tokens = max_new_tokens or int(os.getenv("HF_MAX_NEW_TOKENS", "512"))
        self.default_temperature = temperature or float(os.getenv("HF_TEMPERATURE", "0.7"))  # Qwen3 recommended
        self.timeout_ms = timeout_ms or int(os.getenv("HF_TIMEOUT_MS", "60000"))
        
        # Use the new Inference Providers router endpoint
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        
        # Prepare headers
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"
            print(f"🔑 Using HuggingFace API key for {self.model_id}")
        else:
            print(f"⚠️  No HF_API_KEY provided - using public inference (rate limited)")
        
        print(f"🤖 Using HuggingFace Inference Providers: {self.model_id}")
        print(f"🌐 Router URL: {self.api_url}")
        print(f"🔀 Auto-provider selection with fallback")
    
    def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None, 
        temperature: Optional[float] = None,
        **kwargs
    ) -> str:
        """Generate text using HuggingFace Inference Providers"""
        max_new_tokens = max_tokens or self.max_new_tokens
        temp = temperature if temperature is not None else self.default_temperature
        
        # Use OpenAI-compatible chat completion format
        payload = {
            "model": self.model_id,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a coding assistant. Always respond with valid JSON only. Keep code snippets short and focused."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "max_tokens": min(max_new_tokens, 800),  # Limit to prevent truncation
            "temperature": temp,
            "top_p": 0.8,  # Qwen3 recommended
            "stream": False
        }
        
        return self._make_request_with_retry(payload)
    
    def _is_supported_model(self) -> bool:
        """Check if model is supported by Inference Providers"""
        # The router automatically handles supported models
        return True
    
    def _make_request_with_retry(self, payload: Dict[str, Any], max_attempts: int = 3) -> str:
        """Make HTTP request with exponential backoff retry"""
        delay = 2.0
        last_exception = None
        
        for attempt in range(max_attempts):
            try:
                print(f"🌐 Making request to HuggingFace Inference Providers (attempt {attempt + 1}/{max_attempts})")
                
                response = requests.post(
                    self.api_url,
                    headers=self.headers,
                    data=json.dumps(payload),
                    timeout=self.timeout_ms / 1000
                )
                
                # Handle specific HTTP errors
                if response.status_code == 503:
                    # Model is loading, wait and retry
                    if attempt < max_attempts - 1:
                        print(f"🔄 Model loading, waiting {delay}s before retry...")
                        time.sleep(delay)
                        delay *= 2
                        continue
                elif response.status_code == 429:
                    # Rate limited
                    if attempt < max_attempts - 1:
                        print(f"⏱️  Rate limited, waiting {delay}s before retry...")
                        time.sleep(delay)
                        delay *= 1.5
                        continue
                
                response.raise_for_status()
                return self._parse_response(response.json())
                
            except requests.exceptions.HTTPError as e:
                last_exception = e
                status_code = e.response.status_code if e.response else 0
                
                # Retry on specific status codes
                if status_code in (429, 500, 502, 503, 504) and attempt < max_attempts - 1:
                    print(f"❌ HTTP {status_code} error, retrying in {delay}s...")
                    time.sleep(delay)
                    delay *= 2
                    continue
                else:
                    error_body = e.response.text if e.response else "Unknown error"
                    raise Exception(f"HuggingFace Inference Providers error {status_code}: {error_body}")
                    
            except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
                last_exception = e
                if attempt < max_attempts - 1:
                    print(f"🔄 Request error, retrying in {delay}s: {str(e)}")
                    time.sleep(delay)
                    delay *= 2
                    continue
                else:
                    raise Exception(f"Request failed after {max_attempts} attempts: {str(e)}")
        
        # If we get here, all attempts failed
        raise last_exception or Exception("All retry attempts failed")
    
    def _parse_response(self, data: Any) -> str:
        """Parse OpenAI-compatible response from Inference Providers"""
        try:
            # Handle OpenAI-compatible chat completion format
            if isinstance(data, dict):
                # Standard OpenAI response format
                if "choices" in data and data["choices"]:
                    choice = data["choices"][0]
                    if "message" in choice and "content" in choice["message"]:
                        return choice["message"]["content"].strip()
                
                # Handle error responses
                if "error" in data:
                    error_msg = data["error"]
                    if isinstance(error_msg, dict) and "message" in error_msg:
                        raise Exception(f"HuggingFace Inference Providers error: {error_msg['message']}")
                    else:
                        raise Exception(f"HuggingFace Inference Providers error: {error_msg}")
            
            # Fallback: return as string or JSON
            if isinstance(data, str):
                return data.strip()
            
            return json.dumps(data)
            
        except Exception as e:
            print(f"⚠️  Error parsing response: {str(e)}")
            print(f"📄 Raw response: {data}")
            # Return something rather than crash
            return str(data) if data else "Error: Empty response"
    
    def get_provider_name(self) -> str:
        return "hf_inference_providers"
    
    def get_model_info(self):
        return {
            "provider": "hf_inference_providers",
            "model": self.model_id,
            "router_url": self.api_url,
            "temperature": self.default_temperature,
            "max_new_tokens": self.max_new_tokens,
            "has_api_key": bool(self.api_key),
            "supports_auto_fallback": True
        }