from pathlib import Path
from typing import Literal

from pydantic import DirectoryPath, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # APP CONFIG
    APP_ENV: Literal["dev", "prod", "test"] = "dev"
    LOG_LEVEL: str = "INFO"

    # --- AWS S3 CONFIG ---
    AWS_ACCESS_KEY: SecretStr | None = None
    AWS_SECRET_KEY: SecretStr | None = None
    AWS_REGION: str = "eu-central-1"
    S3_BUCKET_NAME: str = "omni-rag-documents"

    # --- LLAMA CLOUD ---

    LLAMA_CLOUD_KEY: SecretStr | None = None

    # Optional field we need it for local usage of minio
    AWS_ENDPOINT_URL: str | None = None

    # Temp dir for files
    TEMP_DIR: DirectoryPath = Field(default=PROJECT_DIR / "temp_processing")

    # LLM Providers
    OPENAI_API_KEY: SecretStr | None = None
    GOOGLE_API_KEY: SecretStr | None = None

    # Vector DB
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    # Redis (Celery broker / backend). REDIS_DB must be an integer (e.g. 0).
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: SecretStr | None = None
    CELERY_QUEUE_INGESTION: str = "ingestion"

    @field_validator("REDIS_DB", mode="before")
    @classmethod
    def _redis_db_int(cls, v: object) -> int:
        if isinstance(v, int):
            return v
        if isinstance(v, str) and v.isdigit():
            return int(v)
        return 0  # fallback if e.g. REDIS_DB=redis by mistake

    # Postgres DB
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASS: SecretStr = Field(default=SecretStr("password"))
    POSTGRES_DB: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    @property
    def redis_url(self) -> str:
        auth = ""
        if self.REDIS_PASSWORD is not None:
            raw = self.REDIS_PASSWORD.get_secret_value()
            if isinstance(raw, str) and raw.strip():
                auth = f":{raw}@"
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASS.get_secret_value()}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )


settings = Settings()
