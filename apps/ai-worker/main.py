from src.core.logging_config import setup_logging
from src.pipelines.file_pipeline import FilePipeline, IngestionTask

setup_logging()

worker = FilePipeline()

if __name__ == "__main__":
    mock_payload = {
        "s3_key": "team-members-7353425-2026-02-12.csv",
        "collection_name": "test_collection_v1",
    }

    task = IngestionTask(**mock_payload)

    worker.run(task)
