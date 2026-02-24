import logging
import os

from pydantic import BaseModel

from src.celery_app import app
from src.core.config import settings
from src.core.s3_client import S3Client
from src.pipelines.vectorize_pipeline import (
    VectorizeFilePipeline,
    VectorizeFilePipelinePayload,
)

_logger = logging.getLogger(__name__)

_pipeline: VectorizeFilePipeline | None = None

_s3_client = S3Client()


class VectorizeFileTaskPayload(BaseModel):
    s3_key: str
    collection_name: str


def _get_pipeline() -> VectorizeFilePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = VectorizeFilePipeline()
    return _pipeline


@app.task(bind=True)
def run_vectorize_file(self, task_payload: dict):
    """Run document vectorization: parse, vectorize, index to Qdrant."""
    task = VectorizeFileTaskPayload.model_validate(task_payload)
    _logger.info("Received task for vectorization: s3_key=%s", task.s3_key)

    file_name = os.path.basename(task_payload["s3_key"])
    local_input_path = os.path.join(settings.TEMP_DIR, "inputs", file_name)
    _s3_client.download_file(task.s3_key, local_input_path)
    pipeline = _get_pipeline()
    pipeline.run(
        VectorizeFilePipelinePayload(
            local_input_path=local_input_path, collection_name=task.collection_name
        )
    )
