
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
require('dotenv').config()

async function createStaff() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campussphere'
    )

    const name = process.env.STAFF_NAME
    const email = process.env.STAFF_EMAIL
    const password = process.env.STAFF_PASSWORD
    const role = process.env.STAFF_ROLE

    if (!name || !email || !password || !['Admin', 'Lecturer'].includes(role)) {
      throw new Error(
        'Set STAFF_NAME, STAFF_EMAIL, STAFF_PASSWORD and STAFF_ROLE in server/.env'
      )
    }

    if (password.length < 12) {
      throw new Error('Use a password with at least 12 characters.')
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      throw new Error('An account with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    })

    console.log(`${role} account created successfully.`)
  } catch (error) {
    console.error('Account creation failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

createStaff()
