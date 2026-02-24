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
from src.services.hybrid_content_splitter import HybridContentSplitter

logger = logging.getLogger(__name__)


class IndexingPipeline:
    def __init__(self, collection_name: str):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.embedding = LLMFactory.create_embedding("gemini")
        self.vector_store = QdrantVectorStore(
            client=self.client, collection_name=collection_name
        )
        self.collection_name = collection_name
        self.cache_file = os.path.join(settings.TEMP_DIR, "ingestion_cache.json")
        self.cache = IngestionCache.from_persist_path(
            self.cache_file, self.collection_name
        )

    def run(self, documents: List[Document]):
        try:
            pipeline = IngestionPipeline(
                transformations=[HybridContentSplitter(), self.embedding],
                vector_store=self.vector_store,
                cache=self.cache,
            )

            nodes = pipeline.run(documents=documents)

            try:
                self.cache.persist(self.cache_file)
            except Exception as e:
                logger.error(e)
                pass  # optional persistence, ignore errors

            return nodes
        except Exception as e:
            logger.exception("Indexing failed: %s", e)
            raise
