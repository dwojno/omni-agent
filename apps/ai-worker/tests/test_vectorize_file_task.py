"""Unit tests for run_vectorize_file Celery task."""

from unittest.mock import MagicMock, patch

import pytest

from src.tasks.vectorize_file import run_vectorize_file


class TestRunVectorizeFile:
    def test_downloads_and_calls_pipeline(self, temp_dir, sample_documents_json):
        inputs_dir = temp_dir / "inputs"
        inputs_dir.mkdir(parents=True)
        (inputs_dir / "parsed.json").write_text(sample_documents_json)
        task_payload = {
            "s3_key": "parsed/doc.pdf.json",
            "collection_name": "vec_coll",
        }

        with patch(
            "src.tasks.vectorize_file.settings",
        ) as mock_settings, patch(
            "src.tasks.vectorize_file._s3_client",
        ) as mock_s3, patch(
            "src.tasks.vectorize_file._get_pipeline",
        ) as mock_get_pl:
            mock_settings.TEMP_DIR = temp_dir
            mock_pl = MagicMock()
            mock_get_pl.return_value = mock_pl

            run_vectorize_file.apply(args=[task_payload], throw=True)

            mock_s3.download_file.assert_called_once()
            mock_pl.run.assert_called_once()
            call_arg = mock_pl.run.call_args[0][0]
            # Task uses basename(s3_key) so path ends with doc.pdf.json
            assert call_arg.local_input_path.endswith("doc.pdf.json")
            assert call_arg.collection_name == "vec_coll"
