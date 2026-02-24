"""Unit tests for run_parse_file Celery task."""

from unittest.mock import MagicMock, patch

import pytest

from src.tasks.parse_file import run_parse_file


class TestRunParseFile:
    def test_downloads_parses_uploads_and_enqueues_vectorize(
        self, sample_documents, temp_dir
    ):
        task_payload = {
            "s3_key": "inputs/doc.pdf",
            "collection_name": "my_coll",
            "force_ocr": False,
        }
        inputs_dir = temp_dir / "inputs"
        inputs_dir.mkdir(parents=True)
        (inputs_dir / "doc.pdf").write_text("fake pdf")

        with patch(
            "src.tasks.parse_file.settings",
        ) as mock_settings, patch(
            "src.tasks.parse_file._s3_client",
        ) as mock_s3, patch(
            "src.tasks.parse_file._get_pipeline",
        ) as mock_get_pl, patch(
            "src.tasks.parse_file.run_vectorize_file",
        ) as mock_vectorize:
            mock_settings.TEMP_DIR = temp_dir
            mock_pl = MagicMock()
            mock_pl.run.return_value = sample_documents
            mock_get_pl.return_value = mock_pl

            run_parse_file.apply(args=[task_payload], throw=True)

            mock_s3.download_file.assert_called_once()
            mock_pl.run.assert_called_once()
            mock_s3.upload_file.assert_called_once()
            mock_vectorize.delay.assert_called_once()
            call_args = mock_vectorize.delay.call_args[0][0]
            assert call_args["s3_key"] == "parsed/doc.pdf.json"
            assert call_args["collection_name"] == "my_coll"

    def test_returns_early_when_no_documents(self, temp_dir):
        task_payload = {
            "s3_key": "inputs/empty.pdf",
            "collection_name": "my_coll",
        }
        inputs_dir = temp_dir / "inputs"
        inputs_dir.mkdir(parents=True)
        (inputs_dir / "empty.pdf").write_text("")

        with patch(
            "src.tasks.parse_file.settings",
        ) as mock_settings, patch(
            "src.tasks.parse_file._s3_client",
        ), patch(
            "src.tasks.parse_file._get_pipeline",
        ) as mock_get_pl, patch(
            "src.tasks.parse_file.run_vectorize_file",
        ) as mock_vectorize:
            mock_settings.TEMP_DIR = temp_dir
            mock_pl = MagicMock()
            mock_pl.run.return_value = []
            mock_get_pl.return_value = mock_pl

            run_parse_file.apply(args=[task_payload], throw=True)

            mock_vectorize.delay.assert_not_called()
