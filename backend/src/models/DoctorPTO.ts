import { Schema, model, Document } from 'mongoose';

export interface IDoctorPTO extends Document {
  doctorName: string;
  date: Date;
  slot: 'morning' | 'evening';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorPTOSchema = new Schema<IDoctorPTO>({
  doctorName: { 
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
  },
  reason: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate PTO bookings for the same doctor, date, and slot
DoctorPTOSchema.index({ doctorName: 1, date: 1, slot: 1 }, { unique: true });

export const DoctorPTO = model<IDoctorPTO>('DoctorPTO', DoctorPTOSchema);
