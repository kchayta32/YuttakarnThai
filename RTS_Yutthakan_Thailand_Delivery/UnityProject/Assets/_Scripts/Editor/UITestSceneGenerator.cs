#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using TMPro;
using RTS.Core.Data;

namespace RTS.Editor
{
    /// <summary>
    /// สร้าง Test Scene สำหรับทดสอบ UI Components
    /// </summary>
    public class UITestSceneGenerator : EditorWindow
    {
        private UIAssetsData uiAssets;

        [MenuItem("RTS/Generate UI Test Scene")]
        public static void ShowWindow()
        {
            GetWindow<UITestSceneGenerator>("UI Test Scene");
        }

        private void OnGUI()
        {
            GUILayout.Label("🎮 UI Test Scene Generator", EditorStyles.boldLabel);
            GUILayout.Space(10);

            uiAssets = (UIAssetsData)EditorGUILayout.ObjectField(
                "UI Assets", uiAssets, typeof(UIAssetsData), false);

            if (uiAssets == null)
            {
                EditorGUILayout.HelpBox(
                    "ลาก GameUIAssets มาใส่ช่องด้านบน", 
                    MessageType.Warning);
            }

            GUILayout.Space(20);

            if (GUILayout.Button("🏗️ สร้าง Resource Panel Test", GUILayout.Height(35)))
            {
                CreateResourcePanelTest();
            }

            if (GUILayout.Button("🏆 สร้าง Game End UI Test", GUILayout.Height(35)))
            {
                CreateGameEndUITest();
            }

            if (GUILayout.Button("📊 สร้าง Complete UI Test Scene", GUILayout.Height(40)))
            {
                CreateCompleteUITestScene();
            }
        }

        private void CreateCompleteUITestScene()
        {
            // สร้าง Scene ใหม่
            EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            // สร้าง Canvas
            GameObject canvasGO = CreateCanvas("TestCanvas");

            // สร้าง Resource Panel
            CreateResourcePanel(canvasGO.transform);

            // สร้าง Game End Panel
            CreateGameEndPanel(canvasGO.transform);

            // สร้าง Unit Icons Display
            CreateUnitIconsPanel(canvasGO.transform);

            // Setup Camera
            Camera.main.backgroundColor = new Color(0.15f, 0.15f, 0.2f);

            // Save Scene
            string scenePath = "Assets/Scenes/UITestScene.unity";
            EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), scenePath);

            EditorUtility.DisplayDialog("สำเร็จ!", 
                "สร้าง UI Test Scene เสร็จแล้ว!\n\n" +
                "กด Play เพื่อทดสอบ", "OK");
        }

        private void CreateResourcePanelTest()
        {
            GameObject canvasGO = CreateCanvas("ResourceTestCanvas");
            CreateResourcePanel(canvasGO.transform);
        }

        private void CreateGameEndUITest()
        {
            GameObject canvasGO = CreateCanvas("GameEndTestCanvas");
            CreateGameEndPanel(canvasGO.transform);
        }

        private GameObject CreateCanvas(string name)
        {
            // Check for existing canvas
            Canvas existingCanvas = FindObjectOfType<Canvas>();
            if (existingCanvas != null)
            {
                return existingCanvas.gameObject;
            }

            GameObject canvasGO = new GameObject(name);
            var canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            
            var scaler = canvasGO.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            
            canvasGO.AddComponent<GraphicRaycaster>();

            // EventSystem
            if (FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                GameObject eventSystem = new GameObject("EventSystem");
                eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
                eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }

            return canvasGO;
        }

        private void CreateResourcePanel(Transform parent)
        {
            // Panel Background
            GameObject panel = CreatePanel("ResourcePanel", parent, 
                new Vector2(0, 0.9f), new Vector2(0.25f, 1f), 
                new Color(0.1f, 0.08f, 0.05f, 0.9f));

            var layout = panel.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = 20;
            layout.padding = new RectOffset(15, 15, 10, 10);
            layout.childAlignment = TextAnchor.MiddleLeft;
            layout.childForceExpandWidth = false;

            // Rice
            CreateResourceItem(panel.transform, "Rice", uiAssets?.RiceIcon, "500");

            // Supplies
            CreateResourceItem(panel.transform, "Supplies", uiAssets?.SuppliesIcon, "200");

            // Gold
            CreateResourceItem(panel.transform, "Gold", uiAssets?.GoldIcon, "100");

            // Fuel
            CreateResourceItem(panel.transform, "Fuel", uiAssets?.FuelIcon, "50");

            // Add ResourceDisplayUI component
            var resourceUI = panel.AddComponent<RTS.UI.ResourceDisplayUI>();
            resourceUI.UIAssets = uiAssets;

            Debug.Log("✓ Resource Panel สร้างเสร็จ!");
        }

        private void CreateResourceItem(Transform parent, string name, Sprite icon, string defaultValue)
        {
            GameObject item = new GameObject(name + "Item");
            item.transform.SetParent(parent, false);
            
            var itemLayout = item.AddComponent<HorizontalLayoutGroup>();
            itemLayout.spacing = 8;
            itemLayout.childAlignment = TextAnchor.MiddleLeft;
            itemLayout.childForceExpandWidth = false;

            // Icon
            GameObject iconGO = new GameObject("Icon");
            iconGO.transform.SetParent(item.transform, false);
            var iconImage = iconGO.AddComponent<Image>();
            iconImage.sprite = icon;
            var iconSize = iconGO.AddComponent<LayoutElement>();
            iconSize.preferredWidth = 40;
            iconSize.preferredHeight = 40;

            // Text
            GameObject textGO = new GameObject("Amount");
            textGO.transform.SetParent(item.transform, false);
            var tmp = textGO.AddComponent<TextMeshProUGUI>();
            tmp.text = defaultValue;
            tmp.fontSize = 24;
            tmp.fontStyle = FontStyles.Bold;
            tmp.color = new Color(1f, 0.9f, 0.7f);
            var textSize = textGO.AddComponent<LayoutElement>();
            textSize.preferredWidth = 80;
        }

        private void CreateGameEndPanel(Transform parent)
        {
            // Semi-transparent overlay
            GameObject overlay = CreatePanel("GameEndOverlay", parent,
                Vector2.zero, Vector2.one,
                new Color(0, 0, 0, 0.75f));

            // Content Panel
            GameObject contentPanel = CreatePanel("ContentPanel", overlay.transform,
                new Vector2(0.2f, 0.15f), new Vector2(0.8f, 0.85f),
                new Color(0.12f, 0.1f, 0.08f, 0.95f));

            // Title
            GameObject titleGO = new GameObject("Title");
            titleGO.transform.SetParent(contentPanel.transform, false);
            var titleRect = titleGO.AddComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.1f, 0.75f);
            titleRect.anchorMax = new Vector2(0.9f, 0.95f);
            titleRect.offsetMin = Vector2.zero;
            titleRect.offsetMax = Vector2.zero;
            var titleText = titleGO.AddComponent<TextMeshProUGUI>();
            titleText.text = "ชัยชนะ!";
            titleText.fontSize = 72;
            titleText.fontStyle = FontStyles.Bold;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(1f, 0.85f, 0.4f);

            // Emblem
            GameObject emblemGO = new GameObject("Emblem");
            emblemGO.transform.SetParent(contentPanel.transform, false);
            var emblemRect = emblemGO.AddComponent<RectTransform>();
            emblemRect.anchorMin = new Vector2(0.35f, 0.35f);
            emblemRect.anchorMax = new Vector2(0.65f, 0.75f);
            emblemRect.offsetMin = Vector2.zero;
            emblemRect.offsetMax = Vector2.zero;
            var emblemImage = emblemGO.AddComponent<Image>();
            emblemImage.sprite = uiAssets?.VictoryEmblem;
            emblemImage.preserveAspect = true;

            // Stats
            GameObject statsGO = new GameObject("Stats");
            statsGO.transform.SetParent(contentPanel.transform, false);
            var statsRect = statsGO.AddComponent<RectTransform>();
            statsRect.anchorMin = new Vector2(0.1f, 0.15f);
            statsRect.anchorMax = new Vector2(0.9f, 0.35f);
            statsRect.offsetMin = Vector2.zero;
            statsRect.offsetMax = Vector2.zero;
            var statsText = statsGO.AddComponent<TextMeshProUGUI>();
            statsText.text = "หน่วยที่สูญเสีย: 5\nศัตรูที่ปราบ: 42\nเวลา: 15:30";
            statsText.fontSize = 28;
            statsText.alignment = TextAlignmentOptions.Center;
            statsText.color = Color.white;

            // Buttons
            CreateButton(contentPanel.transform, "ContinueBtn", "ดำเนินต่อ",
                new Vector2(0.55f, 0.03f), new Vector2(0.95f, 0.12f),
                new Color(0.2f, 0.5f, 0.2f));

            CreateButton(contentPanel.transform, "RetryBtn", "เล่นใหม่",
                new Vector2(0.05f, 0.03f), new Vector2(0.45f, 0.12f),
                new Color(0.5f, 0.3f, 0.2f));

            // Add GameEndUI component
            var gameEndUI = overlay.AddComponent<RTS.UI.GameEndUI>();
            gameEndUI.UIAssets = uiAssets;
            gameEndUI.EndGamePanel = overlay;
            gameEndUI.VictoryPanel = contentPanel;
            gameEndUI.VictoryTitle = titleText;
            gameEndUI.VictoryIcon = emblemImage;

            overlay.SetActive(false); // Start hidden

            Debug.Log("✓ Game End Panel สร้างเสร็จ!");
        }

        private void CreateUnitIconsPanel(Transform parent)
        {
            GameObject panel = CreatePanel("UnitIconsPanel", parent,
                new Vector2(0.02f, 0.02f), new Vector2(0.4f, 0.15f),
                new Color(0.1f, 0.1f, 0.1f, 0.85f));

            var layout = panel.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = 10;
            layout.padding = new RectOffset(10, 10, 10, 10);
            layout.childAlignment = TextAnchor.MiddleLeft;
            layout.childForceExpandWidth = false;

            // Unit icons
            CreateIconButton(panel.transform, "Infantry", uiAssets?.InfantryIcon);
            CreateIconButton(panel.transform, "Cavalry", uiAssets?.CavalryIcon);
            CreateIconButton(panel.transform, "Elephant", uiAssets?.ElephantIcon);
            CreateIconButton(panel.transform, "Archer", uiAssets?.ArcherIcon);
            CreateIconButton(panel.transform, "Siege", uiAssets?.SiegeIcon);

            Debug.Log("✓ Unit Icons Panel สร้างเสร็จ!");
        }

        private GameObject CreatePanel(string name, Transform parent, 
            Vector2 anchorMin, Vector2 anchorMax, Color color)
        {
            GameObject panel = new GameObject(name);
            panel.transform.SetParent(parent, false);
            var rect = panel.AddComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = panel.AddComponent<Image>();
            image.color = color;
            return panel;
        }

        private void CreateButton(Transform parent, string name, string text,
            Vector2 anchorMin, Vector2 anchorMax, Color color)
        {
            GameObject btnGO = CreatePanel(name, parent, anchorMin, anchorMax, color);
            btnGO.AddComponent<Button>();

            GameObject textGO = new GameObject("Text");
            textGO.transform.SetParent(btnGO.transform, false);
            var textRect = textGO.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            var tmp = textGO.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = 24;
            tmp.fontStyle = FontStyles.Bold;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
        }

        private void CreateIconButton(Transform parent, string name, Sprite icon)
        {
            GameObject btnGO = new GameObject(name + "Btn");
            btnGO.transform.SetParent(parent, false);
            var image = btnGO.AddComponent<Image>();
            image.sprite = icon;
            image.color = Color.white;
            btnGO.AddComponent<Button>();
            var size = btnGO.AddComponent<LayoutElement>();
            size.preferredWidth = 60;
            size.preferredHeight = 60;
        }
    }
}
#endif
