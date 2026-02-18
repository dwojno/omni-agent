import logging
import os

import boto3
from botocore.exceptions import ClientError

from src.core.config import settings

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(self):
        endpoint = settings.AWS_ENDPOINT_URL
        logger.info(
            "Connecting to %s",
            endpoint if endpoint else "AWS Cloud",
        )

        client_kwargs = {
            "aws_access_key_id": settings.AWS_ACCESS_KEY.get_secret_value(),
            "aws_secret_access_key": settings.AWS_SECRET_KEY.get_secret_value(),
            "region_name": settings.AWS_REGION,
        }
        if endpoint:
            client_kwargs["endpoint_url"] = endpoint

        self._s3 = boto3.client("s3", **client_kwargs)
        self._bucket_name = settings.S3_BUCKET_NAME

    def download_file(self, s3_key: str, local_path: str):
        try:
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            self._s3.download_file(self._bucket_name, s3_key, local_path)
        except ClientError as e:
            logger.error("S3 download failed: %s", e)
            raise
