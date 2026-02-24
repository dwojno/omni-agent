"""Unit tests for IndexingPipeline (mocked Qdrant and embedding)."""

from unittest.mock import MagicMock, patch

import pytest
from llama_index.core.schema import Document

from src.pipelines.indexing_pipeline import IndexingPipeline


class TestIndexingPipeline:
    @pytest.fixture
    def mock_client(self):
        return MagicMock()

    @pytest.fixture
    def mock_embedding(self):
        return MagicMock()

    @pytest.fixture
    def mock_cache(self):
        return MagicMock()

    @pytest.fixture
    def pipeline(self, mock_client, mock_embedding, mock_cache, temp_dir):
        with patch(
            "src.pipelines.indexing_pipeline.QdrantClient",
            return_value=mock_client,
        ), patch(
            "src.pipelines.indexing_pipeline.LLMFactory.create_embedding",
            return_value=mock_embedding,
        ), patch(
            "src.pipelines.indexing_pipeline.settings",
        ) as mock_settings, patch(
            "src.pipelines.indexing_pipeline.IngestionCache.from_persist_path",
            return_value=mock_cache,
        ):
            mock_settings.TEMP_DIR = temp_dir
            mock_settings.QDRANT_HOST = "localhost"
            mock_settings.QDRANT_PORT = 6333
            return IndexingPipeline(collection_name="test_coll")

    def test_run_calls_ingestion_pipeline_with_documents(
        self, pipeline, sample_documents
    ):
        with patch(
            "src.pipelines.indexing_pipeline.IngestionPipeline",
        ) as mock_ingestion_cls:
            mock_ingestion = MagicMock()
            mock_ingestion.run.return_value = []
            mock_ingestion_cls.return_value = mock_ingestion

            result = pipeline.run(sample_documents)

            mock_ingestion.run.assert_called_once()
            call_kw = mock_ingestion.run.call_args[1]
            assert call_kw["documents"] == sample_documents
            assert result == []

    def test_run_swallows_cache_persist_error(
        self, pipeline, sample_documents
    ):
        """Cache.persist() failure is logged but does not raise."""
        with patch(
            "src.pipelines.indexing_pipeline.IngestionPipeline",
        ) as mock_ingestion_cls:
            mock_ingestion = MagicMock()
            returned_nodes = [MagicMock()]
            mock_ingestion.run.return_value = returned_nodes
            mock_ingestion_cls.return_value = mock_ingestion
            pipeline.cache.persist.side_effect = OSError("disk full")

            result = pipeline.run(sample_documents)

            assert result == returned_nodes

    def test_run_reraises_on_ingestion_failure(
        self, pipeline, sample_documents
    ):
        """When IngestionPipeline.run raises, the exception propagates."""
        with patch(
            "src.pipelines.indexing_pipeline.IngestionPipeline",
        ) as mock_ingestion_cls:
            mock_ingestion = MagicMock()
            mock_ingestion.run.side_effect = RuntimeError("Qdrant down")
            mock_ingestion_cls.return_value = mock_ingestion

            with pytest.raises(RuntimeError, match="Qdrant down"):
                pipeline.run(sample_documents)
