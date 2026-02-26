from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # App Config
    project_name: str = "UniGPT"
    environment: str = "development"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Supabase (Auth & Core Data)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Pinecone (Fast Vector Search)
    pinecone_api_key: str = ""
    pinecone_index_name: str = "unigpt-index"

    # LLM (Generation via OpenRouter)
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-70b-instruct"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Embeddings (Local HuggingFace model)
    embedding_model_name: str = "all-MiniLM-L6-v2"

    # Dev flags
    mock_llm: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
