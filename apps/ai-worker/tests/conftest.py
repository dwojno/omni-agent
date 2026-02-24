"""Shared pytest fixtures for ai-worker tests."""

from pathlib import Path

import pytest
from llama_index.core.schema import Document

# Directory containing dummy files for tests (sample.txt, sample.csv, sample.pdf, etc.)
FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def fixtures_dir():
    """Path to tests/fixtures with dummy files."""
    return FIXTURES_DIR


@pytest.fixture
def temp_dir(tmp_path: Path):
    """A temporary directory that is cleaned up after the test."""
    return tmp_path


@pytest.fixture
def sample_documents():
    """Sample list of Llama Index Documents for testing."""
    return [
        Document(
            text="# Hello\n\nThis is **markdown**.",
            metadata={"file_name": "doc1.md", "file_type": "text"},
        ),
        Document(
            text="Second doc content.",
            metadata={"file_name": "doc2.md", "sheet_name": "Sheet1"},
        ),
    ]


@pytest.fixture
def sample_documents_json(sample_documents):
    """JSON string that matches DocumentsService.to_json(sample_documents)."""
    return (
        '[{"text": "# Hello\\n\\nThis is **markdown**.", '
        '"metadata": {"file_name": "doc1.md", "file_type": "text"}}, '
        '{"text": "Second doc content.", '
        '"metadata": {"file_name": "doc2.md", "sheet_name": "Sheet1"}}]'
    )
