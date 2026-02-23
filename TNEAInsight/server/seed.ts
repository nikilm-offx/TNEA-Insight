// Data seeding script for TNEA Insight application
import { db } from "./db";
import { 
  users, 
  colleges, 
  branches, 
  collegeBranches,
  cutoffHistory,
  placements 
} from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Sample TNEA colleges data
const collegesData = [
  { name: "Anna University - College of Engineering Guindy (CEG)", location: "Chennai", type: "government", established: 1794 },
  { name: "PSG College of Technology", location: "Coimbatore", type: "private", established: 1951 },
  { name: "Thiagarajar College of Engineering", location: "Madurai", type: "private", established: 1957 },
  { name: "SSN College of Engineering", location: "Chennai", type: "private", established: 1996 },
  { name: "Madras Institute of Technology (MIT)", location: "Chennai", type: "government", established: 1949 },
  { name: "National Institute of Technology Tiruchirappalli (NIT)", location: "Tiruchirappalli", type: "central", established: 1964 },
  { name: "Kumaraguru College of Technology", location: "Coimbatore", type: "private", established: 1984 },
  { name: "Sri Venkateswara College of Engineering", location: "Chennai", type: "private", established: 1985 },
  { name: "Hindustan Institute of Technology and Science", location: "Chennai", type: "private", established: 1985 },
  { name: "VIT Chennai", location: "Chennai", type: "private", established: 2010 },
  { name: "SRM Institute of Science and Technology", location: "Chennai", type: "private", established: 1985 },
  { name: "Coimbatore Institute of Technology", location: "Coimbatore", type: "private", established: 1956 },
  { name: "Kongu Engineering College", location: "Erode", type: "private", established: 1984 },
  { name: "Bannari Amman Institute of Technology", location: "Erode", type: "private", established: 1996 },
  { name: "St. Joseph's College of Engineering", location: "Chennai", type: "private", established: 1994 }
];

// Engineering branches data
const branchesData = [
  { name: "Computer Science and Engineering", code: "CSE", category: "engineering" },
  { name: "Electronics and Communication Engineering", code: "ECE", category: "engineering" },
  { name: "Mechanical Engineering", code: "MECH", category: "engineering" },
  { name: "Civil Engineering", code: "CIVIL", category: "engineering" },
  { name: "Electrical and Electronics Engineering", code: "EEE", category: "engineering" },
  { name: "Information Technology", code: "IT", category: "engineering" },
  { name: "Automobile Engineering", code: "AUTO", category: "engineering" },
  { name: "Chemical Engineering", code: "CHEM", category: "engineering" },
  { name: "Aeronautical Engineering", code: "AERO", category: "engineering" },
  { name: "Biomedical Engineering", code: "BME", category: "engineering" },
  { name: "Biotechnology", code: "BIOTECH", category: "engineering" },
  { name: "Instrumentation and Control Engineering", code: "ICE", category: "engineering" }
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Seed admin and sample users
    console.log("Seeding users...");
    const adminPassword = await hashPassword("admin123");
    const studentPassword = await hashPassword("student123");

    await db.insert(users).values([
      {
        username: "admin",
        password: adminPassword,
        role: "admin",
        fullName: "TNEA Administrator",
        email: "admin@tnea.gov.in"
      },
      {
        username: "student_demo",
        password: studentPassword,
        role: "student",
        fullName: "Demo Student",
        email: "demo@student.com"
      }
    ]);

    // Seed branches first (referenced by collegeBranches)
    console.log("Seeding branches...");
    const insertedBranches = await db.insert(branches).values(branchesData).returning();

    // Seed colleges
    console.log("Seeding colleges...");
    const insertedColleges = await db.insert(colleges).values(collegesData).returning();

    // Seed college branches (many-to-many relationship)
    console.log("Seeding college branches...");
    const collegeBranchesData = [];
    
    for (const college of insertedColleges) {
      // Each college offers different branches with different seat capacities
      const availableBranches = insertedBranches.slice(0, Math.floor(Math.random() * 8) + 4); // 4-12 branches per college
      
      for (const branch of availableBranches) {
        const totalSeats = Math.floor(Math.random() * 100) + 30; // 30-130 seats
        collegeBranchesData.push({
          collegeId: college.id,
          branchId: branch.id,
          totalSeats,
          generalSeats: Math.floor(totalSeats * 0.5),
          obcSeats: Math.floor(totalSeats * 0.27),
          scSeats: Math.floor(totalSeats * 0.15),
          stSeats: Math.floor(totalSeats * 0.08)
        });
      }
    }

    await db.insert(collegeBranches).values(collegeBranchesData);

    // Seed historical cutoff data
    console.log("Seeding cutoff history...");
    const cutoffData = [];
    const years = [2023, 2022, 2021, 2020, 2019];
    
    for (const year of years) {
      for (const college of insertedColleges.slice(0, 10)) { // Limit to first 10 colleges for performance
        for (const branch of insertedBranches.slice(0, 6)) { // Limit to first 6 branches
          // Generate realistic cutoff marks
          const baseCutoff = Math.random() * 50 + 150; // Base cutoff between 150-200
          const variation = (Math.random() - 0.5) * 20; // ±10 variation per year
          
          cutoffData.push({
            collegeId: college.id,
            branchId: branch.id,
            year,
            round: 1,
            generalCutoff: Math.round((baseCutoff + variation) * 10) / 10,
            obcCutoff: Math.round((baseCutoff + variation - 10) * 10) / 10,
            scCutoff: Math.round((baseCutoff + variation - 20) * 10) / 10,
            stCutoff: Math.round((baseCutoff + variation - 25) * 10) / 10
          });
        }
      }
    }

    await db.insert(cutoffHistory).values(cutoffData);

    // Seed historical placement data
    console.log("Seeding placement history...");
    const placementData = [];
    
    for (const year of years) {
      // Generate 50-100 placement records per year
      const numPlacements = Math.floor(Math.random() * 50) + 50;
      
      for (let i = 0; i < numPlacements; i++) {
        const college = insertedColleges[Math.floor(Math.random() * insertedColleges.length)];
        const branch = insertedBranches[Math.floor(Math.random() * insertedBranches.length)];
        const categories = ["general", "obc", "sc", "st"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Generate realistic student marks
        let studentMarks = Math.random() * 50 + 150; // 150-200 base
        
        // Adjust based on category
        switch (category) {
          case "general":
            studentMarks += Math.random() * 20; // Higher marks for general
            break;
          case "obc":
            studentMarks += Math.random() * 15 - 5;
            break;
          case "sc":
            studentMarks += Math.random() * 10 - 10;
            break;
          case "st":
            studentMarks += Math.random() * 8 - 15;
            break;
        }
        
        placementData.push({
          year,
          studentMarks: Math.round(studentMarks * 10) / 10,
          category,
          collegeId: college.id,
          branchId: branch.id,
          round: Math.floor(Math.random() * 3) + 1 // Rounds 1-3
        });
      }
    }

    await db.insert(placements).values(placementData);

    console.log("Database seeding completed successfully!");
    console.log(`- Created ${collegesData.length} colleges`);
    console.log(`- Created ${branchesData.length} branches`);
    console.log(`- Created ${collegeBranchesData.length} college-branch combinations`);
    console.log(`- Created ${cutoffData.length} cutoff records`);
    console.log(`- Created ${placementData.length} placement records`);
    console.log("\nDemo login credentials:");
    console.log("Admin: username=admin, password=admin123");
    console.log("Student: username=student_demo, password=student123");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };