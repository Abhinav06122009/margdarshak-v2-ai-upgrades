import os
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

# CONFIGURATION
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Use a better model locally or call Cloudflare via API
# For local high-quality embeddings:
model = SentenceTransformer('BAAI/bge-base-en-v1.5')

def ingest_pdf(file_path, subject, chapter):
    print(f"Processing {file_path}...")
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    # LEVEL 1: SMART CHUNKING (Overlap + Token limit)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,      # ~400-500 tokens
        chunk_overlap=100,   # 15% overlap
        separators=["\n\n", "\n", " ", ""]
    )
    
    docs = text_splitter.split_documents(pages)
    
    for doc in docs:
        content = doc.page_content
        page_num = doc.metadata.get("page", 0) + 1
        
        # Generate High-Quality Embedding
        embedding = model.encode(content).tolist()
        
        data = {
            "content": content,
            "embedding": embedding,
            "subject": subject,
            "chapter": chapter,
            "page_number": page_num,
            "source_file": os.path.basename(file_path)
        }
        
        supabase.table("pcmb_knowledge").insert(data).execute()
        print(f"Inserted chunk from Page {page_num}")

# Example Usage
ingest_pdf("physics_ch1.pdf", "Physics", "Units & Measurements")