import sys
print(f"Python version: {sys.version}")
try:
    import fastapi
    print("fastapi imported")
    import pydantic_settings
    print("pydantic_settings imported")
    import supabase
    print("supabase imported")
    import pinecone
    print("pinecone imported")
    import sentence_transformers
    print("sentence_transformers imported")
except ImportError as e:
    print(f"Import error: {e}")
except Exception as e:
    print(f"Other error: {e}")
