import logging
import os
from typing import List, Optional

from llama_index.core.schema import Document
from pydantic import BaseModel

from src.services.file_parsing_service import FileParsingService

logger = logging.getLogger(__name__)


class ParseFilePipelinePayload(BaseModel):
    local_input_path: str
    force_ocr: Optional[bool] = None


class ParseFilePipeline:
    def __init__(self):
        self.parser = FileParsingService()

    def run(self, task: ParseFilePipelinePayload) -> List[Document]:
        try:
            logger.info("Parsing document")
            documents = self.parser.parse_file(task.local_input_path, task.force_ocr)

            if not documents:
                logger.warning("Parser returned empty content, aborting")
                return []

            logger.info("Success: document is parsed")

            return documents

        except Exception as e:
            logger.exception("Critical failure: %s", e)

        finally:
            if os.path.exists(task.local_input_path):
                os.remove(task.local_input_path)
                logger.debug("Temp file removed: %s", task.local_input_path)
