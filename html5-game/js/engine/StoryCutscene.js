// ===================================
// RTS: ยุทธการไทย - Story Cutscene System
// Displays story images with Thai subtitles
// ===================================

export const STORY_DATA = {
    white_elephant: {
        title: 'สงครามช้างเผือก',
        titleEn: 'The War of the White Elephants',
        year: 'พ.ศ. 2090-2092 (ค.ศ. 1547-1549)',
        scenes: [
            {
                image: 'images/story/story_scene_01.png',
                subtitle: 'พระเจ้าตะเบ็งชเวตี้แห่งอาณาจักรตองอู ทรงนำทัพใหญ่บุกเข้าสยามผ่านด่านเจดีย์สามองค์...',
                duration: 5000
            },
            {
                image: 'images/story/story_scene_02.png',
                subtitle: 'สมเด็จพระมหาจักรพรรดิแห่งกรุงศรีอยุธยา ทรงได้รับข่าวการบุกรุกของกองทัพพม่า...',
                duration: 5000
            },
            {
                image: 'images/story/story_scene_03.png',
                subtitle: 'สมเด็จพระสุริโยทัย พระอัครมเหสี ทรงแต่งองค์เป็นชายและขึ้นช้างศึก เพื่อปกป้องพระราชสวามี...',
                duration: 5000
            },
            {
                image: 'images/story/story_scene_04.png',
                subtitle: 'การรบอันดุเดือดบนหลังช้าง พระสุริโยทัยทรงสละพระชนม์ชีพเพื่อปกป้องพระมหาจักรพรรดิ...',
                duration: 5000
            }
        ]
    }
};

export class StoryCutscene {
    constructor(game) {
        this.game = game;
        this.currentCampaign = null;
        this.currentScene = 0;
        this.isPlaying = false;
        this.sceneTimer = 0;
        this.fadeAlpha = 0;
        this.fadeDirection = 'in'; // 'in', 'hold', 'out'
        this.images = {};
        this.onComplete = null;

        this.createUI();
    }

    createUI() {
        // Create story overlay container
        const overlay = document.createElement('div');
        overlay.id = 'story-overlay';
        overlay.className = 'story-overlay hidden';
        overlay.innerHTML = `
            <div class="story-container">
                <div class="story-image-wrapper">
                    <img id="story-image" class="story-image" src="" alt="Story Scene">
                </div>
                <div class="story-subtitle-box">
                    <p id="story-subtitle"></p>
                </div>
                <div class="story-controls">
                    <button id="story-skip" class="story-btn">⏭️ ข้าม</button>
                    <button id="story-next" class="story-btn primary">▶️ ถัดไป</button>
                </div>
                <div class="story-progress">
                    <div class="story-progress-bar" id="story-progress-bar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add CSS
        this.addStyles();

        // Setup event listeners
        document.getElementById('story-skip')?.addEventListener('click', () => this.skip());
        document.getElementById('story-next')?.addEventListener('click', () => this.nextScene());
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .story-overlay {
                position: fixed;
                inset: 0;
                background: #000;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .story-container {
                width: 100%;
                max-width: 1200px;
                position: relative;
            }
            
            .story-image-wrapper {
                width: 100%;
                aspect-ratio: 16/9;
                background: #111;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 50px rgba(0,0,0,0.8);
            }
            
            .story-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 1;
                transition: opacity 0.5s ease;
            }
            
            .story-subtitle-box {
                position: absolute;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85);
                padding: 20px 40px;
                border-radius: 10px;
                max-width: 80%;
                border: 2px solid rgba(212, 175, 55, 0.5);
            }
            
            .story-subtitle-box p {
                color: #fff;
                font-size: 1.3rem;
                line-height: 1.6;
                text-align: center;
                margin: 0;
                font-family: 'Kanit', sans-serif;
            }
            
            .story-controls {
                position: absolute;
                bottom: 30px;
                right: 30px;
                display: flex;
                gap: 15px;
            }
            
            .story-btn {
                padding: 12px 25px;
                background: rgba(26, 31, 58, 0.9);
                border: 2px solid rgba(212, 175, 55, 0.5);
                color: #fff;
                border-radius: 8px;
                font-family: 'Kanit', sans-serif;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .story-btn:hover {
                background: rgba(40, 50, 80, 0.9);
                border-color: #d4af37;
            }
            
            .story-btn.primary {
                background: linear-gradient(135deg, #b8860b, #d4af37);
                color: #1a1f3a;
                border-color: #d4af37;
                font-weight: 600;
            }
            
            .story-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: rgba(255,255,255,0.1);
            }
            
            .story-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #d4af37, #f4d03f);
                width: 0%;
                transition: width 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    async preloadImages(campaignId) {
        const storyData = STORY_DATA[campaignId];
        if (!storyData) return;

        const promises = storyData.scenes.map((scene, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.images[index] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load story image: ${scene.image}`);
                    resolve();
                };
                img.src = scene.image;
            });
        });

        await Promise.all(promises);
    }

    async play(campaignId, onComplete) {
        this.currentCampaign = campaignId;
        this.currentScene = 0;
        this.isPlaying = true;
        this.onComplete = onComplete;

        const storyData = STORY_DATA[campaignId];
        if (!storyData || storyData.scenes.length === 0) {
            console.log('No story data, starting game directly');
            onComplete?.();
            return;
        }

        // Preload images
        await this.preloadImages(campaignId);

        // Show overlay
        const overlay = document.getElementById('story-overlay');
        overlay?.classList.remove('hidden');

        // Start first scene
        this.showScene(0);
    }

    showScene(index) {
        const storyData = STORY_DATA[this.currentCampaign];
        if (!storyData || index >= storyData.scenes.length) {
            this.complete();
            return;
        }

        this.currentScene = index;
        const scene = storyData.scenes[index];

        // Update image
        const imgElement = document.getElementById('story-image');
        if (imgElement) {
            imgElement.style.opacity = '0';
            setTimeout(() => {
                imgElement.src = scene.image;
                imgElement.style.opacity = '1';
            }, 300);
        }

        // Update subtitle with typewriter effect
        const subtitleElement = document.getElementById('story-subtitle');
        if (subtitleElement) {
            this.typewriterEffect(subtitleElement, scene.subtitle);
        }

        // Update progress
        const progress = ((index + 1) / storyData.scenes.length) * 100;
        const progressBar = document.getElementById('story-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Auto advance timer
        this.sceneTimer = setTimeout(() => {
            this.nextScene();
        }, scene.duration);
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);
    }

    nextScene() {
        clearTimeout(this.sceneTimer);

        const storyData = STORY_DATA[this.currentCampaign];
        if (this.currentScene + 1 >= storyData.scenes.length) {
            this.complete();
        } else {
            this.showScene(this.currentScene + 1);
        }
    }

    skip() {
        clearTimeout(this.sceneTimer);
        this.complete();
    }

    complete() {
        this.isPlaying = false;

        // Hide overlay
        const overlay = document.getElementById('story-overlay');
        overlay?.classList.add('hidden');

        // Call completion callback
        this.onComplete?.();
    }
}
