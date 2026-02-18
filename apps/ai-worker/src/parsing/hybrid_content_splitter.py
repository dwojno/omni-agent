from typing import List, Sequence

from llama_index.core.node_parser import (
    MarkdownElementNodeParser,
    NodeParser,
    SentenceWindowNodeParser,
)
from llama_index.core.schema import BaseNode

from src.model.factory import LLMFactory


class HybridContentSplitter(NodeParser):
    _md_parser: MarkdownElementNodeParser
    _window_parser: SentenceWindowNodeParser

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        llm = LLMFactory.create_llm("gemini")

        self._md_parser = MarkdownElementNodeParser(
            llm=llm, num_workers=4, include_metadata=True
        )

        self._window_parser = SentenceWindowNodeParser.from_defaults(
            window_size=3,
            window_metadata_key="window",
            original_text_metadata_key="original_text",
            include_metadata=True,
            include_prev_next_rel=True,
        )

    def _parse_nodes(
        self, nodes: Sequence[BaseNode], show_progress: bool = False, **kwargs
    ) -> List[BaseNode]:

        parsed_nodes = self._md_parser.get_nodes_from_documents(
            nodes, show_progress=show_progress
        )

        base_text_nodes, table_nodes = self._md_parser.get_nodes_and_objects(
            parsed_nodes
        )

        final_text_nodes = []

        if base_text_nodes:
            final_text_nodes = self._window_parser(base_text_nodes)

        all_nodes = final_text_nodes + table_nodes

        return all_nodes
