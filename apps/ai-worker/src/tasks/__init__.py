"""
Celery tasks package. Import submodules so tasks are registered with the app.

To add a new task:
  1. Add a module here (e.g. reindex.py) and define an @app.task.
  2. Import it below so Celery discovers it.
  3. In celery_app.py add the task name and queue to TASK_QUEUES.
  4. Optionally add CELERY_QUEUE_* in config and use in TASK_QUEUES.
"""
from src.tasks import ingestion  # noqa: F401

__all__ = ["run_ingestion"]

from src.tasks.ingestion import run_ingestion
