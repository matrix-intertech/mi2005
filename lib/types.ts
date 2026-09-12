import type { ObjectId } from "mongodb";

export type EnquiryStatus = "new" | "read" | "archived";
export type CareerStatus = "open" | "closed";
export type ApplicationStatus = "new" | "reviewed" | "archived";

export interface RequiredApplicationFields {
  phone?: boolean;
  email?: boolean;
  portfolioOrResumeUrl?: boolean;
  experience?: boolean;
  coverLetter?: boolean;
}

export interface Enquiry {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  projectType?: string;
  location?: string;
  approxArea?: string;
  message: string;
  status: EnquiryStatus;
  source: "contact" | "project-enquiry";
  createdAt: Date;
  updatedAt?: Date;
}

export interface CareerOpening {
  _id?: ObjectId;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: string;
  summary: string;
  responsibilities: string;
  requirements: string;
  requiredFields?: RequiredApplicationFields;
  status: CareerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerApplication {
  _id?: ObjectId;
  careerId: ObjectId;
  role: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  portfolioOrResumeUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  message: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt?: Date;
}
