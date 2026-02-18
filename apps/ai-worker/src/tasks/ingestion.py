import logging

from src.celery_app import app
from src.pipelines.file_pipeline import FilePipeline, IngestionTask

logger = logging.getLogger(__name__)

_pipeline: FilePipeline | None = None


def _get_pipeline() -> FilePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = FilePipeline()
    return _pipeline


@app.task(bind=True)
def run_ingestion(self, task_payload: dict):
    """Run document ingestion: download from S3, parse, index to Qdrant."""
    task = IngestionTask.model_validate(task_payload)
    pipeline = _get_pipeline()
    pipeline.run(task)
