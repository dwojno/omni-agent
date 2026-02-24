import logging
import os

from pydantic import BaseModel

from src.pipelines.indexing_pipeline import IndexingPipeline
from src.services.file_parsing_service import FileParsingService

logger = logging.getLogger(__name__)


class VectorizeFilePipelinePayload(BaseModel):
    local_input_path: str
    collection_name: str


class VectorizeFilePipeline:
    def __init__(self):
        self.parser = FileParsingService()

    def run(self, task: VectorizeFilePipelinePayload):
        try:
            logger.info("Vectorizing file")
            documents = self.parser.read_text_file(task.local_input_path)

            if not documents:
                logger.warning("Parser returned empty content, aborting")
                return

            indexer = IndexingPipeline(collection_name=task.collection_name)
            indexer.run(documents)

            logger.info("Success: document is RAG-ready")

        except Exception as e:
            logger.exception("Critical failure: %s", e)

        finally:
            if os.path.exists(task.local_input_path):
                os.remove(task.local_input_path)
                logger.debug("Temp file removed: %s", task.local_input_path)
