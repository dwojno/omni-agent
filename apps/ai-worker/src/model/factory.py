from functools import lru_cache
from typing import Literal

from llama_index.core.embeddings import BaseEmbedding
from llama_index.core.llms import LLM
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.llms.openai import OpenAI

from src.core.config import settings

ModelProvider = Literal["openai", "gemini"] | str
EmbeddingProvider = Literal["openai", "gemini", "local"] | str


class LLMFactory:
    @lru_cache(maxsize=1)
    @staticmethod
    def create_llm(provider: ModelProvider = "gemini", temperature: float = 0) -> LLM:
        if provider == "gemini":
            return Gemini(
                model="models/gemini-1.5-pro",
                temperature=temperature,
                api_key=settings.GOOGLE_API_KEY.get_secret_value(),
                safety_settings=[
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE",
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE",
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE",
                    },
                ],
            )
        elif provider == "openai":
            return OpenAI(
                model="gpt-4o",
                temperature=temperature,
                api_key=settings.OPENAI_API_KEY.get_secret_value(),
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")

    @lru_cache(maxsize=1)
    @staticmethod
    def create_embedding(provider: ModelProvider = "gemini") -> BaseEmbedding:
        if provider == "gemini":
            return GeminiEmbedding(
                model_name="models/text-embedding-004",
                api_key=settings.GOOGLE_API_KEY.get_secret_value(),
            )
        elif provider == "openai":
            return OpenAIEmbedding(
                model="text-embedding-3-small",
                api_key=settings.OPENAI_API_KEY.get_secret_value(),
            )
        elif provider == "local":
            return HuggingFaceEmbedding(
                model_name="BAAI/bge-m3",
                device="cpu",
                trust_remote_code=True,
            )
        else:
            raise ValueError(f"Unknown provider: {provider}")
