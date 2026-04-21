from sentence_transformers import SentenceTransformer
import chromadb

CHROMA_PATH = "./chroma_store"
model = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection("cbt_knowledge")

def retrieve_context(query: str, concerns: list[str], top_k: int = 4) -> str:
    # Enrich query with user concerns for better retrieval
    enriched_query = f"{query} {' '.join(concerns)}"
    embedding = model.encode(enriched_query).tolist()

    results = collection.query(
        query_embeddings=[embedding],
        n_results=top_k
    )

    chunks = results["documents"][0]
    return "\n\n---\n\n".join(chunks)