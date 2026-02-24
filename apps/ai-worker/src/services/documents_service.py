import json

from llama_index.core.schema import Document


class DocumentsService:
    def to_json(self, documents: list[Document]) -> str:
        return json.dumps(
            [{"text": d.text, "metadata": d.metadata} for d in documents],
            ensure_ascii=False,
        )

    def from_json(self, json_str: str) -> list[Document]:
        return [
            Document(text=d["text"], metadata=d["metadata"])
            for d in json.loads(json_str)
        ]
