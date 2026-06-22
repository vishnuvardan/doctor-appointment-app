import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { DoctorPTO } from '../models/DoctorPTO';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing DoctorPTO records...');
    await DoctorPTO.deleteMany({});

    console.log('Inserting 5 sample DoctorPTO rows...');
    const samplePTOs = [
      {
        doctorName: 'Dr. Smith',
        date: new Date('2026-06-25T00:00:00.000Z'),
        slot: 'morning',
        reason: 'Personal Errands'
      },
      {
        doctorName: 'Dr. Smith',
        date: new Date('2026-06-25T00:00:00.000Z'),
        slot: 'evening',
        reason: 'Personal Errands'
      },
      {
        doctorName: 'Dr. Adams',
        date: new Date('2026-06-26T00:00:00.000Z'),
        slot: 'morning',
        reason: 'Medical Conference'
      },
      {
        doctorName: 'Dr. John Doe',
        date: new Date('2026-06-28T00:00:00.000Z'),
        slot: 'morning',
        reason: 'Weekly Day Off'
      },
      {
        doctorName: 'Dr. John Doe',
        date: new Date('2026-06-30T00:00:00.000Z'),
        slot: 'evening',
        reason: 'Dental Appointment'
      }
    ];

    await DoctorPTO.insertMany(samplePTOs);
    console.log('Database seeded successfully with 5 sample rows!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
