"""Unit tests for ParseFilePipeline."""

from unittest.mock import MagicMock, patch


import pytest

from src.pipelines.parse_pipeline import (
    ParseFilePipeline,
    ParseFilePipelinePayload,
)


class TestParseFilePipeline:
    @pytest.fixture
    def mock_parser(self):
        return MagicMock()

    @pytest.fixture
    def pipeline(self, mock_parser):
        with patch(
            "src.pipelines.parse_pipeline.FileParsingService",
            return_value=mock_parser,
        ):
            return ParseFilePipeline()

    def test_run_returns_documents_and_removes_file(
        self, pipeline, mock_parser, sample_documents, temp_dir
    ):
        local_path = temp_dir / "input.txt"
        local_path.write_text("hello")
        mock_parser.parse_file.return_value = sample_documents

        result = pipeline.run(
            ParseFilePipelinePayload(
                local_input_path=str(local_path),
                force_ocr=False,
            )
        )

        assert result == sample_documents
        mock_parser.parse_file.assert_called_once_with(str(local_path), False)
        assert not local_path.exists()

    def test_run_returns_empty_list_when_parser_returns_empty(
        self, pipeline, mock_parser, temp_dir
    ):
        local_path = temp_dir / "empty.txt"
        local_path.write_text("")
        mock_parser.parse_file.return_value = []

        result = pipeline.run(
            ParseFilePipelinePayload(local_input_path=str(local_path))
        )

        assert result == []
        assert not local_path.exists()

    def test_run_passes_force_ocr_to_parser(
        self, pipeline, mock_parser, sample_documents, temp_dir
    ):
        local_path = temp_dir / "doc.pdf"
        local_path.write_text("x")
        mock_parser.parse_file.return_value = sample_documents

        pipeline.run(
            ParseFilePipelinePayload(
                local_input_path=str(local_path),
                force_ocr=True,
            )
        )

        mock_parser.parse_file.assert_called_once_with(str(local_path), True)

    def test_run_returns_none_on_parser_exception(
        self, pipeline, mock_parser, temp_dir
    ):
        local_path = temp_dir / "bad.txt"
        local_path.write_text("x")
        mock_parser.parse_file.side_effect = RuntimeError("parse failed")

        result = pipeline.run(
            ParseFilePipelinePayload(local_input_path=str(local_path))
        )

        # Pipeline catches exception, logs it, and returns None; finally still runs
        assert result is None
