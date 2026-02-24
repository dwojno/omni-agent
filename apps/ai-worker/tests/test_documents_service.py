"""Unit tests for DocumentsService."""

from typing import List

from llama_index.core.schema import Document

from src.services.documents_service import DocumentsService


class TestDocumentsService:
    def test_to_json_roundtrip(self, sample_documents: List[Document]):
        documents_service = DocumentsService()
        json_str = documents_service.to_json(sample_documents)
        assert isinstance(json_str, str)
        restored = documents_service.from_json(json_str)
        assert len(restored) == len(sample_documents)
        for restored_doc, sample_doc in zip(restored, sample_documents, strict=False):
            assert restored_doc.text == sample_doc.text
            assert restored_doc.metadata == sample_doc.metadata

    def test_from_json_empty(self):
        documents_service = DocumentsService()
        assert documents_service.from_json("[]") == []

    def test_to_json_empty(self):
        documents_service = DocumentsService()
        assert documents_service.to_json([]) == "[]"

    def test_from_json_preserve_unicode(self):
        service = DocumentsService()
        doc = Document(text="Café naïve", metadata={})
        json_str = service.to_json([doc])
        restored = service.from_json(json_str)
        assert restored[0].text == "Café naïve"
