/**
 * MeraGhar - seed script (demo data only)
 *
 * Creates demo auth users + realistic sample properties for Kaithal and Pundri.
 * All seeded rows have is_demo = true so they can be removed with --clean.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed.mjs
 *   node --env-file=.env.local scripts/seed.mjs --clean
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env vars. Run with: node --env-file=.env.local scripts/seed.mjs"
  );
  process.exit(1);
}

const ADMIN = "admin@meraghar.in";
const OWNER_K = "kaithal.owner@meraghar.in";
const OWNER_P = "pundri.owner@meraghar.in";
const DEMO_PASSWORD = "MeraGhar@2026";

const supabase = createClient(url, serviceKey);

function demoUser(email, name, phone) {
  return {
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name, phone },
  };
}

const DEMO_USERS = [
  demoUser(OWNER_K, "Rakesh Kumar (Demo Owner)", "9812012345"),
  demoUser(OWNER_P, "Sunita Devi (Demo Owner)", "9876512340"),
  demoUser(ADMIN, "MeraGhar Admin (Demo)", "9000000000"),
];

const d = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
};

const demoImage = (n) => `/demo/demo-${String(n).padStart(2, "0")}.svg`;

const PROPERTIES = [
  {
    owner: OWNER_K,
    title: "1 BHK Room Available on Pehowa Road",
    description:
      "Clean and quiet 1 BHK room available near Pehowa Road, Kaithal. Walking distance to cycle market and bus stand. Water and electricity included in rent. Suitable for singles. Demo listing.",
    purpose: "rent",
    property_type: "room",
    city: "Kaithal",
    locality: "Pehowa Road",
    address: "Near Shani Mandir, Pehowa Road",
    pincode: "136027",
    price: 6000,
    rent_period: "monthly",
    security_deposit: 6000,
    bhk: 1,
    bathrooms: 1,
    furnishing: "semi_furnished",
    area_sqft: 220,
    available_from: d(-3),
    amenities: ["Water Supply", "Electricity", "Attached Bathroom", "Balcony"],
    status: "approved",
    is_verified: true,
    is_featured: true,
    images: [1, 2],
    lat: 29.8021,
    lng: 76.3902,
  },
  {
    owner: OWNER_K,
    title: "2 BHK Flat for Rent in New Colony",
    description:
      "Spacious 2 BHK flat on the first floor in New Colony, Kaithal. Freshly painted, fitted kitchen, covered parking. School and market nearby. Demo listing.",
    purpose: "rent",
    property_type: "flat",
    city: "Kaithal",
    locality: "New Colony",
    address: "Street 4, New Colony",
    pincode: "136027",
    price: 12000,
    rent_period: "monthly",
    security_deposit: 20000,
    bhk: 2,
    bathrooms: 2,
    furnishing: "semi_furnished",
    area_sqft: 850,
    available_from: d(5),
    amenities: ["Parking", "Water Supply", "Electricity", "Kitchen", "Attached Bathroom"],
    status: "approved",
    is_verified: true,
    is_featured: true,
    images: [3, 4],
    lat: 29.8096,
    lng: 76.4039,
  },
  {
    owner: OWNER_K,
    title: "PG for Boys near Division Chowk",
    description:
      "Affordable PG for boys with hygienic food option, near Division Chowk Kaithal. Shared 2-sharing and 3-sharing rooms available. Demo listing.",
    purpose: "rent",
    property_type: "pg",
    city: "Kaithal",
    locality: "Division Chowk",
    address: "Opposite Indian Bank, Division Chowk",
    pincode: "136027",
    price: 4500,
    rent_period: "monthly",
    security_deposit: 5000,
    bhk: 2,
    bathrooms: 2,
    furnishing: "fully_furnished",
    area_sqft: 1200,
    available_from: d(-7),
    amenities: ["WiFi", "Parking", "Water Supply", "Electricity", "Kitchen", "CCTV", "Power Backup"],
    status: "approved",
    is_verified: false,
    is_featured: false,
    images: [2, 3],
    lat: 29.8047,
    lng: 76.3931,
  },
  {
    owner: OWNER_K,
    title: "3 BHK Independent House on Kurukshetra Road",
    description:
      "Brand new 3 BHK independent house on Kurukshetra Road, Kaithal. 3 sides open, good ventilation, car parking for two. Ideal for families. Demo listing.",
    purpose: "rent",
    property_type: "house",
    city: "Kaithal",
    locality: "Kurukshetra Road",
    address: "Kurukshetra Road, near HP Petrol Pump",
    pincode: "136027",
    price: 18000,
    rent_period: "monthly",
    security_deposit: 40000,
    bhk: 3,
    bathrooms: 3,
    furnishing: "unfurnished",
    area_sqft: 1500,
    available_from: d(12),
    amenities: ["Parking", "Water Supply", "Electricity", "Kitchen", "Balcony", "Security"],
    status: "approved",
    is_verified: true,
    is_featured: true,
    images: [5, 6],
    lat: 29.8112,
    lng: 76.4078,
  },
  {
    owner: OWNER_K,
    title: "2 BHK Flat for Sale near Bus Stand Kaithal",
    description:
      "Ready to move 2 BHK flat for sale near Kaithal bus stand. 800 sqft carpet, clear title, all papers ready for registration. Demo listing.",
    purpose: "sale",
    property_type: "flat",
    city: "Kaithal",
    locality: "Guhla Road",
    address: "Shanti Residency, Guhla Road",
    pincode: "136027",
    price: 3500000,
    rent_period: "one_time",
    security_deposit: null,
    bhk: 2,
    bathrooms: 2,
    furnishing: "semi_furnished",
    area_sqft: 800,
    available_from: d(-10),
    amenities: ["Parking", "Water Supply", "Electricity", "Kitchen", "Balcony", "Lift", "CCTV"],
    status: "approved",
    is_verified: true,
    is_featured: false,
    images: [3, 7],
    lat: 29.7972,
    lng: 76.3987,
  },
  {
    owner: OWNER_K,
    title: "Plot for Sale on Guhla Road",
    description:
      "Residential plot available on Guhla Road, Kaithal. Corner plot, 40 gaj. Ideal for house construction. Negotiable. Demo listing.",
    purpose: "sale",
    property_type: "plot",
    city: "Kaithal",
    locality: "Guhla Road",
    address: "Guhla Road near Green Park",
    pincode: "136027",
    price: 1500000,
    rent_period: "one_time",
    security_deposit: null,
    bhk: null,
    bathrooms: null,
    furnishing: "unfurnished",
    area_sqft: 400,
    available_from: null,
    amenities: ["Water Supply", "Electricity"],
    status: "approved",
    is_verified: false,
    is_featured: false,
    images: [8],
    lat: 29.7945,
    lng: 76.4021,
  },
  {
    owner: OWNER_K,
    title: "Shop for Sale in Main Market",
    description:
      "Ground floor shop for sale in the main market, Kaithal. High footfall area near Division Chowk. 12x20 ft. Demo listing.",
    purpose: "sale",
    property_type: "shop",
    city: "Kaithal",
    locality: "Main Market",
    address: "Main Market, near Division Chowk",
    pincode: "136027",
    price: 1850000,
    rent_period: "one_time",
    security_deposit: null,
    bhk: null,
    bathrooms: 1,
    furnishing: "semi_furnished",
    area_sqft: 240,
    available_from: d(-20),
    amenities: ["Electricity", "Water Supply", "Security"],
    status: "approved",
    is_verified: true,
    is_featured: false,
    images: [7, 8],
    lat: 29.8055,
    lng: 76.394,
  },
  {
    owner: OWNER_P,
    title: "Room for Rent in Main Bazaar, Pundri",
    description:
      "Simple and clean room for rent in Main Bazaar Pundri. Suitable for working singles. Rent includes electricity. Demo listing.",
    purpose: "rent",
    property_type: "room",
    city: "Pundri",
    locality: "Main Bazaar",
    address: "Main Bazaar, Pundri",
    pincode: "136026",
    price: 4000,
    rent_period: "monthly",
    security_deposit: 4000,
    bhk: 1,
    bathrooms: 1,
    furnishing: "unfurnished",
    area_sqft: 150,
    available_from: d(-2),
    amenities: ["Water Supply", "Electricity", "Attached Bathroom"],
    status: "approved",
    is_verified: true,
    is_featured: false,
    images: [1, 9],
    lat: 29.6293,
    lng: 76.4771,
  },
  {
    owner: OWNER_P,
    title: "2 BHK Flat on Rajound Road, Pundri",
    description:
      "2 BHK flat on Rajound Road, Pundri with separate kitchen and balcony. Nearby to all major markets. Semifurnished with geyser. Demo listing.",
    purpose: "rent",
    property_type: "flat",
    city: "Pundri",
    locality: "Rajound Road",
    address: "Rajound Road, near Chhoti Mata Mandir",
    pincode: "136026",
    price: 9500,
    rent_period: "monthly",
    security_deposit: 15000,
    bhk: 2,
    bathrooms: 2,
    furnishing: "semi_furnished",
    area_sqft: 700,
    available_from: d(2),
    amenities: ["Water Supply", "Electricity", "Kitchen", "Balcony", "Parking"],
    status: "approved",
    is_verified: false,
    is_featured: false,
    images: [3, 5],
    lat: 29.6401,
    lng: 76.4812,
  },
  {
    owner: OWNER_P,
    title: "PG for Girls near Bus Stand, Pundri",
    description:
      "Safe PG for girls near Pundri bus stand. Meals available on request, CCTV security, warden on site. Demo listing.",
    purpose: "rent",
    property_type: "pg",
    city: "Pundri",
    locality: "Bus Stand Road",
    address: "Bus Stand Road, Pundri",
    pincode: "136026",
    price: 6000,
    rent_period: "monthly",
    security_deposit: 8000,
    bhk: 2,
    bathrooms: 2,
    furnishing: "fully_furnished",
    area_sqft: 900,
    available_from: d(-1),
    amenities: ["WiFi", "Water Supply", "Electricity", "CCTV", "Security", "Kitchen", "Power Backup"],
    status: "approved",
    is_verified: true,
    is_featured: false,
    images: [4, 2],
    lat: 29.6334,
    lng: 76.4723,
  },
  {
    owner: OWNER_P,
    title: "3 BHK House for Sale in New Colony, Pundri",
    description:
      "Well-built 3 BHK house for sale in New Colony Pundri with 2 covered parking. Semi-furnished. Bank loan available. Demo listing.",
    purpose: "sale",
    property_type: "house",
    city: "Pundri",
    locality: "New Colony",
    address: "New Colony, Pundri",
    pincode: "136026",
    price: 3200000,
    rent_period: "one_time",
    security_deposit: null,
    bhk: 3,
    bathrooms: 3,
    furnishing: "semi_furnished",
    area_sqft: 1300,
    available_from: d(-15),
    amenities: ["Parking", "Water Supply", "Electricity", "Kitchen", "Balcony", "CCTV"],
    status: "approved",
    is_verified: true,
    is_featured: true,
    images: [6, 10],
    lat: 29.6431,
    lng: 76.4866,
  },
  {
    owner: OWNER_P,
    title: "Office Space for Rent on Kaithal Road, Pundri",
    description:
      "Office space on the first floor on Kaithal Road, Pundri. 2 rooms + hall, suitable for small business or clinic. Demo listing.",
    purpose: "rent",
    property_type: "office",
    city: "Pundri",
    locality: "Kaithal Road",
    address: "Kaithal Road, Pundri",
    pincode: "136026",
    price: 15000,
    rent_period: "monthly",
    security_deposit: 30000,
    bhk: null,
    bathrooms: 2,
    furnishing: "semi_furnished",
    area_sqft: 1100,
    available_from: d(7),
    amenities: ["Electricity", "Parking", "Water Supply", "Security"],
    status: "approved",
    is_verified: false,
    is_featured: false,
    images: [11, 12],
    lat: 29.6466,
    lng: 76.4901,
  },
  {
    owner: OWNER_P,
    title: "Studio Room for Rent near Market, Pundri",
    description:
      "Compact studio room with attached bath for rent near Pundri market. Electricity and water included. Demo listing.",
    purpose: "rent",
    property_type: "room",
    city: "Pundri",
    locality: "Main Bazaar",
    address: "Near Market Gate, Pundri",
    pincode: "136026",
    price: 3500,
    rent_period: "monthly",
    security_deposit: 3500,
    bhk: 1,
    bathrooms: 1,
    furnishing: "unfurnished",
    area_sqft: 130,
    available_from: d(0),
    amenities: ["Water Supply", "Electricity", "Attached Bathroom"],
    status: "pending",
    is_verified: false,
    is_featured: false,
    images: [9],
    lat: 29.6308,
    lng: 76.478,
  },
  {
    owner: OWNER_K,
    title: "3 BHK Flat for Sale in Kaithal City Centre",
    description:
      "3 BHK luxury flat for sale at City Centre Kaithal with lift, reserved parking and modular kitchen. Demo listing.",
    purpose: "sale",
    property_type: "3 bhk",
    city: "Kaithal",
    locality: "City Centre",
    address: "City Centre, Kaithal",
    pincode: "136027",
    price: 5500000,
    rent_period: "one_time",
    security_deposit: null,
    bhk: 3,
    bathrooms: 3,
    furnishing: "fully_furnished",
    area_sqft: 1450,
    available_from: d(-5),
    amenities: ["Parking", "Water Supply", "Electricity", "Kitchen", "Balcony", "Lift", "CCTV", "Power Backup"],
    status: "approved",
    is_verified: true,
    is_featured: false,
    images: [5, 6, 4],
    lat: 29.7988,
    lng: 76.3821,
  },
  {
    owner: OWNER_K,
    title: "1 BHK Flat for Rent near City Centre",
    description:
      "Fresh 1 BHK flat near City Centre Kaithal. West facing, good lighting. Electricity and water included. Demo listing.",
    purpose: "rent",
    property_type: "1 bhk",
    city: "Kaithal",
    locality: "City Centre",
    address: "City Centre road",
    pincode: "136027",
    price: 7000,
    rent_period: "monthly",
    security_deposit: 14000,
    bhk: 1,
    bathrooms: 1,
    furnishing: "semi_furnished",
    area_sqft: 380,
    available_from: d(3),
    amenities: ["Water Supply", "Electricity", "Kitchen", "Balcony"],
    status: "approved",
    is_verified: false,
    is_featured: false,
    images: [3, 1],
    lat: 29.7994,
    lng: 76.3842,
  },
  {
    owner: OWNER_K,
    title: "2 BHK Flat Rented Out - Sector 5",
    description:
      "This 2 BHK flat in Sector 5 area is already rented out. Listed for reference. Demo listing.",
    purpose: "rent",
    property_type: "2 bhk",
    city: "Kaithal",
    locality: "Old Market",
    address: "Old Market, Kaithal",
    pincode: "136027",
    price: 11000,
    rent_period: "monthly",
    security_deposit: 22000,
    bhk: 2,
    bathrooms: 2,
    furnishing: "semi_furnished",
    area_sqft: 780,
    available_from: d(-30),
    amenities: ["Water Supply", "Electricity", "Kitchen", "Parking"],
    status: "rented",
    is_verified: true,
    is_featured: false,
    images: [4, 3],
    lat: 29.8061,
    lng: 76.3788,
  },
];

const REQUIREMENTS = [
  {
    user: OWNER_K,
    city: "Kaithal",
    locality: "New Colony",
    property_type: "2 BHK",
    purpose: "rent",
    budget_min: 8000,
    budget_max: 12000,
    bhk: "2",
    title: "Looking for 2 BHK flat on rent in Kaithal",
    description:
      "I need a 2 BHK flat in Kaithal (New Colony preferred) under ₹12,000/month. Semi furnished would be great. Shifting within 1 month.",
    contact_preference: "both",
  },
  {
    user: OWNER_P,
    city: "Pundri",
    locality: "",
    property_type: "Room",
    purpose: "rent",
    budget_min: 3000,
    budget_max: 5000,
    bhk: "1",
    title: "Need a single room near Pundri bus stand",
    description:
      "Looking for a single room for rent in Pundri near the bus stand. Budget under ₹5,000/month. Need it for 6 months.",
    contact_preference: "whatsapp",
  },
  {
    user: OWNER_K,
    city: "Kaithal",
    locality: "Guhla Road",
    property_type: "Plot",
    purpose: "sale",
    budget_min: 1000000,
    budget_max: 2000000,
    bhk: "",
    title: "Want to buy a residential plot in Kaithal",
    description:
      "I need to buy a residential plot in Kaithal near Guhla Road up to ₹20 lakh. 30-60 gaj. Prefer corner plot.",
    contact_preference: "call",
  },
];

const ADDITIONAL_LOCALITIES = [
  ["Kaithal", "Main Market"],
  ["Pundri", "New Colony"],
];

async function findUserId(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(`listUsers failed: ${error.message}`);
  const found = (data?.users ?? []).find((u) => u.email.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

async function ensureUser(demo) {
  let id = await findUserId(demo.email);
  if (id) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      email_confirm: true,
      user_metadata: { name: demo.name, phone: demo.phone },
    });
    if (error) throw new Error(`updateUser ${demo.email}: ${error.message}`);
    console.log("  user exists:", demo.email);
    return id;
  }
  const { data, error } = await supabase.auth.admin.createUser(demo);
  if (error) throw new Error(`createUser ${demo.email}: ${error.message}`);
  console.log("  user created:", demo.email);
  return data.user.id;
}

async function main() {
  const cleanOnly = process.argv.includes("--clean");

  console.log("== MeraGhar seed ==");

  // Clean any previous demo data.
  const { error: delProps } = await supabase.from("properties").delete().eq("is_demo", true);
  if (!delProps) console.log("  removed old demo properties");

  if (cleanOnly) {
    // remove demo requirement posts for demo users too
    for (const email of [OWNER_K, OWNER_P, ADMIN]) {
      const uid = await findUserId(email);
      if (uid) await supabase.from("requirements").delete().eq("user_id", uid);
    }
    console.log("--clean done. Demo data removed.");
    return;
  }

  const userIds = {};
  for (const demo of DEMO_USERS) {
    userIds[demo.email] = await ensureUser(demo);
    // ensure profile exists + role for admin
    const meta = demo.user_metadata;
    await supabase
      .from("profiles")
      .upsert(
        { id: userIds[demo.email], name: meta.name, email: demo.email, phone: meta.phone },
        { onConflict: "id" }
      );
  }

  // promote admin role
  await supabase.from("profiles").update({ role: "admin" }).eq("id", userIds[ADMIN]);

  // extra localities
  for (const [city, locality] of ADDITIONAL_LOCALITIES) {
    await supabase.from("localities").upsert({ city, locality }, { onConflict: "city,locality" });
  }

  for (const p of PROPERTIES) {
    const ownerId = userIds[p.owner];
    const images = p.images.map((n, i) => ({ image_url: demoImage(n), display_order: i }));
    const { latitude: lat, longitude: lng } = p;
    const rest = { ...p };
    delete rest.owner;
    delete rest.images;
    delete rest.lat;
    delete rest.lng;
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...rest,
        owner_id: ownerId,
        slug: null,
        latitude: lat,
        longitude: lng,
        is_demo: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("  FAILED:", p.title, error.message);
      continue;
    }

    if (images.length) {
      await supabase.from("property_images").insert(
        images.map((img) => ({ property_id: data.id, ...img }))
      );
    }
    console.log("  property:", p.city, "->", p.title);
  }

  // slugify each inserted demo property (unique per owner)
  for (const p of PROPERTIES) {
    const slug = slugFrom(p.title);
    const { data: rows } = await supabase
      .from("properties")
      .select("id, title")
      .ilike("title", p.title)
      .maybeSingle();
    if (rows?.id) {
      const ownerId = userIds[p.owner];
      await supabase
        .from("properties")
        .update({ slug: `${slug}-${rows.id.slice(0, 8)}` })
        .eq("id", rows.id)
        .eq("owner_id", ownerId);
    }
  }

  for (const r of REQUIREMENTS) {
    const ownerId = userIds[r.user];
    const rest = { ...r };
    delete rest.user;
    const { error } = await supabase
      .from("requirements")
      .insert({ user_id: ownerId, ...rest, status: "open" });
    if (error) console.error("  FAILED requirement:", error.message);
    else console.log("  requirement:", r.city, "->", r.description.slice(0, 40));
  }

  console.log("\nDone. Demo users (password: MeraGhar@2026):");
  console.log("  - " + OWNER_K);
  console.log("  - " + OWNER_P);
  console.log("  - " + ADMIN + "  (admin)");
  console.log("\nRemove demo data later with: node --env-file=.env.local scripts/seed.mjs --clean");
}

function slugFrom(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});