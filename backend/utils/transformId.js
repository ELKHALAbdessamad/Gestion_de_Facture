/**
 * Transforme _id en id pour la compatibilité avec le frontend
 */
export const addIdField = (doc) => {
  if (!doc) return doc;
  
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
};

/**
 * Transforme un tableau de documents
 */
export const addIdToArray = (docs) => {
  return docs.map(doc => addIdField(doc));
};
