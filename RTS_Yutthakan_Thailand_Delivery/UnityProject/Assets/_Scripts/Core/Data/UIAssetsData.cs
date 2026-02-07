using UnityEngine;

namespace RTS.Core.Data
{
    /// <summary>
    /// ScriptableObject สำหรับเก็บ UI Assets ทั้งหมด
    /// สร้างผ่าน Assets > Create > RTS > UI Assets
    /// </summary>
    [CreateAssetMenu(fileName = "UIAssets", menuName = "RTS/UI Assets")]
    public class UIAssetsData : ScriptableObject
    {
        [Header("Resource Icons")]
        [Tooltip("ไอคอนข้าว")]
        public Sprite RiceIcon;
        
        [Tooltip("ไอคอนเสบียง")]
        public Sprite SuppliesIcon;
        
        [Tooltip("ไอคอนน้ำมัน/เชื้อเพลิง")]
        public Sprite FuelIcon;
        
        [Tooltip("ไอคอนทอง")]
        public Sprite GoldIcon;

        [Header("Game Result Emblems")]
        [Tooltip("ตราชัยชนะ")]
        public Sprite VictoryEmblem;
        
        [Tooltip("ตราพ่ายแพ้")]
        public Sprite DefeatEmblem;

        [Header("Backgrounds")]
        [Tooltip("ภาพพื้นหลังเมนูหลัก")]
        public Sprite MainMenuBackground;
        
        [Tooltip("ภาพพื้นหลังเลือกแคมเปญ")]
        public Sprite CampaignBackground;

        [Header("Unit Type Icons")]
        public Sprite InfantryIcon;
        public Sprite CavalryIcon;
        public Sprite ElephantIcon;
        public Sprite ArcherIcon;
        public Sprite SiegeIcon;

        [Header("Building Icons")]
        public Sprite BarracksIcon;
        public Sprite StableIcon;
        public Sprite ElephantPenIcon;
        public Sprite ArcheryRangeIcon;
        public Sprite TownCenterIcon;

        [Header("Misc Icons")]
        public Sprite HealthIcon;
        public Sprite AttackIcon;
        public Sprite DefenseIcon;
        public Sprite SpeedIcon;

        [Header("Tech Icons")]
        public Sprite TechArmorIcon;
        public Sprite TechWeaponIcon;
        public Sprite TechSpeedIcon;
        public Sprite TempleIcon;
        public Sprite WorkshopIcon;
    }
}
