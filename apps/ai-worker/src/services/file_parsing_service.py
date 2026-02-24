import logging
import os
from typing import List

import nest_asyncio
import pandas as pd
import pymupdf4llm
from llama_index.core.schema import Document
from llama_parse import LlamaParse

from src.core.config import settings
from src.services.complexity_analyzer import DocumentComplexityAnalyzer

logger = logging.getLogger(__name__)

nest_asyncio.apply()


class FileParsingService:
    """
    Universal Parsing Router.

    Routing Logic:
    1. Complex Layouts (PDF, DOCX, PPTX, Images) -> LlamaParse (Cloud API).
       Ensures tables and visual structures are preserved in Markdown.
    2. Structured Data (Excel, CSV) -> Pandas (Local).
       Fast, zero-cost, perfect data fidelity.
    3. Plain Text (MD, TXT, JSON) -> Local I/O.
    """

    def __init__(self):
        self._llama_parser = LlamaParse(
            result_type="markdown",
            api_key=settings.LLAMA_CLOUD_KEY.get_secret_value(),
            verbose=True,
            language="en",
            parsing_instruction="""
            You are converting a document to Markdown for a RAG system.
            1. Preserve ALL text, including headers, footers, and legal disclaimers.
            2. Convert all tables into Markdown tables. Do not summarize them.
            Keep every row and column.
            3. For PowerPoint/Images, describe diagrams and charts in detail.
            4. Output strictly Markdown.
            """,
        )
        self._file_analyzer = DocumentComplexityAnalyzer()

    def _parse_cloud(self, file_path: str) -> List[Document]:
        """
        Uploads file to LlamaCloud for advanced parsing.
        Handles: PDF, DOCX, PPTX, Images.
        """
        logger.info("LlamaParse: uploading %s to cloud", os.path.basename(file_path))

        docs = self._llama_parser.load_data(file_path)

        for doc in docs:
            doc.metadata.update(
                {
                    "file_name": os.path.basename(file_path),
                    "parsing_method": "llama_parse_cloud",
                    "file_type": "complex_doc",
                }
            )

        return docs

    def _parse_excel_local(self, file_path: str) -> List[Document]:
        """
        Uses Pandas to convert Excel sheets to Markdown tables locally.
        """
        xls = pd.read_excel(file_path)
        docs = []

        for sheet in xls.sheet_names:
            df = pd.read_excel(xls, sheet)
            docs.append(self._df_to_doc(df, file_path, sheet))

        return docs

    def _read_pdf_local(self, file_path: str) -> List[Document]:
        try:
            md_content = pymupdf4llm.to_markdown(file_path)
            return [
                Document(
                    text=md_content,
                    metadata={
                        "file_name": os.path.basename(file_path),
                        "parsing_method": "pymupdf4llm_local",
                        "file_type": "pdf",
                        "is_premium": False,
                    },
                )
            ]
        except Exception as e:
            logger.exception("Local PDF read failed: %s", e)
            raise

    def _parse_csv_local(self, file_path: str) -> List[Document]:
        """
        Uses Pandas to convert CSV to Markdown tables locally.
        """
        df = pd.read_csv(file_path)

        return [self._df_to_doc(df, file_path)]

    def read_text_file(self, file_path: str) -> List[Document]:
        with open(file_path) as f:
            content = f.read()
            return [
                Document(
                    text=content,
                    metadata={
                        "file_name": os.path.basename(file_path),
                        "parsing_method": "local_io",
                        "file_type": "text",
                    },
                )
            ]

    def _df_to_doc(
        self, df: pd.DataFrame, file_path: str, sheet: str = None
    ) -> Document:
        """
        Helper: DataFrame -> Markdown Document
        """
        # Cleanup: Remove completely empty rows/cols
        df = df.dropna(how="all").dropna(axis=1, how="all")

        md_table = df.to_markdown(index=False)

        # Add context header
        header = f"# Data File: {os.path.basename(file_path)}"

        if sheet:
            header += f" | Sheet: {sheet}"

        full_text = f"{header}\n\n{md_table}"

        meta = {
            "file_name": os.path.basename(file_path),
            "parsing_method": "pandas_local",
            "file_type": "tabular",
        }
        if sheet:
            meta["sheet_name"] = sheet

        return Document(text=full_text, metadata=meta)

    def parse_file(self, file_path: str, force_ocr: bool = False) -> List[Document]:
        score, mime, is_complex = self._file_analyzer.get_file_info(file_path)

        logger.info("Router: mime=%s score=%s/100", mime, score)

        if is_complex or force_ocr:
            logger.info("Routing to LlamaParse (cloud)")
            return self._parse_cloud(file_path)

        elif "spreadsheet" in mime or "csv" in mime or "excel" in mime:
            logger.info("Routing to Pandas (local)")
            # Determine if CSV or Excel based on MIME, not extension!
            if "csv" in mime:
                return self._parse_csv_local(file_path)
            else:
                return self._parse_excel_local(file_path)

        elif mime == "application/pdf":
            return self._read_pdf_local(file_path)

        elif mime.startswith("text/"):
            return self.read_text_file(file_path)

        else:
            return self.read_text_file(file_path)
