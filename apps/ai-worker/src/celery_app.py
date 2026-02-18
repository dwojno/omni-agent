"""
Celery app for ai-worker. Run the worker from the app root (apps/ai-worker) using
the project venv to avoid "bad interpreter" from a system celery:

  uv run celery -A src.celery_app:app worker -Q ingestion --loglevel=info

  or:  python -m celery -A src.celery_app:app worker -Q ingestion --loglevel=info
"""

from celery import Celery
from celery.signals import worker_process_init

from src.core.config import settings
from src.core.logging_config import setup_logging

# Apply logging as soon as the app is loaded.
setup_logging()

app = Celery(
    "ai_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["src.tasks"],
)
# Map task name -> queue. Add a line when you add a new task (and its queue in config).
TASK_QUEUES = [
    ("src.tasks.ingestion.run_ingestion", settings.CELERY_QUEUE_INGESTION),
    # Example for a future task:
    # ("src.tasks.reindex.run_reindex", settings.CELERY_QUEUE_REINDEX),
]
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_routes={name: {"queue": q} for name, q in TASK_QUEUES},
    task_default_queue="default",
    broker_connection_retry_on_startup=True,
)


@worker_process_init.connect
def _configure_worker_logging(**kwargs) -> None:
    """Apply app logging config in each Celery worker process."""
    setup_logging()
