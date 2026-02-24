"""Unit tests for HybridContentSplitter."""

from unittest.mock import MagicMock, patch

import pytest
from llama_index.core.schema import TextNode

from src.services.hybrid_content_splitter import HybridContentSplitter


class TestHybridContentSplitter:
    @pytest.fixture
    def splitter(self):
        with patch(
            "src.services.hybrid_content_splitter.LLMFactory.create_llm",
            return_value=MagicMock(),
        ), patch(
            "src.services.hybrid_content_splitter.MarkdownElementNodeParser",
        ) as mock_md_cls, patch(
            "src.services.hybrid_content_splitter.SentenceWindowNodeParser.from_defaults",
        ) as mock_sw:
            mock_md = MagicMock()
            mock_md.get_nodes_from_documents.return_value = []
            mock_md.get_nodes_and_objects.return_value = (
                [TextNode(text="base")],
                [TextNode(text="table")],
            )
            mock_md_cls.return_value = mock_md
            mock_window = MagicMock(return_value=[TextNode(text="windowed")])
            mock_sw.return_value = mock_window
            yield HybridContentSplitter()

    def test_call_returns_combined_text_and_table_nodes(self, splitter):
        nodes = splitter([TextNode(text="doc")])
        splitter._md_parser.get_nodes_from_documents.assert_called_once()
        splitter._md_parser.get_nodes_and_objects.assert_called_once()
        splitter._window_parser.assert_called_once()
        assert len(nodes) == 2
        assert nodes[0].text == "windowed"
        assert nodes[1].text == "table"
