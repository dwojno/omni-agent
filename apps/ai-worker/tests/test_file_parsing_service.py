"""Unit tests for FileParsingService (routing and local paths: text, CSV)."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from llama_index.core.schema import Document

from src.services.file_parsing_service import FileParsingService


class TestFileParsingService:
    """Test parse_file routing and local parsing paths (text, CSV) without cloud/PDF."""

    @pytest.fixture
    def service(self):
        with patch(
            "src.services.file_parsing_service.LlamaParse",
        ), patch(
            "src.services.file_parsing_service.settings"
        ) as mock_settings:
            mock_settings.LLAMA_CLOUD_KEY = MagicMock(get_secret_value=MagicMock(return_value="fake"))
            yield FileParsingService()

    def test_parse_file_routes_text_to_local_io(self, service, fixtures_dir):
        """get_file_info returns text/plain -> _read_local_text is used."""
        path = fixtures_dir / "sample.txt"
        with patch.object(
            service._file_analyzer,
            "get_file_info",
            return_value=(0, "text/plain", False),
        ):
            docs = service.parse_file(str(path), force_ocr=False)
        assert len(docs) == 1
        assert "Hello world" in docs[0].text
        assert docs[0].metadata["parsing_method"] == "local_io"
        assert docs[0].metadata["file_type"] == "text"

    def test_parse_file_routes_csv_to_pandas(self, service, fixtures_dir):
        """get_file_info returns application/csv -> _parse_csv_local is used."""
        path = fixtures_dir / "sample.csv"
        with patch.object(
            service._file_analyzer,
            "get_file_info",
            return_value=(0, "application/csv", False),
        ):
            docs = service.parse_file(str(path), force_ocr=False)
        assert len(docs) == 1
        assert "name" in docs[0].text and "alpha" in docs[0].text
        assert docs[0].metadata["parsing_method"] == "pandas_local"
        assert docs[0].metadata["file_type"] == "tabular"

    def test_parse_file_force_ocr_routes_to_cloud(self, service, fixtures_dir):
        """force_ocr=True -> _parse_cloud is used (mocked)."""
        path = fixtures_dir / "sample.txt"
        with patch.object(
            service._file_analyzer,
            "get_file_info",
            return_value=(0, "text/plain", False),
        ), patch.object(
            service, "_parse_cloud", return_value=[Document(text="cloud", metadata={})]
        ) as mock_cloud:
            docs = service.parse_file(str(path), force_ocr=True)
            mock_cloud.assert_called_once_with(str(path))
        assert len(docs) == 1
        assert docs[0].text == "cloud"

    def test_read_text_file_returns_document_with_content(self, service, fixtures_dir):
        """read_text_file reads file and returns one Document."""
        path = fixtures_dir / "sample.txt"
        docs = service.read_text_file(str(path))
        assert len(docs) == 1
        assert docs[0].metadata["file_type"] == "text"
        assert "Hello world" in docs[0].text
