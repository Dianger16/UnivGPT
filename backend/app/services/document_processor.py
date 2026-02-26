"""
Document Processing Service
Handles file text extraction, chunking, and HuggingFace embedding generation.
Stores chunks in Pinecone for vector search.
"""

import io
import uuid
import logging
from typing import Optional

from app.config import settings
from app.services.pinecone_client import pinecone_client

logger = logging.getLogger(__name__)


# ─── Text Extraction ───

def extract_text_from_pdf(file_bytes: bytes) -> str:
    import pdfplumber
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n\n".join(para.text for para in doc.paragraphs if para.text.strip())


def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="replace")


def extract_text(file_bytes: bytes, filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif lower.endswith(".txt") or lower.endswith(".md"):
        return extract_text_from_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {filename}")


# ─── Text Chunking ───

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size

        if end < len(text):
            for sep in [". ", "\n\n", "\n", " "]:
                last_sep = text[start:end].rfind(sep)
                if last_sep > chunk_size * 0.5:
                    end = start + last_sep + len(sep)
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


# ─── Embedding Generation ───

def get_huggingface_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings using HuggingFace sentence-transformers.
    Model: all-MiniLM-L6-v2 (384 dimensions)
    """
    if settings.mock_llm:
        import numpy as np
        return [np.random.randn(384).tolist() for _ in texts]

    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings_model = HuggingFaceEmbeddings(
        model_name=settings.embedding_model_name
    )

    return embeddings_model.embed_documents(texts)


def get_single_embedding(text: str) -> list[float]:
    if settings.mock_llm:
        import numpy as np
        return np.random.randn(384).tolist()

    from langchain_huggingface import HuggingFaceEmbeddings
    embeddings_model = HuggingFaceEmbeddings(
        model_name=settings.embedding_model_name
    )
    return embeddings_model.embed_query(text)


# ─── Full Processing Pipeline ───

async def process_document(
    file_bytes: bytes,
    filename: str,
    document_id: str,
    doc_type: str,
    department: str,
    course: str,
    tags: list[str],
    metadata: dict = None,
) -> dict:
    if metadata is None:
        metadata = {}
    
    # 1. Extract & Chunk text
    full_text = extract_text(file_bytes, filename)
    chunks = chunk_text(full_text)

    if not chunks:
        return {"chunk_count": 0, "embedding_count": 0, "text_length": 0}

    # 2. Generate HuggingFace Embeddings synchronously
    embeddings = get_huggingface_embeddings(chunks)

    # 3. Upsert to Pinecone
    if pinecone_client.index:
        vectors_to_upsert = []
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            vector_id = f"doc_{document_id}_chunk_{i}"
            vector_meta = {
                "document_id": document_id,
                "filename": filename,
                "role": doc_type,
                "department": department or "",
                "course": course or "",
                "chunk_index": i,
                "content": chunk, # Store actual text content directly in vector DB
            }
            # Inject extra metadata like release_date, deadline if present
            for k, v in metadata.items():
                if isinstance(v, (str, int, float, bool)):
                    vector_meta[k] = v

            vectors_to_upsert.append({
                "id": vector_id,
                "values": vector,
                "metadata": vector_meta
            })
            
        # Upsert in batches of 100 for safety
        batch_size = 100
        for i in range(0, len(vectors_to_upsert), batch_size):
            pinecone_client.index.upsert(vectors=vectors_to_upsert[i:i + batch_size])
    else:
        logger.warning(f"Pinecone client not initialized. Skipping embedding upsert for {filename}")

    # Note: Document metadata is stored separately in Supabase (handled in the router)

    return {
        "chunk_count": len(chunks),
        "embedding_count": len(embeddings),
        "text_length": len(full_text),
    }
