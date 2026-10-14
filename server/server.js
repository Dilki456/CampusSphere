const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Student = require('./models/Student')
const Course = require('./models/Course')
const Assignment = require('./models/Assignment')
const Timetable = require('./models/Timetable')
const Result = require('./models/Result')
const Announcement = require('./models/Announcement')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/campussphere')
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((error) =>
    console.error('MongoDB connection error:', error)
  )

app.post('/api/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ['Admin', 'Lecturer'] },
    }).select('+password')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured.',
      })
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
    })
  }
})

const verifyStaff = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please login first.',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!['Admin', 'Lecturer'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      })
    }

    req.staff = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired login token.',
    })
  }
}

const adminOnly = (req, res, next) => {
  if (req.staff?.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    })
  }

  next()
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CampusSphere Backend API!',
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CampusSphere API is working correctly!',
  })
})

// ==============================
// STUDENT MANAGEMENT
// ==============================

// Register student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body)
    const savedStudent = await student.save()

    res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      student: savedStudent,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find()

    res.json({
      success: true,
      students,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Get one student
app.get('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      })
    }

    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      })
    }

    res.json({
      success: true,
      student,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Update student profile
app.put('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      })
    }

    const { name, email, studentId, course } = req.body
    const updates = {}

    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (studentId !== undefined) updates.studentId = studentId
    if (course !== undefined) updates.course = course

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      })
    }

    res.json({
      success: true,
      message: 'Student profile updated successfully!',
      student,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// ==============================
// COURSES MANAGEMENT
// ==============================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 })

    res.json({
      success: true,
      courses,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Add a course
app.post('/api/courses', async (req, res) => {
  try {
    const { courseCode, courseName, description, duration } = req.body

    if (
      !courseCode?.trim() ||
      !courseName?.trim() ||
      !duration?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Course code, name and duration are required.',
      })
    }

    const course = new Course({
      courseCode,
      courseName,
      description,
      duration,
    })

    const savedCourse = await course.save()

    res.status(201).json({
      success: true,
      message: 'Course added successfully!',
      course: savedCourse,
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? 'This course code already exists.'
          : error.message,
    })
  }
})

// Update a course
app.put('/api/courses/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      })
    }

    const { courseCode, courseName, description, duration } = req.body
    const updates = {}

    if (courseCode !== undefined) updates.courseCode = courseCode
    if (courseName !== undefined) updates.courseName = courseName
    if (description !== undefined) updates.description = description
    if (duration !== undefined) updates.duration = duration

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    res.json({
      success: true,
      message: 'Course updated successfully!',
      course,
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? 'This course code already exists.'
          : error.message,
    })
  }
})

// Delete a course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      })
    }

    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    res.json({
      success: true,
      message: 'Course deleted successfully!',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// ==============================
// ASSIGNMENTS MANAGEMENT
// ==============================

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1 })

    res.json({
      success: true,
      assignments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Add a new assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const { title, course, description, dueDate, status } = req.body

    if (!title?.trim() || !course?.trim() || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, course and due date are required.',
      })
    }

    if (Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid due date.',
      })
    }

    const assignment = new Assignment({
      title,
      course,
      description,
      dueDate,
      status,
    })

    const savedAssignment = await assignment.save()

    res.status(201).json({
      success: true,
      message: 'Assignment added successfully!',
      assignment: savedAssignment,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Update an assignment
app.put('/api/assignments/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID',
      })
    }

    const { title, course, description, dueDate, status } = req.body
    const updates = {}

    if (title !== undefined) updates.title = title
    if (course !== undefined) updates.course = course
    if (description !== undefined) updates.description = description
    if (dueDate !== undefined) updates.dueDate = dueDate
    if (status !== undefined) updates.status = status

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      })
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully!',
      assignment,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
})

// Delete an assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID',
      })
    }

    const assignment = await Assignment.findByIdAndDelete(req.params.id)

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      })
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully!',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

/* ==============================
   TIMETABLE MANAGEMENT
============================== */

// Get all timetable classes
app.get('/api/timetable', async (req, res) => {
  try {
    const classes = await Timetable.find().sort({
      day: 1,
      startTime: 1,
    });

    res.json({
      success: true,
      timetable: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add a timetable class
app.post('/api/timetable', async (req, res) => {
  try {
    const { subject, day, startTime, endTime, location } = req.body;

    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Subject, day, start time and end time are required.',
      });
    }

    const newClass = new Timetable({
      subject,
      day,
      startTime,
      endTime,
      location,
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      success: true,
      message: 'Timetable class saved successfully!',
      timetable: savedClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update a timetable class
app.put('/api/timetable/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timetable ID.',
      });
    }

    const { subject, day, startTime, endTime, location } = req.body;
    const updates = {};

    if (subject !== undefined) updates.subject = subject;
    if (day !== undefined) updates.day = day;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (location !== undefined) updates.location = location;

    const updatedClass = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Timetable class not found.',
      });
    }

    res.json({
      success: true,
      message: 'Timetable class updated successfully!',
      timetable: updatedClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete a timetable class
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timetable ID.',
      });
    }

    const deletedClass = await Timetable.findByIdAndDelete(
      req.params.id
    );

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Timetable class not found.',
      });
    }

    res.json({
      success: true,
      message: 'Timetable class deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json({
      success: true,
      result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.put('/api/results/:id', async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.delete('/api/results/:id', async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


const announcementAdminOnly = verifyStaff;

// Students can view announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error('Load announcements error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load announcements',
    });
  }
});

// Admin and Lecturer can create announcements
app.post(
  '/api/announcements',
  announcementAdminOnly,
  async (req, res) => {
    try {
      const { title, message, category } = req.body;

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof message !== 'string' ||
        !message.trim() ||
        typeof category !== 'string' ||
        !category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Title, message and category are required.',
        });
      }

      const staff = await User.findById(req.staff.id);

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: 'Staff account not found.',
        });
      }

      const announcement = await Announcement.create({
        title: title.trim(),
        message: message.trim(),
        category: category.trim(),
        author: staff.name,
      });

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully.',
        announcement,
      });
    } catch (error) {
      console.error('Create announcement error:', error);

      res.status(400).json({
        success: false,
        message: 'Failed to create announcement.',
      });
    }
  }
);

// Admin and Lecturer can edit announcements
app.put(
  '/api/announcements/:id',
  announcementAdminOnly,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid announcement ID.',
        });
      }

      const { title, message, category } = req.body;
      const updates = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Title cannot be empty.',
          });
        }
        updates.title = title.trim();
      }

      if (message !== undefined) {
        if (typeof message !== 'string' || !message.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Message cannot be empty.',
          });
        }
        updates.message = message.trim();
      }

      if (category !== undefined) {
        if (typeof category !== 'string' || !category.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be empty.',
          });
        }
        updates.category = category.trim();
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid changes provided.',
        });
      }

      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found.',
        });
      }

      res.json({
        success: true,
        message: 'Announcement updated successfully.',
        announcement,
      });
    } catch (error) {
      console.error('Update announcement error:', error);

      res.status(400).json({
        success: false,
        message: 'Failed to update announcement.',
      });
    }
  }
);

// Admin and Lecturer can delete announcements
app.delete(
  '/api/announcements/:id',
  announcementAdminOnly,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid announcement ID.',
        });
      }

      const announcement = await Announcement.findByIdAndDelete(
        req.params.id
      );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found.',
        });
      }

      res.json({
        success: true,
        message: 'Announcement deleted successfully.',
      });
    } catch (error) {
      console.error('Delete announcement error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement.',
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`CampusSphere server running at http://localhost:${PORT}`)
})