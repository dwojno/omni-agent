import logging
import os
from typing import List

from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.ingestion.cache import IngestionCache
from llama_index.core.schema import Document
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from src.core.config import settings
from src.model.factory import LLMFactory
from src.parsing.hybrid_content_splitter import HybridContentSplitter

logger = logging.getLogger(__name__)


class IndexingPipeline:
    def __init__(self, collection_name: str):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.embedding = LLMFactory.create_embedding("gemini")
        self.vector_store = QdrantVectorStore(
            client=self.client, collection_name=collection_name
        )

    def run(self, documents: List[Document]):
        try:
            cache_dir = "./cache/ingestion_cache"
            try:
                cache = IngestionCache.from_persist_path(cache_dir)
            except (FileNotFoundError, OSError):
                os.makedirs(cache_dir, exist_ok=True)
                cache = IngestionCache()

            pipeline = IngestionPipeline(
                transformations=[HybridContentSplitter(), self.embedding],
                vector_store=self.vector_store,
                cache=cache,
            )

            nodes = pipeline.run(documents)

            try:
                cache.persist(cache_dir)
            except Exception:
                pass  # optional persistence, ignore errors

            return nodes
        except Exception as e:
            logger.exception("Indexing failed: %s", e)
            raise
