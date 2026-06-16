// Middleware pour transformer _id en id pour la compatibilité frontend
export const transformMongoId = (doc) => {
  if (!doc) return doc;
  
  if (Array.isArray(doc)) {
    return doc.map(item => transformMongoId(item));
  }
  
  if (doc._id) {
    const transformed = doc.toObject ? doc.toObject() : { ...doc };
    transformed.id = transformed._id.toString();
    return transformed;
  }
  
  return doc;
};

// Middleware Express pour transformer automatiquement les réponses
export const transformResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    const transformed = transformMongoId(data);
    return originalJson.call(this, transformed);
  };
  
  next();
};
