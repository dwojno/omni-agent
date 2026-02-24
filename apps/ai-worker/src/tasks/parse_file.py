import logging
import os
import tempfile
from typing import Optional

from pydantic import BaseModel

from src.celery_app import app
from src.core.config import settings
from src.core.s3_client import S3Client
from src.pipelines.parse_pipeline import ParseFilePipeline, ParseFilePipelinePayload
from src.services.documents_service import DocumentsService
from src.tasks.vectorize_file import VectorizeFileTaskPayload, run_vectorize_file

logger = logging.getLogger(__name__)

_pipeline: ParseFilePipeline | None = None


class ParseFileTask(BaseModel):
    s3_key: str
    collection_name: str
    force_ocr: Optional[bool] = None


_s3_client = S3Client()
_documents_service = DocumentsService()


def _get_pipeline() -> ParseFilePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = ParseFilePipeline()
    return _pipeline


@app.task(bind=True)
def run_parse_file(self, task_payload: dict):
    """Run document ingestion: download from S3, parse, index to Qdrant."""
    task = ParseFileTask.model_validate(task_payload)
    logger.info("Received task for parsing: s3_key=%s", task.s3_key)

    file_name = os.path.basename(task_payload["s3_key"])
    local_input_path = os.path.join(settings.TEMP_DIR, "inputs", file_name)
    _s3_client.download_file(task.s3_key, local_input_path)
    pipeline = _get_pipeline()
    documents = pipeline.run(
        ParseFilePipelinePayload(
            local_input_path=local_input_path, force_ocr=task.force_ocr
        )
    )

    if not documents:
        logger.warning("Parser returned empty content, aborting")
        return

    json_str = _documents_service.to_json(documents)
    parsed_s3_key = f"parsed/{file_name}.json"
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        f.write(json_str)
        temp_path = f.name
    try:
        _s3_client.upload_file(temp_path, parsed_s3_key)
        run_vectorize_file.delay(
            VectorizeFileTaskPayload(
                s3_key=parsed_s3_key,
                collection_name=task.collection_name,
            ).model_dump()
        )
    finally:
        os.unlink(temp_path)
