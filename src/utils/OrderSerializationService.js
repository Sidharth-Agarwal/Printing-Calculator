import { doc, getDoc, updateDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebaseConfig';

class OrderSerializationService {
  /**
   * Generate a new order serial number
   * Format: FL-YYYY-NNNNN (e.g., FL-2025-00001)
   */
  static async generateOrderSerial() {
    try {
      const serialNumber = await runTransaction(db, async (transaction) => {
        const year = new Date().getFullYear();
        const prefix = `FL-${year}-`;
        
        const counterRef = doc(db, 'counters', 'orderSerial');
        const counterDoc = await transaction.get(counterRef);
        
        let nextNumber = 1;
        let counterData = {
          [year]: 0,
          totalGenerated: 0,
          lastUpdated: new Date().toISOString()
        };
        
        if (counterDoc.exists()) {
          counterData = counterDoc.data();
          nextNumber = (counterData[year] || 0) + 1;
        }
        
        // Update counter atomically
        counterData[year] = nextNumber;
        counterData.totalGenerated = (counterData.totalGenerated || 0) + 1;
        counterData.lastUpdated = new Date().toISOString();
        
        if (counterDoc.exists()) {
          transaction.update(counterRef, counterData);
        } else {
          transaction.set(counterRef, counterData);
        }
        
        const serialNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;
        console.log(`Generated order serial: ${serialNumber}`);
        return serialNumber;
      });
      
      return serialNumber;
    } catch (error) {
      console.error('Error generating order serial:', error);
      // Return null instead of throwing to prevent breaking existing flow
      return null;
    }
  }

  /**
   * Parse a serial number into its components
   */
  static parseSerialNumber(serialNumber) {
    if (!serialNumber) return null;
    
    const regex = /^FL-(\d{4})-(\d{5})$/;
    const match = serialNumber.match(regex);
    
    if (!match) return null;
    
    return {
      prefix: 'FL',
      year: parseInt(match[1]),
      sequence: parseInt(match[2]),
      fullSerial: serialNumber
    };
  }

  /**
   * Validate serial number format
   */
  static isValidSerial(serialNumber) {
    return this.parseSerialNumber(serialNumber) !== null;
  }

  /**
   * Get serialization statistics (useful for admin dashboard)
   */
  static async getSerializationStats() {
    try {
      const counterDoc = await getDoc(doc(db, 'counters', 'orderSerial'));
      const currentYear = new Date().getFullYear();
      
      if (!counterDoc.exists()) {
        return { currentYear: 0, total: 0, allYears: [] };
      }
      
      const data = counterDoc.data();
      const allYears = Object.keys(data)
        .filter(key => !isNaN(key))
        .map(year => ({
          year: parseInt(year),
          count: data[year]
        }))
        .sort((a, b) => b.year - a.year);
      
      return {
        currentYear: data[currentYear] || 0,
        total: data.totalGenerated || 0,
        allYears: allYears
      };
    } catch (error) {
      console.error('Error getting serialization stats:', error);
      return { currentYear: 0, total: 0, allYears: [] };
    }
  }

  /**
   * Initialize the counter document if it doesn't exist
   */
  static async initializeCounter() {
    try {
      const counterRef = doc(db, 'counters', 'orderSerial');
      const counterDoc = await getDoc(counterRef);
      
      if (!counterDoc.exists()) {
        const currentYear = new Date().getFullYear();
        await setDoc(counterRef, {
          [currentYear]: 0,
          totalGenerated: 0,
          lastUpdated: new Date().toISOString(),
          initialized: true
        });
        console.log('Order serial counter initialized');
      }
    } catch (error) {
      console.error('Error initializing counter:', error);
    }
  }
}

export default OrderSerializationService;