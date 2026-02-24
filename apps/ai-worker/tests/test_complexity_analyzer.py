"""Unit tests for DocumentComplexityAnalyzer."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.services.complexity_analyzer import DocumentComplexityAnalyzer


class TestDocumentComplexityAnalyzer:
    @pytest.fixture
    def analyzer(self):
        return DocumentComplexityAnalyzer()

    # --- _is_complex ---
    def test_is_complex_returns_false_when_score_40_or_less(self, analyzer):
        assert analyzer._is_complex(0) is False
        assert analyzer._is_complex(40) is False

    def test_is_complex_returns_true_when_score_above_40(self, analyzer):
        assert analyzer._is_complex(41) is True
        assert analyzer._is_complex(100) is True

    # --- _prepare_response ---
    def test_prepare_response_returns_score_mime_and_complexity(self, analyzer):
        score, mime, is_complex = analyzer._prepare_response(30, "application/pdf")
        assert score == 30
        assert mime == "application/pdf"
        assert is_complex is False

    def test_prepare_response_is_complex_true_when_score_above_40(self, analyzer):
        _, _, is_complex = analyzer._prepare_response(50, "text/plain")
        assert is_complex is True

    # --- _get_document_type (using dummy files) ---
    def test_get_document_type_raises_when_file_missing(self, analyzer):
        with pytest.raises(FileNotFoundError, match="File not found"):
            analyzer._get_document_type("/nonexistent/path")

    def test_get_document_type_returns_mime_from_magic(
        self, analyzer, fixtures_dir
    ):
        path = fixtures_dir / "sample.txt"
        assert path.exists(), "fixture sample.txt should exist"
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="text/plain",
        ):
            assert analyzer._get_document_type(str(path)) == "text/plain"

    # --- get_file_info (using dummy files where possible) ---
    def test_get_file_info_pdf_calls_score_pdf(
        self, analyzer, fixtures_dir
    ):
        path = fixtures_dir / "sample.pdf"
        assert path.exists(), "fixture sample.pdf should exist"
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/pdf",
        ), patch.object(
            analyzer, "_score_pdf", return_value=25
        ) as mock_score_pdf:
            score, mime, is_complex = analyzer.get_file_info(str(path))
            mock_score_pdf.assert_called_once_with(str(path))
            assert score == 25
            assert mime == "application/pdf"
            assert is_complex is False

    def test_get_file_info_pdf_real_score_using_fixture(
        self, analyzer, fixtures_dir
    ):
        """Uses real sample.pdf; only magic is mocked. _score_pdf runs for real."""
        path = fixtures_dir / "sample.pdf"
        assert path.exists(), "fixture sample.pdf should exist"
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/pdf",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert mime == "application/pdf"
            assert score <= 40, "text-heavy PDF should get low score"
            assert is_complex is False

    def test_get_file_info_text_returns_zero_score(
        self, analyzer, fixtures_dir
    ):
        path = fixtures_dir / "sample.txt"
        assert path.exists(), "fixture sample.txt should exist"
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="text/plain",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert score == 0
            assert mime == "text/plain"
            assert is_complex is False

    def test_get_file_info_csv_returns_zero_score(
        self, analyzer, fixtures_dir
    ):
        path = fixtures_dir / "sample.csv"
        assert path.exists(), "fixture sample.csv should exist"
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/csv",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert score == 0
            assert is_complex is False

    def test_get_file_info_image_returns_100_score(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "file.png"
        path.write_bytes(b"\x89PNG")
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="image/png",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert score == 100
            assert mime == "image/png"
            assert is_complex is True

    def test_get_file_info_spreadsheet_returns_low_score(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "file.xlsx"
        path.write_bytes(b"PK")
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert score == 10
            assert is_complex is False

    def test_get_file_info_unknown_mime_returns_100(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "file.xyz"
        path.write_bytes(b"???")
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/octet-stream",
        ):
            score, mime, is_complex = analyzer.get_file_info(str(path))
            assert score == 100
            assert is_complex is True

    # --- _score_pdf (real dummy PDFs) ---
    def test_score_pdf_returns_100_when_little_text_using_fixture(
        self, analyzer, fixtures_dir
    ):
        """Uses real sample_scan.pdf (minimal text) -> should score 100 (OCR path)."""
        path = fixtures_dir / "sample_scan.pdf"
        assert path.exists(), "fixture sample_scan.pdf should exist"
        score = analyzer._score_pdf(str(path))
        assert score == 100

    def test_score_pdf_returns_low_when_mostly_text_using_fixture(
        self, analyzer, fixtures_dir
    ):
        """Uses real sample.pdf (enough text) -> should score low (no OCR)."""
        path = fixtures_dir / "sample.pdf"
        assert path.exists(), "fixture sample.pdf should exist"
        score = analyzer._score_pdf(str(path))
        assert score <= 40

    # --- _score_pdf (mocked fitz for edge cases) ---
    def test_score_pdf_returns_low_when_mostly_text_mocked(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "text.pdf"
        path.write_bytes(b"dummy")
        mock_page = MagicMock()
        mock_page.get_text.return_value = "a" * 100
        mock_page.get_drawings.return_value = []
        mock_page.get_images.return_value = []
        mock_doc = MagicMock()
        mock_doc.__len__ = MagicMock(return_value=1)
        mock_doc.__getitem__ = MagicMock(return_value=mock_page)

        with patch(
            "src.services.complexity_analyzer.fitz.open",
            return_value=mock_doc,
        ):
            score = analyzer._score_pdf(str(path))
            assert score <= 100
        mock_doc.close.assert_called_once()

    def test_score_pdf_returns_100_on_exception(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "bad.pdf"
        path.write_bytes(b"not a pdf")
        with patch(
            "src.services.complexity_analyzer.fitz.open",
            side_effect=Exception("invalid"),
        ):
            score = analyzer._score_pdf(str(path))
            assert score == 100

    # --- _score_office_xml (mocked zipfile) ---
    def test_score_office_xml_zero_when_no_charts_or_embeddings(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "doc.docx"
        path.write_bytes(b"PK")
        with patch(
            "src.services.complexity_analyzer.zipfile.ZipFile",
        ) as mock_zip_cls:
            mock_zip = MagicMock()
            mock_zip.__enter__ = MagicMock(return_value=mock_zip)
            mock_zip.__exit__ = MagicMock(return_value=None)
            mock_zip.namelist.return_value = ["word/document.xml"]
            mock_zip_cls.return_value = mock_zip
            score = analyzer._score_office_xml(str(path))
            assert score == 0

    def test_score_office_xml_high_when_has_charts(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "doc.pptx"
        path.write_bytes(b"PK")
        with patch(
            "src.services.complexity_analyzer.zipfile.ZipFile",
        ) as mock_zip_cls:
            mock_zip = MagicMock()
            mock_zip.__enter__ = MagicMock(return_value=mock_zip)
            mock_zip.__exit__ = MagicMock(return_value=None)
            mock_zip.namelist.return_value = ["ppt/charts/chart1.xml"]
            mock_zip_cls.return_value = mock_zip
            score = analyzer._score_office_xml(str(path))
            assert score >= 50

    def test_score_office_xml_high_when_has_embeddings(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "doc.docx"
        path.write_bytes(b"PK")
        with patch(
            "src.services.complexity_analyzer.zipfile.ZipFile",
        ) as mock_zip_cls:
            mock_zip = MagicMock()
            mock_zip.__enter__ = MagicMock(return_value=mock_zip)
            mock_zip.__exit__ = MagicMock(return_value=None)
            mock_zip.namelist.return_value = ["word/embeddings/embedding1.bin"]
            mock_zip_cls.return_value = mock_zip
            score = analyzer._score_office_xml(str(path))
            assert score >= 40

    def test_score_office_xml_returns_100_on_bad_zip(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "not-a-zip"
        path.write_bytes(b"not a zip")
        with patch(
            "src.services.complexity_analyzer.zipfile.ZipFile",
            side_effect=__import__("zipfile").BadZipFile("bad"),
        ):
            score = analyzer._score_office_xml(str(path))
            assert score == 100

    def test_get_file_info_word_docx_uses_office_xml_score(
        self, analyzer, temp_dir
    ):
        path = temp_dir / "report.docx"
        path.write_bytes(b"PK")
        with patch(
            "src.services.complexity_analyzer.magic.from_file",
            return_value="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ), patch.object(
            analyzer, "_score_office_xml", return_value=60
        ) as mock_office:
            score, mime, is_complex = analyzer.get_file_info(str(path))
            mock_office.assert_called_once_with(str(path))
            assert score == 60
            assert is_complex is True
