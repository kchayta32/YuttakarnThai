/**
 * PaknamCutscene Class
 * Handles intro, outro, and mid-mission cutscenes for Campaign 3
 * ระบบคัทซีน สำหรับแคมเปญ 3 วิกฤตการณ์ปากน้ำ
 */

class PaknamCutscene {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.isPlaying = false;

        // DOM Elements
        this.container = null;
        this.titleEl = null;
        this.subtitleEl = null;
        this.textEl = null;
        this.imageEl = null;
        this.skipBtn = null;

        // Callbacks
        this.onComplete = null;

        // Setup DOM
        this.setupDOM();
    }

    /**
     * Create isolated DOM elements for the cutscene
     */
    setupDOM() {
        // Container
        this.container = document.createElement('div');
        this.container.id = 'paknam-cutscene';
        this.container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            z-index: 2000;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: 'Sarabun', 'Arial', sans-serif;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            pointer-events: none;
        `;

        // Image container (for historical photos)
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            width: 80%;
            max-width: 800px;
            height: 40vh;
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border: 2px solid #555;
            box-shadow: 0 0 20px rgba(0,0,0,0.8);
            opacity: 0;
            transform: scale(0.95);
            transition: all 2s ease-out;
        `;

        this.imageEl = document.createElement('img');
        this.imageEl.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: sepia(0.6) contrast(1.2); /* Old photo effect */
        `;
        imageContainer.appendChild(this.imageEl);

        // Text wrapper
        const textWrapper = document.createElement('div');
        textWrapper.style.cssText = `
            text-align: center;
            max-width: 800px;
            padding: 20px;
        `;

        // Title
        this.titleEl = document.createElement('h1');
        this.titleEl.style.cssText = `
            font-size: 48px;
            margin: 0 0 10px 0;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            opacity: 0;
            transform: translateY(20px);
            transition: all 1s ease-out;
        `;

        // Subtitle
        this.subtitleEl = document.createElement('h3');
        this.subtitleEl.style.cssText = `
            font-size: 24px;
            margin: 0 0 30px 0;
            color: #ccc;
            opacity: 0;
            transform: translateY(20px);
            transition: all 1s ease-out;
        `;

        // Description Text
        this.textEl = document.createElement('p');
        this.textEl.style.cssText = `
            font-size: 20px;
            line-height: 1.6;
            margin: 0;
            white-space: pre-line; /* Respect newlines */
            opacity: 0;
            transition: opacity 1s ease-in;
        `;

        // Assemble
        textWrapper.appendChild(this.titleEl);
        textWrapper.appendChild(this.subtitleEl);
        textWrapper.appendChild(this.textEl);

        this.container.appendChild(imageContainer);
        this.container.appendChild(textWrapper);

        // Skip Button
        this.skipBtn = document.createElement('button');
        this.skipBtn.textContent = 'ข้าม (Skip)';
        this.skipBtn.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        this.skipBtn.onmouseenter = () => this.skipBtn.style.background = 'rgba(255,255,255,0.3)';
        this.skipBtn.onmouseleave = () => this.skipBtn.style.background = 'rgba(255,255,255,0.1)';
        this.skipBtn.onclick = () => this.endCutscene();

        this.container.appendChild(this.skipBtn);

        // Add to document
        document.body.appendChild(this.container);
    }

    /**
     * Play Intro Cutscene
     */
    async playIntro(data) {
        return new Promise((resolve) => {
            this.isPlaying = true;
            this.onComplete = resolve;

            // Set content
            this.titleEl.textContent = data.title || "วิกฤตการณ์ปากน้ำ";
            this.subtitleEl.textContent = data.subtitle || "๑๓ กรกฎาคม พ.ศ. ๒๔๓๖";
            this.textEl.textContent = data.description || "ป้องกันการรุกรานของจักรวรรดินิยมฝรั่งเศส";

            // Set image (use fallback if none provided)
            this.imageEl.src = data.image || "images/campain 3/ui/intro_bg.png";

            // Stop game audio if needed
            if (this.game.soundManager) {
                this.game.soundManager.stopAll();
            }

            this.showSequence(data.duration || 8000);
        });
    }

    /**
     * Play Outro Cutscene (Victory or Defeat)
     */
    async playOutro(data) {
        return new Promise((resolve) => {
            this.isPlaying = true;
            this.onComplete = resolve;

            const isVictory = data.victory;

            // Set content based on outcome
            if (isVictory) {
                this.titleEl.textContent = "ภารกิจสำเร็จ";
                this.titleEl.style.color = "#4CAF50";
                this.subtitleEl.textContent = "สยามปกป้องอธิปไตยไว้ได้ส่วนหนึ่ง";

                let statsText = `เวลาใช้ไป: ${Math.floor(data.time / 60)} นาที ${Math.floor(data.time % 60)} วินาที\n`;
                statsText += `เรือฝรั่งเศสที่ถูกทำลาย: ${data.shipsDestroyed} ลำ\n\n`;
                statsText += `แม้จะสามารถป้องกันกรุงเทพฯ ไว้ได้ แต่สยามก็ต้อง\nยอมรับข้อเรียกร้องของฝรั่งเศสในเวลาต่อมา\nเพื่อรักษาเอกราชของชาติไว้`;

                this.textEl.textContent = statsText;
                this.imageEl.src = "images/campain 3/ui/victory_bg.png";

                if (this.game.soundManager) {
                    this.game.soundManager.play("victory_theme");
                }
            } else {
                this.titleEl.textContent = "ภารกิจล้มเหลว";
                this.titleEl.style.color = "#F44336";
                this.subtitleEl.textContent = "ป้อมพระจุลจอมเกล้าแตก หรือ กองเรือฝรั่งเศสบุกถึงพระนคร";

                this.textEl.textContent = "ประวัติศาสตร์ได้เปลี่ยนไปในทางที่เลวร้ายที่สุด\nสยามสูญเสียเอกราช";
                this.imageEl.src = "images/campain 3/ui/defeat_bg.png";

                if (this.game.soundManager) {
                    this.game.soundManager.play("defeat_theme");
                }
            }

            this.showSequence(10000); // 10 seconds for outro
        });
    }

    /**
     * Run the visual sequence
     */
    showSequence(duration) {
        // Reset properties
        this.titleEl.style.opacity = '0';
        this.titleEl.style.transform = 'translateY(20px)';
        this.subtitleEl.style.opacity = '0';
        this.subtitleEl.style.transform = 'translateY(20px)';
        this.textEl.style.opacity = '0';
        this.skipBtn.style.opacity = '0';

        const imgContainer = this.imageEl.parentElement;
        imgContainer.style.opacity = '0';
        imgContainer.style.transform = 'scale(0.95)';

        // Show container
        this.container.style.display = 'flex';
        this.container.style.pointerEvents = 'auto'; // allow clicks

        // Trigger reflow
        void this.container.offsetWidth;

        // Sequence animations
        // 1. Fade in container
        this.container.style.opacity = '1';

        // 2. Animate elements in sequence
        this.sequenceTimeout1 = setTimeout(() => {
            if (!this.isPlaying) return;
            imgContainer.style.opacity = '1';
            imgContainer.style.transform = 'scale(1)';
        }, 500);

        this.sequenceTimeout2 = setTimeout(() => {
            if (!this.isPlaying) return;
            this.titleEl.style.opacity = '1';
            this.titleEl.style.transform = 'translateY(0)';
        }, 1500);

        this.sequenceTimeout3 = setTimeout(() => {
            if (!this.isPlaying) return;
            this.subtitleEl.style.opacity = '1';
            this.subtitleEl.style.transform = 'translateY(0)';
        }, 2500);

        this.sequenceTimeout4 = setTimeout(() => {
            if (!this.isPlaying) return;
            this.textEl.style.opacity = '1';
            this.skipBtn.style.opacity = '1';

            // Slow zoom effect on image
            this.imageEl.style.transform = 'scale(1.1)';
            this.imageEl.style.transition = `transform ${duration - 3500}ms linear`;
        }, 3500);

        // 3. Auto end after duration
        this.sequenceTimeout5 = setTimeout(() => {
            if (this.isPlaying) {
                this.endCutscene();
            }
        }, duration);
    }

    /**
     * End cutscene early or when finished
     */
    endCutscene() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        // Clear all timeouts
        clearTimeout(this.sequenceTimeout1);
        clearTimeout(this.sequenceTimeout2);
        clearTimeout(this.sequenceTimeout3);
        clearTimeout(this.sequenceTimeout4);
        clearTimeout(this.sequenceTimeout5);

        // Fade out
        this.container.style.opacity = '0';
        this.container.style.pointerEvents = 'none';

        // Reset image transform
        this.imageEl.style.transition = 'none';
        this.imageEl.style.transform = 'scale(1)';

        // Hide after fade
        setTimeout(() => {
            this.container.style.display = 'none';
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }

            // Start game music if intro
            if (this.titleEl.textContent.includes("ปากน้ำ") && this.game.soundManager) {
                // this.game.soundManager.playMusic("campaign3_theme");
            }
        }, 1000);
    }
}

// Export for use
export { PaknamCutscene };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaknamCutscene;
}
