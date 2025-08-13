from django.db import models
from django.conf import settings
from django.utils.text import slugify
import os

class Document(models.Model):
    """
    Model to store uploaded documents with metadata
    """
    DOCUMENT_TYPES = [
        ('pdf', 'PDF'),
        ('doc', 'Word Document'),
        ('docx', 'Word Document (New)'),
        ('xls', 'Excel Spreadsheet'),
        ('xlsx', 'Excel Spreadsheet (New)'),
        ('ppt', 'PowerPoint Presentation'),
        ('pptx', 'PowerPoint Presentation (New)'),
        ('txt', 'Text File'),
        ('other', 'Other')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPES)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    tags = models.ManyToManyField('DocumentTag', blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return self.title

    def get_file_extension(self):
        """Returns the file extension in lowercase"""
        name, extension = os.path.splitext(self.file.name)
        return extension[1:].lower()

    def save(self, *args, **kwargs):
        """Override save to set document type based on file extension if not set"""
        if not self.document_type:
            ext = self.get_file_extension()
            # Map common extensions to document types
            ext_to_type = {
                'pdf': 'pdf',
                'doc': 'doc',
                'docx': 'docx',
                'xls': 'xls',
                'xlsx': 'xlsx',
                'ppt': 'ppt',
                'pptx': 'pptx',
                'txt': 'txt'
            }
            self.document_type = ext_to_type.get(ext, 'other')
        super().save(*args, **kwargs)

class DocumentTag(models.Model):
    """
    Tags for categorizing documents
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
