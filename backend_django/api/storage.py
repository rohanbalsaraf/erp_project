import os
import uuid
from django.conf import settings

def upload_to_supabase(file_obj, bucket_name="erp_documents"):
    """
    Uploads a file to Supabase Storage and returns the public URL.
    """
    if not settings.supabase:
        print("Supabase client not initialized")
        return None

    try:
        # Generate a unique filename
        ext = os.path.splitext(file_obj.name)[1]
        filename = f"{uuid.uuid4()}{ext}"
        
        # Read file content
        content = file_obj.read()
        
        # Upload to Supabase
        res = settings.supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=content,
            file_options={"content-type": getattr(file_obj, 'content_type', 'application/octet-stream')}
        )
        
        # Get public URL
        url = settings.supabase.storage.from_(bucket_name).get_public_url(filename)
        return url
        
    except Exception as e:
        print(f"Cloud upload failed: {str(e)}")
        return None
