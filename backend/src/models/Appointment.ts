import { Schema, model, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientName: string;
  mobileNumber: string;
  date: Date;
  slot: 'morning' | 'evening';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientName: { 
    type: String, 
    required: true,
    trim: true
  },
  mobileNumber: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  slot: { 
    type: String, 
    required: true, 
    enum: ['morning', 'evening'] 
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate appointment for the SAME patient on the SAME date & slot
AppointmentSchema.index({ patientName: 1, mobileNumber: 1, date: 1, slot: 1 }, { unique: true });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
