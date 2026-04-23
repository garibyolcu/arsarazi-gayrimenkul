import { getDb } from "../api/queries/connection";
import {
  users,
  customers,
  properties,
  propertyImages,
  transactions,
  transactionEvents,
  documents,
  leads,
} from "./schema";
import bcryptjs from "bcryptjs";

async function hashPassword(password: string) {
  return bcryptjs.hash(password, 10);
}

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ─── USERS ───
  const passwordHash = await hashPassword("admin123");
  await db.insert(users).values([
    {
      name: "Admin User",
      email: "admin@arsarazi.com",
      passwordHash,
      role: "ADMIN",
      phone: "+90 555 000 00 01",
      isActive: true,
    },
    {
      name: "Ayşe Yılmaz",
      email: "ayse@arsarazi.com",
      passwordHash: await hashPassword("agent123"),
      role: "AGENT",
      phone: "+90 555 000 00 02",
      isActive: true,
    },
    {
      name: "Mehmet Kaya",
      email: "mehmet@arsarazi.com",
      passwordHash: await hashPassword("agent123"),
      role: "AGENT",
      phone: "+90 555 000 00 03",
      isActive: true,
    },
  ]);
  console.log("Users seeded.");

  const allUsers = await db.select().from(users);
  const adminId = allUsers.find((u) => u.email === "admin@arsarazi.com")!.id;
  const ayseId = allUsers.find((u) => u.email === "ayse@arsarazi.com")!.id;
  const mehmetId = allUsers.find((u) => u.email === "mehmet@arsarazi.com")!.id;

  // ─── CUSTOMERS ───
  await db.insert(customers).values([
    { firstName: "Ali", lastName: "Velioğlu", type: "BUYER", phone: "+90 532 111 11 11", email: "ali@example.com", city: "İstanbul", district: "Kadıköy", budgetMin: "1500000", budgetMax: "3000000", budgetCurrency: "TRY", source: "WEBSITE", rating: 4, assignedAgentId: ayseId },
    { firstName: "Fatma", lastName: "Demir", type: "SELLER", phone: "+90 532 222 22 22", email: "fatma@example.com", city: "İstanbul", district: "Beşiktaş", budgetMin: "0", budgetMax: "0", budgetCurrency: "TRY", source: "REFERRAL", rating: 5, assignedAgentId: ayseId },
    { firstName: "Hasan", lastName: "Çelik", type: "INVESTOR", phone: "+90 532 333 33 33", email: "hasan@example.com", city: "Ankara", district: "Çankaya", budgetMin: "5000000", budgetMax: "10000000", budgetCurrency: "TRY", source: "SOCIAL_MEDIA", rating: 3, assignedAgentId: mehmetId },
    { firstName: "Zeynep", lastName: "Şahin", type: "RENTER", phone: "+90 532 444 44 44", email: "zeynep@example.com", city: "İstanbul", district: "Şişli", budgetMin: "8000", budgetMax: "15000", budgetCurrency: "TRY", source: "WALK_IN", rating: 4, assignedAgentId: ayseId },
    { firstName: "Murat", lastName: "Aydın", type: "LANDLORD", phone: "+90 532 555 55 55", email: "murat@example.com", city: "İzmir", district: "Karşıyaka", budgetMin: "0", budgetMax: "0", budgetCurrency: "TRY", source: "REFERRAL", rating: 5, assignedAgentId: mehmetId },
    { firstName: "Elif", lastName: "Korkmaz", type: "BUYER", phone: "+90 532 666 66 66", email: "elif@example.com", city: "İstanbul", district: "Üsküdar", budgetMin: "2000000", budgetMax: "4000000", budgetCurrency: "TRY", source: "WEBSITE", rating: 4, assignedAgentId: ayseId },
    { firstName: "Can", lastName: "Yıldız", type: "BUYER", phone: "+90 532 777 77 77", email: "can@example.com", city: "İstanbul", district: "Ataşehir", budgetMin: "1200000", budgetMax: "2500000", budgetCurrency: "TRY", source: "SOCIAL_MEDIA", rating: 3, assignedAgentId: mehmetId },
    { firstName: "Selin", lastName: "Koç", type: "SELLER", phone: "+90 532 888 88 88", email: "selin@example.com", city: "İstanbul", district: "Sarıyer", budgetMin: "0", budgetMax: "0", budgetCurrency: "TRY", source: "REFERRAL", rating: 5, assignedAgentId: ayseId },
    { firstName: "Burak", lastName: "Özdemir", type: "INVESTOR", phone: "+90 532 999 99 99", email: "burak@example.com", city: "Antalya", district: "Muratpaşa", budgetMin: "3000000", budgetMax: "7000000", budgetCurrency: "TRY", source: "WALK_IN", rating: 4, assignedAgentId: mehmetId },
    { firstName: "Deniz", lastName: "Turan", type: "RENTER", phone: "+90 533 000 00 01", email: "deniz@example.com", city: "İstanbul", district: "Beyoğlu", budgetMin: "5000", budgetMax: "10000", budgetCurrency: "TRY", source: "WEBSITE", rating: 3, assignedAgentId: ayseId },
    { firstName: "Eren", lastName: "Bulut", type: "BUYER", phone: "+90 533 000 00 02", email: "eren@example.com", city: "İstanbul", district: "Maltepe", budgetMin: "1000000", budgetMax: "2000000", budgetCurrency: "TRY", source: "SOCIAL_MEDIA", rating: 4, assignedAgentId: mehmetId },
    { firstName: "Gizem", lastName: "Aksoy", type: "SELLER", phone: "+90 533 000 00 03", email: "gizem@example.com", city: "İstanbul", district: "Bakırköy", budgetMin: "0", budgetMax: "0", budgetCurrency: "TRY", source: "REFERRAL", rating: 5, assignedAgentId: ayseId },
    { firstName: "Kaan", lastName: "Ertaş", type: "INVESTOR", phone: "+90 533 000 00 04", email: "kaan@example.com", city: "Bursa", district: "Nilüfer", budgetMin: "4000000", budgetMax: "8000000", budgetCurrency: "TRY", source: "WALK_IN", rating: 4, assignedAgentId: mehmetId },
    { firstName: "Leyla", lastName: "Güneş", type: "RENTER", phone: "+90 533 000 00 05", email: "leyla@example.com", city: "İstanbul", district: "Pendik", budgetMin: "6000", budgetMax: "12000", budgetCurrency: "TRY", source: "WEBSITE", rating: 3, assignedAgentId: ayseId },
    { firstName: "Ozan", lastName: "Toprak", type: "BUYER", phone: "+90 533 000 00 06", email: "ozan@example.com", city: "İstanbul", district: "Kartal", budgetMin: "1800000", budgetMax: "3500000", budgetCurrency: "TRY", source: "SOCIAL_MEDIA", rating: 4, assignedAgentId: mehmetId },
  ]);
  console.log("Customers seeded.");

  const allCustomers = await db.select().from(customers);

  // ─── PROPERTIES ───
  const now = new Date();
  const propertyData = [
    { title: "Kadıköy'de Deniz Manzaralı 3+1 Daire", description: "Eşsiz deniz manzaralı, merkezi konumda, asansörlü, otoparklı lüks daire.", slug: "kadikoyde-deniz-manzarali-3-plus-1-daire", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "2850000", area: 145, netArea: 130, floorCount: 12, floor: 8, roomCount: 3, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Kombi", buildYear: 2015, city: "İstanbul", district: "Kadıköy", neighborhood: "Caferağa", street: "Moda Caddesi", fullAddress: "Moda Caddesi No:45, Kadıköy/İstanbul", latitude: "40.9828", longitude: "29.0240", features: JSON.stringify(["deniz manzarası", "asansör", "otopark", "güvenlik"]), views: 124, agentId: ayseId, ownerId: allCustomers[1].id },
    { title: "Beşiktaş'ta 4+1 Ultra Lüks Rezidans", description: "Boğaz manzaralı, 24 saat güvenlik, kapalı otopark, havuzlu rezidans.", slug: "besiktasta-4-plus-1-ultra-luks-rezidans", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "6500000", area: 220, netArea: 195, floorCount: 20, floor: 15, roomCount: 4, bathroomCount: 3, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: true, heatingType: "Merkezi", buildYear: 2020, city: "İstanbul", district: "Beşiktaş", neighborhood: "Levent", street: "Levent Caddesi", fullAddress: "Levent Caddesi No:12, Beşiktaş/İstanbul", latitude: "41.0822", longitude: "29.0078", features: JSON.stringify(["boğaz manzarası", "kapalı otopark", "havuz", "sauna", "güvenlik"]), views: 89, agentId: ayseId, ownerId: allCustomers[7].id },
    { title: "Ataşehir'de 2+1 Sıfır Daire", description: "Metro yakını, AVM'lere yürüme mesafesinde, modern site içi daire.", slug: "atasehirde-2-plus-1-sifir-daire", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "RENT" as const, price: "18500", area: 95, netArea: 85, floorCount: 8, floor: 3, roomCount: 2, bathroomCount: 1, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Kombi", buildYear: 2023, city: "İstanbul", district: "Ataşehir", neighborhood: "Atatürk", street: "Barbaros Bulvarı", fullAddress: "Barbaros Bulvarı No:78, Ataşehir/İstanbul", latitude: "40.9923", longitude: "29.1275", features: JSON.stringify(["metroya yakın", "site içi", "asansör", "otopark"]), views: 210, agentId: mehmetId, ownerId: allCustomers[4].id },
    { title: "Çankaya'da Müstakil Villa", description: "Bahçeli, havuzlu, 5 oda, 3 banyo, geniş garajlı müstakil villa.", slug: "cankayada-mustakil-villa", status: "ACTIVE" as const, type: "HOUSE" as const, listingType: "SALE" as const, price: "8500000", area: 450, netArea: 380, floorCount: 3, floor: 1, roomCount: 5, bathroomCount: 3, hasParking: true, hasGarden: true, hasElevator: false, hasFurnished: false, heatingType: "Kombi", buildYear: 2018, city: "Ankara", district: "Çankaya", neighborhood: "Bahçelievler", street: "7. Cadde", fullAddress: "7. Cadde No:22, Çankaya/Ankara", latitude: "39.9334", longitude: "32.8597", features: JSON.stringify(["bahçe", "havuz", "garaj", "güvenlik kamerası"]), views: 67, agentId: mehmetId, ownerId: allCustomers[2].id },
    { title: "Şişli'de Mobilyalı 1+1 Kiralık", description: "Tüm mobilyalar dahil, İstiklal Caddesi'ne 5 dakika, merkezi konum.", slug: "sislide-mobilyali-1-plus-1-kiralik", status: "RENTED" as const, type: "APARTMENT" as const, listingType: "RENT" as const, price: "12000", area: 60, netArea: 55, floorCount: 6, floor: 2, roomCount: 1, bathroomCount: 1, hasParking: false, hasGarden: false, hasElevator: false, hasFurnished: true, heatingType: "Soba", buildYear: 1995, city: "İstanbul", district: "Şişli", neighborhood: "Cihangir", street: "Sıraselviler Caddesi", fullAddress: "Sıraselviler Caddesi No:34, Şişli/İstanbul", latitude: "41.0370", longitude: "28.9851", features: JSON.stringify(["mobilyalı", "merkezi konum"]), views: 156, agentId: ayseId, ownerId: allCustomers[3].id },
    { title: "Karşıyaka'da Ticari İmarlı Arsa", description: "Ana yola cephe, ticari imarlı, yatırım için ideal arsa.", slug: "karsiyakada-ticari-imarli-arsa", status: "ACTIVE" as const, type: "LAND" as const, listingType: "SALE" as const, price: "3200000", area: 500, netArea: 500, floorCount: 0, floor: 0, roomCount: 0, bathroomCount: 0, hasParking: false, hasGarden: false, hasElevator: false, hasFurnished: false, heatingType: null, buildYear: null, city: "İzmir", district: "Karşıyaka", neighborhood: "Bahriye Üçok", street: "Ana Cadde", fullAddress: "Ana Cadde No:1, Karşıyaka/İzmir", latitude: "38.4565", longitude: "27.1168", features: JSON.stringify(["ticari imarlı", "ana yola cephe", "yatırımlık"]), views: 45, agentId: mehmetId, ownerId: allCustomers[4].id },
    { title: "Kartal'da Deniz Kenarı 3+1", description: "Denize sıfır, sahil yolunda, ferah manzaralı, yeni binada.", slug: "kartalda-deniz-kenari-3-plus-1", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "2100000", area: 155, netArea: 140, floorCount: 14, floor: 10, roomCount: 3, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Merkezi", buildYear: 2021, city: "İstanbul", district: "Kartal", neighborhood: "Yakacık", street: "Sahil Yolu", fullAddress: "Sahil Yolu No:88, Kartal/İstanbul", latitude: "40.9077", longitude: "29.1892", features: JSON.stringify(["deniz manzarası", "yeni bina", "asansör", "otopark"]), views: 178, agentId: ayseId, ownerId: allCustomers[1].id },
    { title: "Pendik'te Uygun Fiyatlı 2+1", description: "Aileye uygun, market ve okula yakın, metroya 10 dk yürüme mesafe.", slug: "pendikte-uygun-fiyatli-2-plus-1", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "1350000", area: 90, netArea: 80, floorCount: 5, floor: 3, roomCount: 2, bathroomCount: 1, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Kombi", buildYear: 2010, city: "İstanbul", district: "Pendik", neighborhood: "Kurtköy", street: "Ankara Caddesi", fullAddress: "Ankara Caddesi No:55, Pendik/İstanbul", latitude: "40.8780", longitude: "29.2787", features: JSON.stringify(["aileye uygun", "metroya yakın", "okula yakın"]), views: 312, agentId: mehmetId, ownerId: allCustomers[10].id },
    { title: "Muratpaşa'da 5 Yıldızlı Otel Binası", description: "Denize 200m, 60 oda, havuzlu, restoranlı, yatırımlık otel binası.", slug: "muratpasada-5-yildizli-otel-binasi", status: "ACTIVE" as const, type: "COMMERCIAL" as const, listingType: "SALE" as const, price: "25000000", area: 3500, netArea: 3200, floorCount: 6, floor: 1, roomCount: 60, bathroomCount: 65, hasParking: true, hasGarden: true, hasElevator: true, hasFurnished: true, heatingType: "Merkezi", buildYear: 2019, city: "Antalya", district: "Muratpaşa", neighborhood: "Lara", street: "Lara Turizm Yolu", fullAddress: "Lara Turizm Yolu No:99, Muratpaşa/Antalya", latitude: "36.8521", longitude: "30.7581", features: JSON.stringify(["yatırımlık", "havuz", "restoran", "otopark"]), views: 23, agentId: mehmetId, ownerId: allCustomers[8].id },
    { title: "Maltepe'de Ofis Katı", description: "Metro yakını, açık ofis planlı, ışık alan, ferah çalışma ortamı.", slug: "maltepede-ofis-kati", status: "ACTIVE" as const, type: "OFFICE" as const, listingType: "RENT" as const, price: "22000", area: 180, netArea: 165, floorCount: 10, floor: 5, roomCount: 4, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Merkezi", buildYear: 2017, city: "İstanbul", district: "Maltepe", neighborhood: "Bağdat Caddesi", street: "Bağdat Caddesi", fullAddress: "Bağdat Caddesi No:210, Maltepe/İstanbul", latitude: "40.9378", longitude: "29.1311", features: JSON.stringify(["metroya yakın", "açık ofis", "otopark"]), views: 88, agentId: ayseId, ownerId: allCustomers[12].id },
    { title: "Üsküdar'da Boğaz Manzaralı 4+2", description: "Salacak sahilinde, tarihi yapı, restore edilmiş, balkonlu.", slug: "uskudarda-bogaz-manzarali-4-plus-2", status: "SOLD" as const, type: "HOUSE" as const, listingType: "SALE" as const, price: "12000000", area: 280, netArea: 250, floorCount: 3, floor: 2, roomCount: 4, bathroomCount: 2, hasParking: true, hasGarden: true, hasElevator: false, hasFurnished: false, heatingType: "Kombi", buildYear: 1980, city: "İstanbul", district: "Üsküdar", neighborhood: "Salacak", street: "Salacak Sahil Yolu", fullAddress: "Salacak Sahil Yolu No:3, Üsküdar/İstanbul", latitude: "41.0035", longitude: "29.0129", features: JSON.stringify(["boğaz manzarası", "tarihi yapı", "balkon", "bahçe"]), views: 432, agentId: ayseId, ownerId: allCustomers[5].id },
    { title: "Nilüfer'de Depolu Sanayi Alanı", description: "7/24 güvenlik, kamyon girişi, yüksek tavanlı depo.", slug: "niluferde-depolu-sanayi-alani", status: "ACTIVE" as const, type: "WAREHOUSE" as const, listingType: "RENT" as const, price: "45000", area: 800, netArea: 750, floorCount: 1, floor: 1, roomCount: 2, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: false, hasFurnished: false, heatingType: null, buildYear: 2016, city: "Bursa", district: "Nilüfer", neighborhood: "Organize Sanayi", street: "OSB Caddesi", fullAddress: "OSB Caddesi No:7, Nilüfer/Bursa", latitude: "40.1956", longitude: "28.9784", features: JSON.stringify(["yüksek tavan", "kamyon girişi", "güvenlik"]), views: 34, agentId: mehmetId, ownerId: allCustomers[12].id },
    { title: "Sarıyer'de Orman Manzaralı 3+1", description: "Belgrad Ormanı manzaralı, havalimanına yakın, lüks site içi.", slug: "sariyerde-orman-manzarali-3-plus-1", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "3800000", area: 170, netArea: 155, floorCount: 10, floor: 7, roomCount: 3, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Kombi", buildYear: 2022, city: "İstanbul", district: "Sarıyer", neighborhood: "Tarabya", street: "Tarabya Yolu", fullAddress: "Tarabya Yolu No:15, Sarıyer/İstanbul", latitude: "41.1510", longitude: "29.0570", features: JSON.stringify(["orman manzarası", "site içi", "asansör", "kapalı otopark"]), views: 145, agentId: mehmetId, ownerId: allCustomers[7].id },
    { title: "Beyoğlu'nda Tarihi Han İçi Dükkan", description: "İstiklal Caddesi'ne 50m, yüksek potansiyel, turistik bölge.", slug: "beyoglunda-tarihi-han-ici-dukkan", status: "ACTIVE" as const, type: "COMMERCIAL" as const, listingType: "SALE" as const, price: "5500000", area: 120, netArea: 110, floorCount: 4, floor: 1, roomCount: 2, bathroomCount: 1, hasParking: false, hasGarden: false, hasElevator: false, hasFurnished: false, heatingType: null, buildYear: 1900, city: "İstanbul", district: "Beyoğlu", neighborhood: "Taksim", street: "İstiklal Caddesi", fullAddress: "İstiklal Caddesi No:101, Beyoğlu/İstanbul", latitude: "41.0370", longitude: "28.9851", features: JSON.stringify(["turistik bölge", "yüksek potansiyel"]), views: 201, agentId: ayseId, ownerId: allCustomers[9].id },
    { title: "Bakırköy'de 2+1 Yatırımlık Daire", description: "Havalimanına yakın, metroya 3 dk, kiracılı, yatırım için ideal.", slug: "bakirkoyde-2-plus-1-yatirimlik-daire", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "SALE" as const, price: "1650000", area: 85, netArea: 78, floorCount: 7, floor: 4, roomCount: 2, bathroomCount: 1, hasParking: true, hasGarden: false, hasElevator: true, hasFurnished: false, heatingType: "Kombi", buildYear: 2012, city: "İstanbul", district: "Bakırköy", neighborhood: "Ataköy", street: "Ataköy Caddesi", fullAddress: "Ataköy Caddesi No:32, Bakırköy/İstanbul", latitude: "40.9769", longitude: "28.8760", features: JSON.stringify(["havalimanına yakın", "metroya yakın", "yatırımlık"]), views: 267, agentId: mehmetId, ownerId: allCustomers[11].id },
    { title: "Kadıköy'de Kiralık Dükkan", description: "Ana cadde üzeri, geniş vitrin, yüksek tavan, her sektöre uygun.", slug: "kadikoyde-kiralik-dukkan", status: "ACTIVE" as const, type: "COMMERCIAL" as const, listingType: "RENT" as const, price: "35000", area: 110, netArea: 100, floorCount: 3, floor: 0, roomCount: 1, bathroomCount: 1, hasParking: false, hasGarden: false, hasElevator: false, hasFurnished: false, heatingType: null, buildYear: 2005, city: "İstanbul", district: "Kadıköy", neighborhood: "Osmanağa", street: "Bahariye Caddesi", fullAddress: "Bahariye Caddesi No:56, Kadıköy/İstanbul", latitude: "40.9828", longitude: "29.0240", features: JSON.stringify(["ana cadde", "geniş vitrin", "yüksek tavan"]), views: 112, agentId: ayseId, ownerId: allCustomers[1].id },
    { title: "Çankaya'da Kiralık 1+1", description: "Kızılay'a yürüme mesafe, eşyalı, internet dahil, öğrenciye uygun.", slug: "cankayada-kiralik-1-plus-1", status: "ACTIVE" as const, type: "APARTMENT" as const, listingType: "RENT" as const, price: "9000", area: 55, netArea: 50, floorCount: 4, floor: 2, roomCount: 1, bathroomCount: 1, hasParking: false, hasGarden: false, hasElevator: false, hasFurnished: true, heatingType: "Kombi", buildYear: 2008, city: "Ankara", district: "Çankaya", neighborhood: "Kızılay", street: "Gazi Mustafa Kemal Bulvarı", fullAddress: "Gazi Mustafa Kemal Bulvarı No:88, Çankaya/Ankara", latitude: "39.9208", longitude: "32.8541", features: JSON.stringify(["eşyalı", "merkezi", "internet dahil"]), views: 189, agentId: mehmetId, ownerId: allCustomers[2].id },
    { title: "Şişli'de Mobilyalı Stüdyo", description: "Tüm eşyalar dahil, İstiklal'e 3 dk, minimalist stüdyo daire.", slug: "sislide-mobilyali-studyo", status: "RENTED" as const, type: "APARTMENT" as const, listingType: "RENT" as const, price: "15000", area: 45, netArea: 42, floorCount: 7, floor: 5, roomCount: 1, bathroomCount: 1, hasParking: false, hasGarden: false, hasElevator: true, hasFurnished: true, heatingType: "Kombi", buildYear: 2015, city: "İstanbul", district: "Şişli", neighborhood: "Halaskargazi", street: "Halaskargazi Caddesi", fullAddress: "Halaskargazi Caddesi No:200, Şişli/İstanbul", latitude: "41.0490", longitude: "28.9876", features: JSON.stringify(["eşyalı", "merkezi", "asansör"]), views: 234, agentId: ayseId, ownerId: allCustomers[3].id },
    { title: "Karşıyaka'da 4+1 Tripleks Villa", description: "Deniz manzaralı, özel havuz, geniş bahçe, 3 katlı lüks villa.", slug: "karsiyakada-4-plus-1-tripleks-villa", status: "SOLD" as const, type: "HOUSE" as const, listingType: "SALE" as const, price: "9500000", area: 520, netArea: 460, floorCount: 3, floor: 1, roomCount: 4, bathroomCount: 3, hasParking: true, hasGarden: true, hasElevator: false, hasFurnished: false, heatingType: "Kombi", buildYear: 2020, city: "İzmir", district: "Karşıyaka", neighborhood: "Bostanlı", street: "Sahil Bulvarı", fullAddress: "Sahil Bulvarı No:1, Karşıyaka/İzmir", latitude: "38.4565", longitude: "27.1168", features: JSON.stringify(["deniz manzarası", "havuz", "bahçe", "garaj"]), views: 76, agentId: mehmetId, ownerId: allCustomers[4].id },
    { title: "Ataşehir'de Kiralık Depo", description: "TIR girişi, 7m tavan, rampa, lojistik için ideal depo.", slug: "atasehirde-kiralik-depo", status: "ACTIVE" as const, type: "WAREHOUSE" as const, listingType: "RENT" as const, price: "85000", area: 1200, netArea: 1150, floorCount: 1, floor: 1, roomCount: 3, bathroomCount: 2, hasParking: true, hasGarden: false, hasElevator: false, hasFurnished: false, heatingType: null, buildYear: 2014, city: "İstanbul", district: "Ataşehir", neighborhood: "Örnek", street: "Sanayi Caddesi", fullAddress: "Sanayi Caddesi No:45, Ataşehir/İstanbul", latitude: "40.9923", longitude: "29.1275", features: JSON.stringify(["tır girişi", "yüksek tavan", "rampa"]), views: 41, agentId: ayseId, ownerId: allCustomers[13].id },
  ];

  await db.insert(properties).values(propertyData as any);
  console.log("Properties seeded.");

  const allProperties = await db.select().from(properties);

  // ─── PROPERTY IMAGES ───
  const imageBase = "https://images.unsplash.com/photo-";
  const imageSuffix = "?auto=format&fit=crop&w=800&q=80";
  const imageIds = [
    "1512917774080-9991f1c4c750", "1522708323590-d24dbb6b0267", "1484154218962-a1c002085d2f",
    "1502672260266-1c1ef2d93688", "1493809842364-78817add7ffb", "1545324418-cc1a3fa10c00",
    "1486304873000-9baec95f0d3d", "1513584684374-8bab748fbf9f", "1479839672679-a46483c0e7c8",
    "1497366216548-37526070297c", "1502005229766-c5d33e6b0b68", "1518780664697-55e3ad937233",
    "1486406146926-c627a92ad1ab", "1501183638710-841dd1904371", "1516455590571-14396eaa2300",
    "1507089947368-19c9da97f6f6", "1494526585095-c41746248156", "1493809842364-78817add7ffb",
    "1502672260266-1c1ef2d93688", "1512917774080-9991f1c4c750",
  ];

  for (let i = 0; i < allProperties.length; i++) {
    const p = allProperties[i];
    await db.insert(propertyImages).values([
      { propertyId: p.id, url: `${imageBase}${imageIds[i % imageIds.length]}${imageSuffix}`, altText: p.title, order: 0, isMain: true },
      { propertyId: p.id, url: `${imageBase}${imageIds[(i + 1) % imageIds.length]}${imageSuffix}`, altText: `${p.title} - görsel 2`, order: 1, isMain: false },
    ]);
  }
  console.log("Property images seeded.");

  // ─── TRANSACTIONS ───
  await db.insert(transactions).values([
    { type: "SALE", status: "CLOSED", propertyId: allProperties[10].id, buyerId: allCustomers[0].id, sellerId: allProperties[10].ownerId, agentId: ayseId, agreedPrice: "12000000", commission: "360000", commissionRate: "3.00", contractDate: now, closingDate: now, handoverDate: now },
    { type: "SALE", status: "CLOSED", propertyId: allProperties[18].id, buyerId: allCustomers[6].id, sellerId: allProperties[18].ownerId, agentId: mehmetId, agreedPrice: "9500000", commission: "285000", commissionRate: "3.00", contractDate: now, closingDate: now, handoverDate: now },
    { type: "SALE", status: "CONTRACT", propertyId: allProperties[0].id, buyerId: allCustomers[0].id, sellerId: allProperties[0].ownerId, agentId: ayseId, agreedPrice: "2750000", commission: "82500", commissionRate: "3.00", contractDate: now, closingDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), handoverDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
    { type: "RENT", status: "CLOSED", propertyId: allProperties[4].id, renterId: allCustomers[3].id, landlordId: allProperties[4].ownerId, agentId: ayseId, agreedPrice: "12000", commission: "6000", commissionRate: "50.00", contractDate: now, closingDate: now, handoverDate: now },
    { type: "RENT", status: "NEGOTIATION", propertyId: allProperties[16].id, renterId: allCustomers[9].id, landlordId: allProperties[16].ownerId, agentId: mehmetId, agreedPrice: "9000", commission: "4500", commissionRate: "50.00", contractDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), closingDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), handoverDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
  ]);
  console.log("Transactions seeded.");

  const allTransactions = await db.select().from(transactions);

  // ─── TRANSACTION EVENTS ───
  for (const t of allTransactions) {
    await db.insert(transactionEvents).values([
      { transactionId: t.id, eventType: "CREATED", description: "İşlem oluşturuldu.", eventDate: t.createdAt, createdById: t.agentId },
      { transactionId: t.id, eventType: "STATUS_CHANGE", description: `Durum güncellendi: ${t.status}`, eventDate: new Date(t.createdAt.getTime() + 86400000), createdById: t.agentId },
    ]);
  }
  console.log("Transaction events seeded.");

  // ─── DOCUMENTS ───
  await db.insert(documents).values([
    { type: "TITLE_DEED", name: "Tapu Örneği", fileUrl: "/docs/tapu-sample.pdf", fileSize: 2048, mimeType: "application/pdf", propertyId: allProperties[0].id, uploadedById: adminId },
    { type: "CONTRACT", name: "Satış Sözleşmesi", fileUrl: "/docs/contract-sample.pdf", fileSize: 4096, mimeType: "application/pdf", transactionId: allTransactions[0].id, uploadedById: adminId },
    { type: "ID_COPY", name: "Kimlik Fotokopisi", fileUrl: "/docs/id-sample.pdf", fileSize: 512, mimeType: "application/pdf", customerId: allCustomers[0].id, uploadedById: adminId },
    { type: "FLOOR_PLAN", name: "Kat Planı", fileUrl: "/docs/plan-sample.pdf", fileSize: 3072, mimeType: "application/pdf", propertyId: allProperties[1].id, uploadedById: ayseId },
    { type: "VALUATION_REPORT", name: "Ekspertiz Raporu", fileUrl: "/docs/valuation-sample.pdf", fileSize: 5120, mimeType: "application/pdf", propertyId: allProperties[10].id, uploadedById: mehmetId },
  ]);
  console.log("Documents seeded.");

  // ─── LEADS ───
  await db.insert(leads).values([
    { source: "WEBSITE", name: "Ahmet Yılmaz", phone: "+90 535 111 22 33", email: "ahmet@example.com", message: "Kadıköy'de 3+1 satılık daire arıyorum. Bütçem 3 milyon.", status: "NEW", interestedIn: JSON.stringify(["APARTMENT"]), budget: "3000000", assignedAgentId: ayseId },
    { source: "WEBSITE", name: "Sevgi Demirtaş", phone: "+90 535 222 33 44", email: "sevgi@example.com", message: "Ataşehir'de kiralık ofis arıyoruz. 4+1, bütçe 25000 TL.", status: "CONTACTED", interestedIn: JSON.stringify(["OFFICE"]), budget: "25000", assignedAgentId: mehmetId },
    { source: "SOCIAL_MEDIA", name: "Kerem Aksoy", phone: "+90 535 333 44 55", email: "kerem@example.com", message: "Antalya'da yatırımlık arsa arıyorum.", status: "QUALIFIED", interestedIn: JSON.stringify(["LAND"]), budget: "5000000", assignedAgentId: mehmetId },
    { source: "REFERRAL", name: "Nurhan Çelik", phone: "+90 535 444 55 66", email: "nurhan@example.com", message: "Çankaya'da kiralık daire arıyorum. Öğrenciyim, bütçe 10000 TL.", status: "NEW", interestedIn: JSON.stringify(["APARTMENT"]), budget: "10000", assignedAgentId: ayseId },
    { source: "WALK_IN", name: "Osman Şahin", phone: "+90 535 555 66 77", email: "osman@example.com", message: "Bakırköy'de 2+1 satılık dairem var, değer biçtirmek istiyorum.", status: "CONVERTED", interestedIn: JSON.stringify(["APARTMENT"]), budget: "0", assignedAgentId: mehmetId },
    { source: "WEBSITE", name: "Pelin Toprak", phone: "+90 535 666 77 88", email: "pelin@example.com", message: "Sarıyer'de villa kiralamak istiyoruz. Bütçe 40000 TL.", status: "NEW", interestedIn: JSON.stringify(["HOUSE"]), budget: "40000", assignedAgentId: ayseId },
    { source: "SOCIAL_MEDIA", name: "Yasin Koç", phone: "+90 535 777 88 99", email: "yasin@example.com", message: "İstanbul'da ticari gayrimenkul yatırımı düşünüyorum.", status: "QUALIFIED", interestedIn: JSON.stringify(["COMMERCIAL"]), budget: "10000000", assignedAgentId: mehmetId },
  ]);
  console.log("Leads seeded.");

  console.log("Done.");
  process.exit(0);
}

seed();
