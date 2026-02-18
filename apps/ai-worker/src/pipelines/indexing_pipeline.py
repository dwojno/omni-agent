from typing import List

from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.schema import Document
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from src.model.factory import LLMFactory
from src.parsing.hybrid_content_splitter import HybridContentSplitter


class IndexingPipeline:
    def __init__(self, collection_name: str):
        self.client = QdrantClient()
        self.embedding = LLMFactory.create_embedding("gemini")
        self.vector_store = QdrantVectorStore(
            client=self.client, collection_name=collection_name
        )

    def run(self, documents: List[Document]):
        pipeline = IngestionPipeline(
            transformations=[HybridContentSplitter(), self.embedding],
            vector_store=self.vector_store,
            cache="./cache/ingestion_cache",
        )

        nodes = pipeline.run(documents)

        return nodes
