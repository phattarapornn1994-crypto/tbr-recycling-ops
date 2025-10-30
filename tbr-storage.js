/* tbr-storage.js
   ตัวกลางเก็บ/อัพเดท master ร้านค้าใน sessionStorage
   ทุกหน้าควรใช้ไฟล์นี้ร่วมกัน
*/

const TBR_MASTER_KEY = "allShops";

/** อ่าน master ทั้งหมด */
function loadMasterShops() {
  const raw = sessionStorage.getItem(TBR_MASTER_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

/** เซฟ master ทั้งก้อน */
function saveMasterShops(list) {
  sessionStorage.setItem(TBR_MASTER_KEY, JSON.stringify(list || []));
}

/** เพิ่มหรือแก้ไขร้านใน master (ใช้ชื่อหรือ id เป็นตัวจับคู่) */
function upsertShopToMaster(shop) {
  if (!shop) return;
  const list = loadMasterShops();

  // มาตรฐานชื่อฟิลด์ให้มันคงที่หน่อย
  const normalized = {
    id: shop.id || shop.docId || "",
    shopName: shop.shopName || shop.name || "",
    location: shop.location || {
      address: shop.address || "",
      province: shop.province || "",
      gps_lat: shop.gps_lat || shop.lat || null,
      gps_lng: shop.gps_lng || shop.lng || null,
    },
    regionId: shop.regionId || "",
    yardId: shop.yardId || "",
    profile: shop.profile || {},
    operationalCapacity: shop.operationalCapacity || {},
    materialFlow: shop.materialFlow || {},
  };

  // หา index เดิม: ใช้ id ก่อน ถ้าไม่มีค่อยใช้ชื่อ
  let idx = -1;
  if (normalized.id) {
    idx = list.findIndex((s) => s.id === normalized.id);
  }
  if (idx === -1 && normalized.shopName) {
    idx = list.findIndex(
      (s) =>
        (s.shopName || "").toLowerCase() ===
        normalized.shopName.toLowerCase()
    );
  }

  if (idx > -1) {
    // อัพเดททับ
    list[idx] = { ...list[idx], ...normalized };
  } else {
    // เพิ่มใหม่
    list.push(normalized);
  }

  saveMasterShops(list);
}

/** ลบร้านออกจาก master */
function deleteShopFromMaster(idOrName) {
  const list = loadMasterShops();
  const out = list.filter((s) => {
    if (!idOrName) return true;
    if (s.id && s.id === idOrName) return false;
    if (
      s.shopName &&
      s.shopName.toLowerCase() === (idOrName + "").toLowerCase()
    )
      return false;
    return true;
  });
  saveMasterShops(out);
}
