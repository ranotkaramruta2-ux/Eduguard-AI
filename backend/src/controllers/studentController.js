import Student from '../models/Student.js';
import User from '../models/User.js';
import { parseCSVFile, validateStudentCSV } from '../utils/csvParser.js';
import { cleanupFile } from '../services/csvUploadService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Add a new student
 * @route   POST /api/students
 * @access  Private (Teacher only)
 */
export const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      phoneNumber,
      attendancePercentage,
      internalMarks,
      assignmentCompletion,
      familyIncome,
      travelDistance,
      previousFailures,
      engagementScore,
      userId,
    } = req.body;

    // Validation
    if (
      !name ||
      !rollNumber ||
      attendancePercentage === undefined ||
      internalMarks === undefined ||
      assignmentCompletion === undefined ||
      familyIncome === undefined ||
      travelDistance === undefined ||
      previousFailures === undefined ||
      engagementScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required student information',
      });
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists',
      });
    }

    // Create student
    const student = await Student.create({
      name,
      rollNumber,
      email,
      phoneNumber,
      attendancePercentage,
      internalMarks,
      assignmentCompletion,
      familyIncome,
      travelDistance,
      previousFailures,
      engagementScore,
      teacherId: req.user._id,
      userId,
    });

    logger.success(`New student added: ${name} (${rollNumber}) by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
export const getAllStudents = async (req, res) => {
  try {
    let query = {};

    // If teacher, show only their students
    if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    }

    // If counselor, show only assigned students
    if (req.user.role === 'counselor') {
      query.counselorId = req.user._id;
    }

    // If student, show only their own record
    if (req.user.role === 'student') {
      query.userId = req.user._id;
    }

    const students = await Student.find(query)
      .populate('teacherId', 'name email')
      .populate('counselorId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('counselorId', 'name email')
      .populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check
    if (
      req.user.role === 'teacher' &&
      student.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    if (
      req.user.role === 'counselor' &&
      (!student.counselorId || student.counselorId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    if (
      req.user.role === 'student' &&
      student.userId &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    logger.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Teacher only)
 */
export const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check - only teacher who added can update
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this student',
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Student updated: ${student.rollNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Teacher only)
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this student',
      });
    }

    await student.deleteOne();

    logger.info(`Student deleted: ${student.rollNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload CSV dataset and add multiple students
 * @route   POST /api/students/upload-csv
 * @access  Private (Teacher only)
 */
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file',
      });
    }

    const filePath = req.file.path;

    // Parse CSV file
    const parsedData = await parseCSVFile(filePath);

    // Validate CSV data
    const validation = validateStudentCSV(parsedData);

    if (!validation.isValid) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV data',
        errors: validation.errors,
      });
    }

    // Add teacherId to each student
    const studentsToAdd = validation.validData.map((student) => ({
      ...student,
      teacherId: req.user._id,
    }));

    // Bulk insert students
    const students = await Student.insertMany(studentsToAdd, { ordered: false });

    // Clean up uploaded file
    cleanupFile(filePath);

    logger.success(
      `${students.length} students uploaded from CSV by ${req.user.email}`
    );

    res.status(201).json({
      success: true,
      message: `${students.length} students added successfully`,
      data: students,
    });
  } catch (error) {
    // Clean up file even if there's an error
    if (req.file) {
      cleanupFile(req.file.path);
    }

    logger.error('CSV upload error:', error);

    // Handle duplicate key errors in bulk insert
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some students already exist (duplicate roll numbers)',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading CSV',
      error: error.message,
    });
  }
};
