def to_dict(instance, fields=None):
    # For MongoDB documents, simply return the document
    # Remove the _id field and replace with id
    if '_id' in instance:
        instance['id'] = str(instance['_id'])
        del instance['_id']
    
    # If specific fields are requested, filter the document
    if fields:
        filtered_data = {}
        for field in fields:
            if field in instance:
                filtered_data[field] = instance[field]
        return filtered_data
    
    return instance
