from django.forms.models import model_to_dict

def to_dict(instance, fields=None):
    try:
        data = model_to_dict(instance)
    except Exception:
        # fallback for Djongo or complex fields
        data = {}
        for f in instance._meta.fields:
            name = f.name
            try:
                data[name] = getattr(instance, name)
            except Exception:
                data[name] = None
    if fields:
        return {k: data.get(k) for k in fields}
    return data
