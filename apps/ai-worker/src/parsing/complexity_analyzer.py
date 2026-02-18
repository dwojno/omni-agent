import os
import zipfile
from typing import Tuple, TypedDict

import fitz  # PyMuPDF
import magic
from typing_extensions import ReadOnly


class Response(TypedDict):
    score: ReadOnly[int]
    mime_type: ReadOnly[str]
    is_complex: ReadOnly[bool]


class DocumentComplexityAnalyzer:
    def _get_document_type(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        mime_type = magic.from_file(file_path, mime=True)
        return mime_type

    def _is_complex(score: int) -> bool:
        return score > 40

    def _prepare_response(self, score: int, mime_type: str) -> Tuple[int, str, bool]:
        return [score, mime_type, self._is_complex(score)]

    def _score_pdf(self, file_path: str) -> int:
        """
        Analyzes PDF internals using PyMuPDF.
        High Score = Scanned images or heavy vector graphics (tables).
        """
        try:
            doc = fitz.open(file_path)
            total_score = 0
            pages_to_check = min(3, len(doc))

            for i in range(pages_to_check):
                page = doc[i]
                text = page.get_text()
                drawings = page.get_drawings()
                images = page.get_images()

                # A. OCR CHECK: Full page image with no text?
                if len(text) < 50:
                    return 100  # It's a scan. Requires LlamaParse OCR.

                # B. TABLE CHECK: Lots of vector lines?
                if len(drawings) > 50:
                    total_score += 40  # Likely a complex table
                elif len(drawings) > 20:
                    total_score += 20

                # C. IMAGE CHECK: Embedded diagrams?
                if len(images) > 2:
                    total_score += 20

            doc.close()
            return min(total_score, 100)

        except Exception as e:
            print(e)
            return 100  # Fail safe -> Use Cloud

    def _score_office_xml(self, file_path: str) -> int:
        """
        Analyzes Office XML structure (unzipping headers).
        """
        score = 0

        try:
            with zipfile.ZipFile(file_path, "r") as z:
                file_list = z.namelist()

                has_charts = any("charts/" in name for name in file_list)
                has_embeddings = any("embeddings/" in name for name in file_list)

                if has_charts:
                    score += 50
                if has_embeddings:
                    score += 40
            return min(score, 100)
        except zipfile.BadZipFile:
            return 100  # Corrupted or password protected -> Hard

    def get_file_info(self, file_path: str) -> Tuple[int, str, bool]:
        mime_type = self._get_document_type(file_path=file_path)

        # --- PDF ---
        if mime_type == "application/pdf":
            score = self._score_pdf(file_path)
            return self._prepare_response(score, mime_type)

        # --- OFFICE DOCUMENTS (Word, PPT, Excel) ---
        # Note: Valid Office files are often identified as generic zip or octet-stream
        # if magic definitions are old, but usually they have specific VND types.
        if mime_type in [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",  # .doc (Legacy)
            "application/vnd.ms-excel",  # .xls (Legacy)
        ]:
            if "spreadsheet" in mime_type or "excel" in mime_type:
                return self._prepare_response(
                    10, mime_type
                )  # Low score -> Local Pandas
            return self._prepare_response(self._score_office_xml(file_path), mime_type)

        # --- TEXT / CSV ---
        if mime_type.startswith("text/") or mime_type == "application/csv":
            return self._prepare_response(0, mime_type)  # Text is always easy

        # --- IMAGES ---
        if mime_type.startswith("image/"):
            return self._prepare_response(
                100, mime_type
            )  # Images always need OCR -> Cloud

        # --- UNKNOWN / BINARY ---
        return self._prepare_response(100, mime_type)  # Safety fallback
