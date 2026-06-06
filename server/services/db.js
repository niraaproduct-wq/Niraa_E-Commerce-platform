const { getFirebase } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Reusable Database Service Layer
 * Abstracts Cloud Firestore operations to provide a clean, secure, and mockable data access layer.
 */
class DbService {
  /**
   * Get the active Firestore database instance
   */
  get db() {
    return getFirebase().db;
  }

  /**
   * Fetch a single document by collection and ID
   * @param {string} collection 
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async getById(collection, id) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`[DbService] Error fetching from ${collection}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document with an auto-generated or specified ID
   * @param {string} collection 
   * @param {object} data 
   * @param {string} [id] Optional pre-defined ID
   * @returns {Promise<string>} Created document ID
   */
  async create(collection, data, id = null) {
    try {
      const docRef = id 
        ? this.db.collection(collection).doc(id)
        : this.db.collection(collection).doc();
      
      const timestamp = new Date().toISOString();
      const payload = {
        ...data,
        createdAt: data.createdAt || timestamp,
        updatedAt: timestamp
      };

      await docRef.set(payload);
      return docRef.id;
    } catch (error) {
      logger.error(`[DbService] Error creating doc in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document fields
   * @param {string} collection 
   * @param {string} id 
   * @param {object} data 
   * @returns {Promise<boolean>}
   */
  async update(collection, id, data) {
    try {
      const docRef = this.db.collection(collection).doc(id);
      const timestamp = new Date().toISOString();
      await docRef.update({
        ...data,
        updatedAt: timestamp
      });
      return true;
    } catch (error) {
      logger.error(`[DbService] Error updating ${collection}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collection 
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async delete(collection, id) {
    try {
      await this.db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      logger.error(`[DbService] Error deleting ${collection}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Perform a simple query with single where filter
   * @param {string} collection 
   * @param {string} field 
   * @param {string} op 
   * @param {any} value 
   * @returns {Promise<array>}
   */
  async querySimple(collection, field, op, value) {
    try {
      const snapshot = await this.db.collection(collection).where(field, op, value).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error(`[DbService] Error querying ${collection} by ${field}:`, error);
      throw error;
    }
  }

  /**
   * Run a transaction safely with a callback
   * @param {function} callback 
   * @returns {Promise<any>}
   */
  async runTransaction(callback) {
    try {
      return await this.db.runTransaction(callback);
    } catch (error) {
      logger.error('[DbService] Transaction failure:', error);
      throw error;
    }
  }
}

module.exports = new DbService();
