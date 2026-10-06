// Creates one admin account (or, with --reset, sets a new password on an existing one).
//   node scripts/createAdmin.js "Vincent" vincent@example.com 'vincent@ifoa'
//   node scripts/createAdmin.js "Vincent" vincent@example.com 'newpassword' --reset
// Writes to the database in MONGO_URI (backend/.env); the target host is printed first.
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Admin = require('../models/Admin')

async function run() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const reset = process.argv.includes('--reset')
  const [name, email, password] = args

  if (!name || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js "<name>" <email> <password> [--reset]')
    process.exit(1)
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.error('The second argument must be an email address: admins log in with their email.')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('The password must be at least 8 characters.')
    process.exit(1)
  }

  console.log(`target: ${(process.env.MONGO_URI || '').replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('?')[0]}`)
  await connectDB()

  const existing = await Admin.findOne({ email: email.toLowerCase() }).select('+password')
  if (existing && !reset) {
    console.log(`An admin with ${existing.email} already exists. Add --reset to change their password.`)
  } else if (existing) {
    existing.password = password
    existing.name = name
    await existing.save()
    console.log(`Updated password for ${existing.email}`)
  } else {
    const admin = await Admin.create({ name, email, password })
    console.log(`Created admin: ${admin.name} <${admin.email}>`)
  }
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
