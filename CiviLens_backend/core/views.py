from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json

# Import the database connection from db_connection.py
from db_connection import db

# Example view to test MongoDB connection
@csrf_exempt
def test_mongodb_connection(request):
    try:
        # Test the connection by getting database info
        db_info = db.command("ping")
        return JsonResponse({
            "status": "success",
            "message": "MongoDB connection successful",
            "db_info": db_info
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"MongoDB connection failed: {str(e)}"
        })

class SampleDataView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get(self, request):
        try:
            # Example: Retrieve data from a collection
            collection = db['sample_collection']
            data = list(collection.find({}, {'_id': 0}))  # Exclude _id field
            return JsonResponse({
                "status": "success",
                "data": data
            })
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            })
    
    def post(self, request):
        try:
            # Example: Insert data into a collection
            data = json.loads(request.body)
            collection = db['sample_collection']
            result = collection.insert_one(data)
            return JsonResponse({
                "status": "success",
                "message": "Data inserted successfully",
                "inserted_id": str(result.inserted_id)
            })
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            })
