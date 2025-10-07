# File Upload Routes - Developer Guide

## 🎯 Overview

The file upload system has been redesigned to be more intuitive and developer-friendly. Instead of one generic upload endpoint, we now have entity-specific routes that make it clear what you're uploading and for which purpose.

## 🚀 New Route Structure

### 🐕 Pet File Routes

```
POST /api/files/pets/{petId}/profile     - Upload pet profile image
POST /api/files/pets/{petId}/gallery     - Upload multiple pet photos
POST /api/files/pets/{petId}/documents   - Upload pet documents (medical records, etc.)
DELETE /api/files/pets/{petId}/files     - Delete pet files
```

### 🏢 Business File Routes

```
POST /api/files/businesses/{businessId}/logo       - Upload business logo
POST /api/files/businesses/{businessId}/gallery    - Upload business gallery images
POST /api/files/businesses/{businessId}/documents  - Upload business documents (licenses, etc.)
DELETE /api/files/businesses/{businessId}/files    - Delete business files
```

### 👤 User File Routes

```
POST /api/files/users/profile       - Upload user profile image
POST /api/files/users/documents     - Upload user documents
DELETE /api/files/users/files       - Delete user files
```

### 🔗 Shared Utility Routes

```
GET /api/files/shared/signed-url     - Generate temporary signed URL for any file
GET /api/files/shared/metadata       - Get file metadata for any file
```

## 💡 Benefits of New Structure

### ✅ Before vs After

**Old (Confusing):**
```javascript
// What am I uploading? For what entity? What category?
POST /api/files/upload
{
  "image": file,
  "entityType": "pet",
  "entityId": "pet123",
  "category": "profile"
}
```

**New (Clear):**
```javascript
// Crystal clear: uploading a profile image for pet123
POST /api/files/pets/pet123/profile
{
  "image": file
}
```

### 🎯 Key Improvements

1. **Self-Documenting**: Route path tells you exactly what the endpoint does
2. **Type Safety**: Entity ID in URL path prevents mistakes
3. **Category Clarity**: Route structure makes file category obvious
4. **RESTful Design**: Follows REST conventions properly
5. **Easier Testing**: Specific endpoints are easier to test
6. **Better Documentation**: Swagger docs are cleaner and more focused

## 📖 Usage Examples

### Upload Pet Profile Image
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@buddy_photo.jpg" \
  https://api.yourapp.com/api/files/pets/pet123/profile
```

### Upload Business Gallery Images
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg" \
  https://api.yourapp.com/api/files/businesses/biz456/gallery
```

### Upload User Documents
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@my_document.pdf" \
  https://api.yourapp.com/api/files/users/documents
```

## 🔄 Migration Guide

### Frontend Updates Required

**Old Frontend Code:**
```javascript
// Old approach
const uploadPetPhoto = async (petId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('entityType', 'pet');
  formData.append('entityId', petId);
  formData.append('category', 'profile');

  return fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  });
};
```

**New Frontend Code:**
```javascript
// New approach - much cleaner!
const uploadPetPhoto = async (petId, file) => {
  const formData = new FormData();
  formData.append('image', file);

  return fetch(`/api/files/pets/${petId}/profile`, {
    method: 'POST',
    body: formData
  });
};
```

## 🛡️ Security & Permissions

- **Pet Owners**: Can upload/delete files for their own pets only
- **Business Owners**: Can upload/delete files for their own businesses only
- **Admins**: Can upload/delete files for any entity
- **File Ownership**: Automatic validation ensures users can only access their own files

## 🔧 File Type Constraints

| Entity Type | Category | Max Size | Allowed Types |
|-------------|----------|----------|---------------|
| Pet | Profile | 5MB | JPEG, PNG, WebP |
| Pet | Gallery | 5MB | JPEG, PNG, WebP |
| Pet | Documents | 20MB | PDF, DOC, DOCX, TXT |
| Business | Logo | 10MB | JPEG, PNG, WebP |
| Business | Gallery | 10MB | JPEG, PNG, WebP |
| Business | Documents | 20MB | PDF, DOC, DOCX, TXT |
| User | Profile | 2MB | JPEG, PNG, WebP |
| User | Documents | 20MB | PDF, DOC, DOCX, TXT |

## 🔄 Backward Compatibility

The old generic routes (`/upload`, `/upload-multiple`, etc.) are still available but marked as **deprecated**. They will be removed in a future version.

**Migration Timeline:**
- ✅ New routes available now
- ⚠️ Old routes deprecated (still working)
- 🗓️ Old routes will be removed in v2.0

## 🐛 Troubleshooting

### Common Issues

1. **404 Not Found**: Make sure you're using the correct entity ID in the URL path
2. **403 Forbidden**: User doesn't own the entity they're trying to upload to
3. **413 Payload Too Large**: File exceeds size limits for that entity type
4. **415 Unsupported Media Type**: File type not allowed for that category

### Debug Tips

- Check the entity ID is correct in the URL path
- Verify file type matches the endpoint (images vs documents)
- Ensure file size is within limits
- Confirm user has permission for that entity

## 🆘 Need Help?

If you encounter issues with the new route structure:
1. Check this guide first
2. Review the Swagger documentation at `/api-docs`
3. Check the server logs for detailed error messages
4. Contact the development team

---

*This guide covers the improved file upload routes. For other API endpoints, see the main API documentation.*