import logging
import os
from typing import Optional

from pydantic import BaseModel

from src.core.config import settings
from src.core.s3_client import S3Client
from src.parsing.file_parsing_service import FileParsingService
from src.pipelines.indexing_pipeline import IndexingPipeline

logger = logging.getLogger(__name__)


class IngestionTask(BaseModel):
    s3_key: str
    collection_name: str
    force_ocr: Optional[bool] = None


class FilePipeline:
    def __init__(self):
        self.s3 = S3Client()
        self.parser = FileParsingService()

    def run(self, task: IngestionTask):
        logger.info("Received task: s3_key=%s", task.s3_key)

        file_name = os.path.basename(task.s3_key)
        local_input_path = os.path.join(settings.TEMP_DIR, "inputs", file_name)

        try:
            self.s3.download_file(task.s3_key, local_input_path)

            logger.info("Parsing document")
            documents = self.parser.parse_file(local_input_path, task.force_ocr)

            if not documents:
                logger.warning("Parser returned empty content, aborting")
                return

            indexer = IndexingPipeline(collection_name=task.collection_name)
            indexer.run(documents)

            logger.info("Success: document is RAG-ready")

        except Exception as e:
            logger.exception("Critical failure: %s", e)

        finally:
            if os.path.exists(local_input_path):
                os.remove(local_input_path)
                logger.debug("Temp file removed: %s", local_input_path)
