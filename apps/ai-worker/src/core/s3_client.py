import os

import boto3
from botocore.exceptions import ClientError

from src.core.config import settings


class S3Client:
    def __init__(self):
        endpoint = settings.AWS_ENDPOINT_URL

        print(f"☁️ [S3 INIT] Connecting with: {endpoint if endpoint else 'AWS Cloud'}")

        self._s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY,
            region_name=settings.AWS_REGION,
        )
        self._bucket_name = settings.S3_BUCKET_NAME

    def download_file(self, s3_key: str, local_path: str):
        try:
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            self._s3.download_file(self._bucket_name, s3_key, local_path)
        except ClientError as e:
            print(e)
            raise e
