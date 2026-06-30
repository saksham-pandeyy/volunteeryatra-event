import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY/SUPABASE_ANON_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EMAIL = "saksham4200@gmail.com";
const PASSWORD = "Admin@123";

const INDIAN_CITIES = [
  "Mumbai, Maharashtra", "Delhi", "Bengaluru, Karnataka", "Chennai, Tamil Nadu",
  "Hyderabad, Telangana", "Pune, Maharashtra", "Kolkata, West Bengal", "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan", "Lucknow, Uttar Pradesh", "Chandigarh", "Bhopal, Madhya Pradesh",
  "Indore, Madhya Pradesh", "Surat, Gujarat", "Thiruvananthapuram, Kerala",
  "Guwahati, Assam", "Bhubaneswar, Odisha", "Nagpur, Maharashtra", "Mysuru, Karnataka",
  "Coimbatore, Tamil Nadu", "Varanasi, Uttar Pradesh", "Patna, Bihar", "Dehradun, Uttarakhand",
  "Panaji, Goa", "Shimla, Himachal Pradesh",
];

const CATEGORIES = [
  "education", "environment", "health", "community", "animal",
  "elderly", "children", "disaster", "arts", "sports",
];

const STATUSES: Array<"backlog" | "in_progress" | "completed"> = [
  "backlog", "in_progress", "completed",
];

const EVENTS = [
  {
    name: "Beach Cleanup Drive",
    description: "Join us for a massive beach cleanup along Marine Drive. We'll be collecting plastic waste and spreading awareness about ocean conservation. Gloves and bags will be provided.",
    location: "Mumbai, Maharashtra",
    category: "environment",
    status: "in_progress",
    max_participants: 100,
    start_time: "07:00 AM",
    end_time: "11:00 AM",
  },
  {
    name: "Teach Rural Kids Coding",
    description: "Volunteer to teach basic coding and computer skills to underprivileged children in rural areas. No prior teaching experience needed, just enthusiasm!",
    location: "Bengaluru, Karnataka",
    category: "education",
    status: "in_progress",
    max_participants: 25,
    start_time: "09:00 AM",
    end_time: "01:00 PM",
  },
  {
    name: "Tree Plantation Campaign",
    description: "Help us plant 5000 trees across the city. We'll be working with the municipal corporation to green our urban spaces. Tools and saplings provided.",
    location: "Delhi",
    category: "environment",
    status: "backlog",
    max_participants: 200,
    start_time: "06:30 AM",
    end_time: "10:30 AM",
  },
  {
    name: "Blood Donation Camp",
    description: "Annual blood donation drive in partnership with Red Cross. Your single donation can save up to three lives. Walk-ins welcome!",
    location: "Chennai, Tamil Nadu",
    category: "health",
    status: "completed",
    max_participants: 150,
    start_time: "08:00 AM",
    end_time: "04:00 PM",
  },
  {
    name: "Community Kitchen for Homeless",
    description: "Prepare and serve meals at our community kitchen. We serve over 500 meals daily to homeless individuals and families in need.",
    location: "Kolkata, West Bengal",
    category: "community",
    status: "in_progress",
    max_participants: 40,
    start_time: "06:00 AM",
    end_time: "12:00 PM",
  },
  {
    name: "Animal Shelter Volunteering",
    description: "Spend a day at the city's largest animal shelter. Walk dogs, socialize cats, and help with cleaning and feeding.",
    location: "Pune, Maharashtra",
    category: "animal",
    status: "backlog",
    max_participants: 30,
    start_time: "08:00 AM",
    end_time: "02:00 PM",
  },
  {
    name: "Old Age Home Visit",
    description: "Spend quality time with elderly residents at Sunshine Senior Living. Play games, share stories, and bring smiles to their faces.",
    location: "Jaipur, Rajasthan",
    category: "elderly",
    status: "in_progress",
    max_participants: 20,
    start_time: "10:00 AM",
    end_time: "01:00 PM",
  },
  {
    name: "Children's Art Workshop",
    description: "Organize a creative art workshop for children from underprivileged backgrounds. All art supplies will be provided.",
    location: "Lucknow, Uttar Pradesh",
    category: "children",
    status: "completed",
    max_participants: 50,
    start_time: "09:00 AM",
    end_time: "12:00 PM",
  },
  {
    name: "Flood Relief Distribution",
    description: "Distribute essential supplies including food, water, and medicine to families affected by recent floods. Join the relief efforts!",
    location: "Guwahati, Assam",
    category: "disaster",
    status: "in_progress",
    max_participants: null,
    start_time: "07:00 AM",
    end_time: "05:00 PM",
  },
  {
    name: "Street Play for Awareness",
    description: "Perform a street play on social issues like education, hygiene, and women's empowerment in public spaces across the city.",
    location: "Bhopal, Madhya Pradesh",
    category: "arts",
    status: "backlog",
    max_participants: 15,
    start_time: "04:00 PM",
    end_time: "06:00 PM",
  },
  {
    name: "Marathon for Charity",
    description: "Annual charity marathon to raise funds for cancer research. 5K, 10K, and half-marathon categories available. Every participant gets a medal!",
    location: "Hyderabad, Telangana",
    category: "sports",
    status: "backlog",
    max_participants: 500,
    start_time: "05:30 AM",
    end_time: "09:30 AM",
  },
  {
    name: "River Cleaning Expedition",
    description: "Join our team to clean the banks of the Ganges. We'll be removing plastic waste and conducting water quality tests.",
    location: "Varanasi, Uttar Pradesh",
    category: "environment",
    status: "in_progress",
    max_participants: 60,
    start_time: "06:00 AM",
    end_time: "11:00 AM",
  },
  {
    name: "Yoga & Wellness Camp",
    description: "Free yoga and meditation camp for stress relief and mental wellness. Suitable for all age groups. Mats provided.",
    location: "Rishikesh, Uttarakhand",
    category: "health",
    status: "completed",
    max_participants: 100,
    start_time: "05:30 AM",
    end_time: "08:00 AM",
  },
  {
    name: "Library Building Project",
    description: "Help us build a community library in a remote village. We need volunteers for construction, painting, and organizing books.",
    location: "Bhubaneswar, Odisha",
    category: "education",
    status: "in_progress",
    max_participants: 35,
    start_time: "08:00 AM",
    end_time: "04:00 PM",
  },
  {
    name: "Beach Sports Festival",
    description: "A day-long beach sports festival featuring volleyball, frisbee, and relay races. Promote fitness and fun!",
    location: "Panaji, Goa",
    category: "sports",
    status: "backlog",
    max_participants: 200,
    start_time: "07:00 AM",
    end_time: "05:00 PM",
  },
  {
    name: "Food Donation Drive",
    description: "Collect and distribute non-perishable food items to families in need. We'll be going door-to-door in underserved neighborhoods.",
    location: "Ahmedabad, Gujarat",
    category: "community",
    status: "completed",
    max_participants: null,
    start_time: "09:00 AM",
    end_time: "03:00 PM",
  },
  {
    name: "Dance for a Cause",
    description: "Organize a cultural dance performance to raise funds for children's education. All dance forms welcome!",
    location: "Mysuru, Karnataka",
    category: "arts",
    status: "backlog",
    max_participants: 30,
    start_time: "06:00 PM",
    end_time: "09:00 PM",
  },
  {
    name: "Vaccination Drive Support",
    description: "Volunteer at the city vaccination center — help with registration, crowd management, and post-vaccination care.",
    location: "Nagpur, Maharashtra",
    category: "health",
    status: "completed",
    max_participants: 25,
    start_time: "08:00 AM",
    end_time: "02:00 PM",
  },
  {
    name: "Adopt-a-Highway Cleanup",
    description: "Adopt a stretch of highway and keep it clean. We meet every month to pick up litter and maintain the area.",
    location: "Chandigarh",
    category: "environment",
    status: "in_progress",
    max_participants: 40,
    start_time: "07:00 AM",
    end_time: "10:00 AM",
  },
  {
    name: "Elderly Tech Support",
    description: "Help senior citizens learn to use smartphones, tablets, and video calling to stay connected with their loved ones.",
    location: "Coimbatore, Tamil Nadu",
    category: "elderly",
    status: "backlog",
    max_participants: 15,
    start_time: "10:00 AM",
    end_time: "01:00 PM",
  },
  {
    name: "Blind School Music Session",
    description: "Spend a musical afternoon at the Blind School. Sing, play instruments, and create joyful memories with the students.",
    location: "Indore, Madhya Pradesh",
    category: "children",
    status: "completed",
    max_participants: 20,
    start_time: "02:00 PM",
    end_time: "05:00 PM",
  },
  {
    name: "Mountain Trail Cleanup",
    description: "Trek and clean! We'll hike popular mountain trails and collect trash left behind by tourists. A rewarding workout for a cause.",
    location: "Shimla, Himachal Pradesh",
    category: "environment",
    status: "backlog",
    max_participants: 30,
    start_time: "06:00 AM",
    end_time: "02:00 PM",
  },
  {
    name: "Free Medical Checkup Camp",
    description: "Set up a free health checkup camp in an underserved area. Doctors and nurses needed, but volunteers for registration and logistics also welcome.",
    location: "Patna, Bihar",
    category: "health",
    status: "in_progress",
    max_participants: null,
    start_time: "08:00 AM",
    end_time: "04:00 PM",
  },
  {
    name: "Heritage Walk Guide",
    description: "Lead guided heritage walks through the old city. Share history and stories with tourists and locals alike.",
    location: "Hyderabad, Telangana",
    category: "arts",
    status: "backlog",
    max_participants: 10,
    start_time: "07:00 AM",
    end_time: "10:00 AM",
  },
  {
    name: "Zero-Waste Workshop",
    description: "Learn and teach zero-waste living practices — composting, upcycling, and plastic-free alternatives. Take home a starter kit!",
    location: "Thiruvananthapuram, Kerala",
    category: "education",
    status: "completed",
    max_participants: 40,
    start_time: "10:00 AM",
    end_time: "01:00 PM",
  },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function randomTime(): { start: string; end: string } {
  const hours = [6, 7, 8, 9, 10, 14, 16, 18];
  const startH = hours[Math.floor(Math.random() * hours.length)];
  const endH = startH + 2 + Math.floor(Math.random() * 3);
  const startStr = `${startH.toString().padStart(2, "0")}:00 ${startH < 12 ? "AM" : "PM"}`;
  const endStr = `${endH.toString().padStart(2, "0")}:00 ${endH < 12 ? "AM" : "PM"}`;
  return { start: startStr, end: endStr };
}

async function seed() {
  console.log("🔍 Looking up user:", EMAIL);

  // First, ensure the user exists
  const hashed = await bcrypt.hash(PASSWORD, 10);
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", EMAIL)
    .single();

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    console.log("✅ User found with ID:", userId);
  } else {
    console.log("📝 User not found. Creating new user...");
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({ email: EMAIL, password: hashed, name: "Saksham" })
      .select("id")
      .single();

    if (error) {
      console.error("❌ Failed to create user:", error.message);
      process.exit(1);
    }
    userId = newUser.id;
    console.log("✅ User created with ID:", userId);
  }

  // Delete existing events for this user to avoid duplicates
  console.log("🗑️ Removing existing events for this user...");
  await supabase.from("events").delete().eq("owner_id", userId);

  // Insert 25 events with varied data
  console.log("🌱 Seeding 25 events...\n");

  let successCount = 0;
  for (let i = 0; i < EVENTS.length; i++) {
    const ev = EVENTS[i];
    const daysOffset = [-60, -45, -30, -21, -14, -7, -3, -1, 0, 1, 3, 7, 10, 14, 21, 30, 45, 60, 90, 120, -10, 5, 40, 15, -5];
    const date = daysFromNow(daysOffset[i]);
    
    // Override status based on date: past dates should be "completed", future can be mixed
    const isPast = new Date(date) < new Date(new Date().toDateString());
    const status = isPast ? "completed" : ev.status;

    // Set registration deadline for past events
    const regDeadline = isPast 
      ? daysFromNow(-Math.abs(daysOffset[i]) - 7)
      : daysFromNow(-7);

    const eventData = {
      name: ev.name,
      description: ev.description,
      date,
      location: ev.location,
      status,
      owner_id: userId,
      category: ev.category,
      max_participants: ev.max_participants,
      registration_deadline: regDeadline,
      start_time: ev.start_time,
      end_time: ev.end_time,
      created_at: new Date(Date.now() - Math.abs(daysOffset[i] * 86400000)).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("events").insert(eventData);

    if (error) {
      console.error(`  ❌ [${i + 1}/${EVENTS.length}] ${ev.name.slice(0, 40).padEnd(42)} - ${error.message}`);
    } else {
      successCount++;
      const statusIcon = status === "completed" ? "✅" : status === "in_progress" ? "🔄" : "📋";
      console.log(`  ${statusIcon} [${i + 1}/${EVENTS.length}] ${ev.name.slice(0, 35).padEnd(37)} ${date.padEnd(12)} ${status.padEnd(14)} ${ev.location.split(",")[0].padEnd(14)} ${ev.category}`);
    }
  }

  console.log(`\n✨ Done! ${successCount}/${EVENTS.length} events seeded successfully.`);
  console.log(`📧 Login: ${EMAIL}`);
  console.log(`🔑 Password: ${PASSWORD}`);
}

seed().catch(console.error);
