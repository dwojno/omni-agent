import logging
import sys

from src.core.config import settings


def setup_logging() -> None:
    """Configure root logger with level from settings and a consistent format."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    format_str = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    date_fmt = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=level,
        format=format_str,
        datefmt=date_fmt,
        stream=sys.stdout,
        force=True,
    )

    # Reduce noise from third-party libs
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("qdrant_client").setLevel(logging.WARNING)
    logging.getLogger("llama_index").setLevel(logging.WARNING)
