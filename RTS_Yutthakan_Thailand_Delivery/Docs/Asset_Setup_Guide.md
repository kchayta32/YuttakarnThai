# Asset & Scene Setup Guide (คู่มือการติดตั้งฉากและเอฟเฟกต์)

คู่มือนี้จะแนะนำวิธีการตั้งค่า Scene, Particle Effects และ Audio สำหรับเกม RTS ยุทธการไทย

---

## 1. 🗺️ การออกแบบฉาก (Mission Map Design)
**(กาญจนบุรี → อยุธยา)**

### ขั้นตอนการสร้าง Scene ใน Unity:

1.  **สร้าง Terrain:**
    *   ไปที่ `GameObject > 3D Object > Terrain`.
    *   ใช้ **Paint Texture Tool** เพื่อระบายพื้นผิว:
        *   *Layer 1 (Base):* หญ้าเขียว (Green Grass) เป็นพื้นหลัก
        *   *Layer 2:* ดิน (Dirt) สำหรับเส้นทางเดินทัพ (Roads)
        *   *Layer 3:* ทราย/โคลน (Sand/Mud) บริเวณริมแม่น้ำ
    *   ใช้ **Raise/Lower Terrain** สร้างภูเขาเป็นขอบฉาก (Border) เพื่อจำกัดมุมกล้อง

2.  **สร้างแม่น้ำ (River):**
    *   ขุด Terrain ให้เป็นร่องลึกยาว
    *   สร้าง `Plane` ยาวๆ วางที่ระดับน้ำ
    *   ใส่ Material ที่มี Shader น้ำ (Water Shader) หรือใช้สีฟ้าโปร่งแสง (Transparent Blue) ปรับ *Smoothness* สูงๆ

3.  **วางตำแหน่งสำคัญ (Key Locations):**
    *   **จุดเกิดผู้เล่น (Start):** ฝั่งซ้ายล่าง (กาญจนบุรี)
    *   **จุดสิ้นสุด (End):** ฝั่งขวาบน (อยุธยา)
    *   วาง **แม่น้ำ** กั้นกลางแผนที่ เพื่อบังคับใช้ระบบ *River Transport* (เรือข้ามฟาก)

4.  **ตกแต่ง (Decoration):**
    *   วางต้นไม้ (Trees) เป็นกลุ่มๆ เพื่อสร้างป่า
    *   วางก้อนหิน (Rocks) บริเวณภูเขา
    *   **สำคัญ:** อย่าขวางเส้นทางหลักมากเกินไป AI จะเดินติด

5.  **Bake NavMesh (การเดิน AI):**
    *   คลิกที่ Terrain และ Objects ที่เดินผ่านไม่ได้ (ต้นไม้, หิน) -> ติ๊ก `Static` ที่ Inspector ด้านขวาบน
    *   ไปที่ `Window > AI > Navigation`.
    *   แถบ **Bake** -> ปรับ Agent Radius (ประมาณ 0.5 - 1.0 ตามขนาด Unit) -> กด **Bake**.
    *   *สีฟ้า* คือพื้นที่ที่เดินได้ (Walkable).

---

## 2. ✨ การสร้าง Particle Effects (Unity Setup)

### Effect 1: ฝุ่นจากการเดิน (Dust Cloud)
*เหมาะสำหรับ: เท้าช้างศึก, การเดินของทหาร*
1.  สร้าง `Effects > Particle System`.
2.  **Shape:** Circle (ปล่อยที่พื้น).
3.  **Color over Lifetime:** ขาว -> จางหาย (Alpha 0).
4.  **Size over Lifetime:** เล็ก -> ใหญ่.
5.  **Emission:** Rate over Distance = 5 (ออกเมื่อเคลื่อนที่).

### Effect 2: ประกายไฟปะทะกัน (Combat Spark)
*เหมาะสำหรับ: ดาบฟัน, หอกแทง*
1.  สร้าง `Effects > Particle System`.
2.  **Duration:** 0.2 วินาที (สั้นๆ).
3.  **Looping:** Uncheck (ไม่วนซ้ำ).
4.  **Start Speed:** 5-10 (พุ่งกระจาย).
5.  **Shape:** Sphere/Hemisphere.
6.  **Renderer:** เปลี่ยน Material เป็น *Default-Particle* (สีเหลือง/ส้ม).

### Effect 3: เลือด (Blood Splatter) - *Optional*
1. ใช้เหมือน Spark แต่เปลี่ยนสีเป็นแดงเข้ม และใส่ Gravity Modifier ให้ตกลงพื้น

---

## 3. 🔊 การใส่เสียง (Audio Placeholders)

### วิธีใส่ใน Unity:
1.  **BGM (เพลงประกอบ):**
    *   สร้าง `Empty GameObject` ชื่อ "BackgroundMusic".
    *   ใส่ `Audio Source` component.
    *   ลากไฟล์เสียงใส่ `AudioClip`.
    *   ติ๊ก `Loop` และ `Play On Awake`.

2.  **SFX (เสียงเอฟเฟกต์):**
    *   ที่ตัว Unit (Prefab), เพิ่ม `Audio Source`.
    *   ติ๊ก `Play On Awake` ออก (Uncheck).
    *   ในสคริปต์ `UnitController`, ใช้คำสั่ง `audioSource.PlayOneShot(attackClip);`

---

## 4. 🎵 Suno AI Prompts

ใช้ Prompt เหล่านี้ใน [Suno AI](https://suno.com/) หรือ AI สร้างเพลงอื่นๆ เพื่อสร้างเพลงประกอบ:

### 🥁 1. เพลงฉากต่อสู้ (Battle Theme)
**Style:** Cinematic, Orchestral, Epic, Thai Traditional Instruments, War Drums
**Prompt:**
> Epic cinematic war music, intense thundering drums (Klong Sabat Chai), aggressive thai xylophone (Ranat Ek) runs, sweeping orchestral strings, heroic brass section, fast tempo, adrenaline, ancient battlefield atmosphere, no vocals.

### 🌿 2. เพลงฉากสำรวจ/เตรียมตัว (Exploration/Preparation)
**Style:** Atmospheric, Traditional Thai, Ambient, Peaceful but Tense
**Prompt:**
> Ambient thai traditional music, mystical bamboo flute (Khlui) melody, gentle chime percussion, slow tempo, atmospheric pads, ancient kingdom feel, serene but with underlying tension of war, instrumental.

### 🏆 3. เพลงชัยชนะ (Victory Theme)
**Style:** Triumphant, Orchestral, Thai Classical, Majestics
**Prompt:**
> Triumphant orchestral finale, majestic brass fanfare, joyful thai gong rings, sweeping strings, uplifting and glorious, celebration of the king, grand ending, instrumental.

### 💀 4. เพลงความพ่ายแพ้ (Defeat Theme)
**Style:** Melancholic, Slow, Thai Sorrowful
**Prompt:**
> Sad melancholic thai fiddle (Saw Duang) solo, slow somber strings background, deep low drum hits, mourning atmosphere, tragic loss, faded ending, instrumental.
