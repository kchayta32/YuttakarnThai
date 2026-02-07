# Build & Deployment Instructions

## 1. Prerequisites
*   Unity Hub 3.5+
*   Unity 2022.3.10f1 or later (LTS) with Android/iOS/Windows build modules.
*   Visual Studio 2022 or JetBrains Rider.

## 2. Directory Structure
Ensure your repo looks like this:
```
/RTS_Project_Root
  /Assets
  /Packages
  /ProjectSettings
```

## 3. How to Build
### Windows (.exe)
1.  Open Build Settings (`Ctrl+Shift+B`).
2.  Switch Platform to **Windows / Mac / Linux**.
3.  Add Open Scenes.
4.  Click **Build**. Select `RTS_Yutthakan_Thailand_Delivery/Builds/Win64`.

### macOS (.app)
1.  Switch Platform to **macOS**.
2.  Click **Build**. (Requires building on a Mac for signing).

## 4. CI/CD (GitHub Actions Example)
Create `.github/workflows/main.yml`:
```yaml
name: Build Project
on: [push]
jobs:
  buildWindows:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: game-ci/unity-builder@v2
        with:
          targetPlatform: StandaloneWindows64
```

## 5. Troubleshooting
*   **NavMesh Error:** If units don't move, open Window > AI > Navigation and click "Bake".
*   **Shadow Glitches:** Check URP Settings in ProjectSettings and ensure "Soft Shadows" is enabled.
