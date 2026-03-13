import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * Parse CSV file and return array of objects
 * @param {String} filePath - Path to CSV file
 * @returns {Promise<Array>} Array of parsed objects
 */
export const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Parse CSV buffer and return array of objects
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Array of parsed objects
 */
export const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Validate CSV data structure for student records
 * @param {Array} data - Parsed CSV data
 * @returns {Object} Validation result
 */
export const validateStudentCSV = (data) => {
  const requiredFields = [
    'name',
    'rollNumber',
    'attendancePercentage',
    'internalMarks',
    'assignmentCompletion',
    'familyIncome',
    'travelDistance',
    'previousFailures',
    'engagementScore',
  ];

  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
      errors.push({
        row: index + 1,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    } else {
      // Convert numeric fields
      try {
        validData.push({
          name: row.name.trim(),
          rollNumber: row.rollNumber.trim().toUpperCase(),
          email: row.email?.trim() || undefined,
          phoneNumber: row.phoneNumber?.trim() || undefined,
          attendancePercentage: parseFloat(row.attendancePercentage),
          internalMarks: parseFloat(row.internalMarks),
          assignmentCompletion: parseFloat(row.assignmentCompletion),
          familyIncome: parseFloat(row.familyIncome),
          travelDistance: parseFloat(row.travelDistance),
          previousFailures: parseInt(row.previousFailures),
          engagementScore: parseFloat(row.engagementScore),
        });
      } catch (err) {
        errors.push({
          row: index + 1,
          message: `Invalid data format: ${err.message}`,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validData,
  };
};
