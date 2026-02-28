// ===================================
// RTS: ยุทธการไทย - Story Cutscene System
// Displays story images with Thai subtitles
// ===================================

export const STORY_DATA = {
    // Campaign Intro
    white_elephant: {
        title: 'สงครามช้างเผือก',
        titleEn: 'The War of the White Elephants',
        year: 'พ.ศ. 2090-2092 (ค.ศ. 1547-1549)',
        scenes: [
            {
                image: 'images/story/campaign_intro.png',
                subtitle: 'มหาศึกแห่งอุษาคเนย์ สงครามระหว่างกรุงศรีอยุธยาและหงสาวดี กำลังจะระเบิดขึ้น...',
                duration: 6000
            }
        ]
    },
    // Mission 1
    campaign1_mission1: {
        title: 'ศึกที่ราบกาญจนบุรี',
        scenes: [
            {
                image: 'images/story/mission_1.png',
                subtitle: 'กองทัพหน้าของพม่าเคลื่อนพลผ่านด่านเจดีย์สามองค์ เข้าสู่ที่ราบกาญจนบุรี กองทัพสยามต้องสกัดกั้น!',
                duration: 6000
            }
        ]
    },
    // Mission 2
    campaign1_mission2: {
        title: 'ศึกท่าวาย',
        scenes: [
            {
                image: 'images/story/mission_2.png',
                subtitle: 'กองทัพสยามยกพลบุกยึดเมืองท่าวาย เมืองหน้าด่านสำคัญทางฝั่งทะเลอันดามัน',
                duration: 6000
            }
        ]
    },
    // Mission 3
    campaign1_mission3: {
        title: 'ด่านเจดีย์สามองค์',
        scenes: [
            {
                image: 'images/story/mission_3.png',
                subtitle: 'พม่าระดมทัพใหญ่บุกกลับทางด่านเจดีย์สามองค์ การป้องกันช่องเขานี้คือหัวใจสำคัญ',
                duration: 6000
            }
        ]
    },
    // Mission 4
    campaign1_mission4: {
        title: 'ที่ราบกาญจนบุรี',
        scenes: [
            {
                image: 'images/story/mission_4.png',
                subtitle: 'สงครามเต็มรูปแบบ! สองกองทัพเผชิญหน้ากันบนทุ่งกว้าง ณ กาญจนบุรี',
                duration: 6000
            }
        ]
    },
    // Mission 5
    campaign1_mission5: {
        title: 'ล้อมกรุงศรีอยุธยา',
        scenes: [
            {
                image: 'images/story/mission_5.png',
                subtitle: 'ข้าศึกประชิดพระนคร! กองทัพพม่าล้อมกรุงศรีอยุธยาไว้ทุกด้าน สถานการณ์คับขันถึงขีดสุด',
                duration: 6000
            }
        ]
    },
    // Mission 6
    campaign1_mission6: {
        title: 'ยุทธหัตถี',
        scenes: [
            {
                image: 'images/story/mission_6.png',
                subtitle: 'วีรกรรมแห่งประวัติศาสตร์ สมเด็จพระสุริโยทัยทรงไสช้างเข้าขวางศัตรูเพื่อปกป้องพระราชสวามี',
                duration: 7000
            }
        ]
    },
    // Mission 7
    campaign1_mission7: {
        title: 'ขับไล่ข้าศึก',
        scenes: [
            {
                image: 'images/story/mission_7.png',
                subtitle: 'กองทัพพม่าเสียขวัญและเริ่มถอยร่น ได้เวลาบุกตีโต้เพื่อขับไล่ออกไปจากแผ่นดิน!',
                duration: 6000
            }
        ]
    },
    // Mission 8
    campaign1_mission8: {
        title: 'กำแพงเพชร',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ฉากเปิดภารกิจ 8 กำแพงเพชร):
                 * "An epic cinematic wide shot of the historical Thai city of Kamphaeng Phet under brutal siege by the Burmese army. In the foreground, Ayutthaya soldiers are fighting alongside Portuguese mercenaries armed with matchlock muskets on the city walls, defending against waves of attackers. Smoke and fire in the background. High quality, digital painting, historical fantasy art style, dramatic lighting."
                 */
                image: 'images/story/mission_8v2.png',
                subtitle: 'การรบครั้งสุดท้าย ณ เมืองกำแพงเพชร ร่วมมือกับทหารรับจ้างโปรตุเกสปกป้องเมือง!',
                duration: 6000
            }
        ]
    },

    // ======================================
    // Campaign 2: สงครามท่าดินแดง
    // ======================================
    tha_din_daeng: {
        title: 'สงครามท่าดินแดง',
        titleEn: 'Tha Din Daeng Campaign',
        year: 'พ.ศ. 2329 (ค.ศ. 1786)',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ฉากเปิดแคมเปญ 2 สงครามท่าดินแดง):
                 * "A dramatic cinematic illustration of King Bodawpaya of Burma's massive army setting up camp at Tha Din Daeng and Sam Sop. Thousands of tents, campfires, and soldiers in the dense Thai-Burmese border jungle, preparing for an invasion. Epic scale, historical fantasy art style, digital painting."
                 */
                image: 'images/campain 2/title_1.jpg',
                subtitle: 'หลังสงครามเก้าทัพ พระเจ้าปดุงยกทัพมาตั้งมั่น ณ ท่าดินแดงและสามสบ หวังจะเข้าตีพระนครอีกครั้ง...',
                duration: 6000
            }
        ]
    },
    campaign2_mission1: {
        title: 'การสำรวจต้นน้ำ',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ภารกิจ 1 การสำรวจต้นน้ำ):
                 * "The Front Palace Prince (Maha Sura Singhanat) of Siam leading a group of fast cavalry scouts through a dense, foggy tropical jungle. They are stealthily searching for the hidden Burmese camps. Tense and mysterious atmosphere, high quality, historical fantasy art style, digital painting."
                 */
                image: 'images/campain 2/title_2.jpg',
                subtitle: 'กรมพระราชวังบวรฯ ทรงนำทัพล่วงหน้า นำหน่วยม้าเร็วบุกป่าฝ่าดง เพื่อสืบหาที่ตั้งค่ายของข้าศึก',
                duration: 6000
            }
        ]
    },
    campaign2_mission2: {
        title: 'ตัดเส้นทางเสบียง',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ภารกิจ 2 ตัดเส้นทางเสบียง):
                 * "Siam forces hiding in the dense jungle underbrush, launching a surprise ambush on a Burmese supply convoy and granaries. Arrows flying, swords clashing, chaotic battle in the forest. Epic lighting, historical fantasy art style, digital painting."
                 */
                image: 'images/campain 2/title_3.jpg',
                subtitle: 'ทัพหลวงของพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช วางกำลังดักซุ่มกลางป่า ทำลายขบวนเสบียงพม่า',
                duration: 6000
            }
        ]
    },
    campaign2_mission3: {
        title: 'ยุทธการท่าดินแดง',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ภารกิจ 3 ยุทธการท่าดินแดง):
                 * "The climax of the Tha Din Daeng campaign. An epic full-scale battle where the King Rama I's main army and the Front Palace Prince's vanguard army converge to attack three massive Burmese fortress camps simultaneously. Elephants charging, muskets firing, walls burning. Masterpiece, highly detailed, historical fantasy art style, digital painting."
                 */
                image: 'images/campain 2/title_4.jpg',
                subtitle: 'ถึงเวลาแตกหัก ทัพหน้าและทัพหลวงบรรจบกัน บุกโจมตีค่ายพม่าทั้งสามแห่งพร้อมกัน!',
                duration: 6000
            }
        ]
    },
    campaign2_mission4: {
        title: 'การรุกไล่',
        scenes: [
            {
                /*
                 * TEXT PROMPT FOR IMAGE GENERATION (ภารกิจ 4 การรุกไล่):
                 * "Victorious Siamese forces chasing retreating Burmese soldiers through the rugged terrain of the border. In the background, Burmese camps are engulfed in flames. The Siamese army standing triumphant but exhausted. Dramatic lighting, historical fantasy art style, digital painting."
                 */
                image: 'images/campain 2/title_5.jpg',
                subtitle: 'ค่ายพม่าถูกเผาทำลายสิ้น กรมพระราชวังบวรฯ ทรงนำทัพไล่ตีข้าศึกที่หนีเตลิดไปจนพ้นพรมแดนสยาม',
                duration: 6000
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
        this.fadeDirection = 'in'; // 'in', 'hold', 'out'
        this.images = {};
        this.onComplete = null;
        this.typewriterInterval = null;

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
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        element.textContent = '';
        let i = 0;
        this.typewriterInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
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
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }

        // Hide overlay
        const overlay = document.getElementById('story-overlay');
        overlay?.classList.add('hidden');

        // Call completion callback
        this.onComplete?.();
    }
}
