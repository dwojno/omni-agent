"""Unit tests for S3Client."""

from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError

from src.core.s3_client import S3Client


class TestS3Client:
    @pytest.fixture
    def mock_boto_s3(self):
        return MagicMock()

    @pytest.fixture
    def client(self, mock_boto_s3):
        with (
            patch("src.core.s3_client.boto3.client", return_value=mock_boto_s3),
            patch("src.core.s3_client.settings") as mock_settings,
        ):
            mock_settings.AWS_ENDPOINT_URL = None
            mock_settings.AWS_ACCESS_KEY = MagicMock(
                get_secret_value=MagicMock(return_value="key")
            )
            mock_settings.AWS_SECRET_KEY = MagicMock(
                get_secret_value=MagicMock(return_value="secret")
            )
            mock_settings.AWS_REGION = "eu-central-1"
            mock_settings.S3_BUCKET_NAME = "test-bucket"
            yield S3Client()

    def test_download_file_success(self, client, temp_dir):
        client._s3.download_file = MagicMock()
        path = temp_dir / "sub" / "file.txt"
        client.download_file("key/file.txt", str(path))
        client._s3.download_file.assert_called_once_with(
            "test-bucket", "key/file.txt", str(path)
        )
        assert path.parent.exists()

    def test_download_file_raises_on_client_error(self, client, temp_dir):
        client._s3.download_file.side_effect = ClientError(
            {"Error": {"Code": "404", "Message": "Not Found"}}, "GetObject"
        )
        with pytest.raises(ClientError):
            client.download_file("missing/key", str(temp_dir / "out.txt"))

    def test_upload_file_success(self, client, temp_dir):
        client._s3.upload_file = MagicMock()
        path = temp_dir / "local.json"
        path.write_text("{}")
        client.upload_file(str(path), "parsed/doc.json")
        client._s3.upload_file.assert_called_once_with(
            str(path), "test-bucket", "parsed/doc.json"
        )

    def test_upload_file_raises_on_client_error(self, client, temp_dir):
        path = temp_dir / "local.json"
        path.write_text("{}")
        client._s3.upload_file.side_effect = ClientError(
            {"Error": {"Code": "403", "Message": "Forbidden"}}, "PutObject"
        )
        with pytest.raises(ClientError):
            client.upload_file(str(path), "parsed/doc.json")
