import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb

KNOWLEDGE_DIR = "./knowledge_base"
CHROMA_PATH = "./chroma_store"

def ingest():
    # Load all PDFs
    docs = []
    for file in os.listdir(KNOWLEDGE_DIR):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(KNOWLEDGE_DIR, file))
            docs.extend(loader.load())

    # Chunk documents
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(docs)

    # Embed + store in ChromaDB
    model = SentenceTransformer("all-MiniLM-L6-v2")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection("cbt_knowledge")

    for i, chunk in enumerate(chunks):
        embedding = model.encode(chunk.page_content).tolist()
        collection.add(
            documents=[chunk.page_content],
            embeddings=[embedding],
            ids=[f"chunk_{i}"]
        )

    print(f"Ingested {len(chunks)} chunks successfully")

if __name__ == "__main__":
    ingest()