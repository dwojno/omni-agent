from pathlib import Path
from typing import Literal

from pydantic import DirectoryPath, Field, SecretStr
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
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD.get_secret_value()}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )


settings = Settings()
