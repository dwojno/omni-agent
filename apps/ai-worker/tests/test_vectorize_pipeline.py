"""Unit tests for VectorizeFilePipeline."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from llama_index.core.schema import Document

from src.pipelines.vectorize_pipeline import (
    VectorizeFilePipeline,
    VectorizeFilePipelinePayload,
)


class TestVectorizeFilePipeline:
    @pytest.fixture
    def mock_parser(self):
        return MagicMock()

    @pytest.fixture
    def pipeline(self, mock_parser):
        with patch(
            "src.pipelines.vectorize_pipeline.FileParsingService",
            return_value=mock_parser,
        ), patch("src.pipelines.vectorize_pipeline.IndexingPipeline") as mock_idx_cls:
            mock_idx = MagicMock()
            mock_idx_cls.return_value = mock_idx
            return VectorizeFilePipeline()

    def test_run_calls_parser_and_indexer_removes_file(
        self, pipeline, sample_documents, temp_dir
    ):
        path = temp_dir / "parsed.json"
        path.write_text("[1,2,3]")
        pipeline.parser.read_text_file.return_value = sample_documents

        pipeline.run(
            VectorizeFilePipelinePayload(
                local_input_path=str(path),
                collection_name="test_coll",
            )
        )

        pipeline.parser.read_text_file.assert_called_once_with(str(path))
        assert not path.exists()

    def test_run_returns_early_when_no_documents(
        self, pipeline, temp_dir
    ):
        path = temp_dir / "empty.json"
        path.write_text("[]")
        pipeline.parser.read_text_file.return_value = []

        pipeline.run(
            VectorizeFilePipelinePayload(
                local_input_path=str(path),
                collection_name="test_coll",
            )
        )

        pipeline.parser.read_text_file.assert_called_once_with(str(path))
        assert not path.exists()

    def test_run_passes_collection_name_and_documents_to_indexer(
        self, mock_parser, sample_documents, temp_dir
    ):
        path = temp_dir / "parsed.json"
        path.write_text("[]")
        mock_parser.read_text_file.return_value = sample_documents

        with patch(
            "src.pipelines.vectorize_pipeline.FileParsingService",
            return_value=mock_parser,
        ), patch(
            "src.pipelines.vectorize_pipeline.IndexingPipeline",
        ) as mock_idx_cls:
            mock_idx = MagicMock()
            mock_idx_cls.return_value = mock_idx
            pl = VectorizeFilePipeline()
            pl.run(
                VectorizeFilePipelinePayload(
                    local_input_path=str(path),
                    collection_name="my_collection",
                )
            )
            mock_idx_cls.assert_called_once_with(collection_name="my_collection")
            mock_idx.run.assert_called_once_with(sample_documents)

    def test_run_removes_file_even_when_indexer_raises(
        self, mock_parser, sample_documents, temp_dir
    ):
        """When indexer.run raises, exception is logged and finally still removes file."""
        path = temp_dir / "parsed.json"
        path.write_text("[]")
        mock_parser.read_text_file.return_value = sample_documents
        with patch(
            "src.pipelines.vectorize_pipeline.FileParsingService",
            return_value=mock_parser,
        ), patch(
            "src.pipelines.vectorize_pipeline.IndexingPipeline",
        ) as mock_idx_cls:
            mock_idx = MagicMock()
            mock_idx.run.side_effect = RuntimeError("embedding failed")
            mock_idx_cls.return_value = mock_idx
            pl = VectorizeFilePipeline()

            pl.run(
                VectorizeFilePipelinePayload(
                    local_input_path=str(path),
                    collection_name="test_coll",
                )
            )
            assert not path.exists()
