/**
 * ai-bg.js
 * Premium AI-inspired animated background matching the AVEOL gold & dark aesthetic.
 * Modular implementation to keep the main codebase clean.
 */

class AveolAABackground {
    constructor() {
        this.canvas = document.getElementById('aveol-ai-particles');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        
        // Colors mapped to existing AVEOL palette
        // --gold: #c9a24d (201, 162, 77)
        this.config = {
            baseColor: '201, 162, 77',
            particleCount: this.calculateParticleCount(),
            maxDistance: 140, // Neural connection distance
            mouseRepelRadius: 150,
            mouseRepelForce: 0.04,
            particleSpeed: 0.25, // Slower, elegant drift
            parallaxFactor: 0.015
        };

        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.targetMouse = { x: -1000, y: -1000 };
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // Cap pixel ratio to 2 for performance on high-DPI screens
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2); 
        
        this.init();
        this.bindEvents();
        this.animate();
    }

    calculateParticleCount() {
        // Keeps it minimal and elegant, preventing clutter and lag
        const area = window.innerWidth * window.innerHeight;
        return Math.min(Math.floor(area / 12000), 80);
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        const newCount = this.calculateParticleCount();
        if (Math.abs(this.particles.length - newCount) > 15) {
            this.config.particleCount = newCount;
            this.createParticles();
        }
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            const vx = (Math.random() - 0.5) * this.config.particleSpeed;
            const vy = (Math.random() - 0.5) * this.config.particleSpeed;
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx, vy, baseVx: vx, baseVy: vy,
                radius: Math.random() * 1.2 + 0.4,
                opacity: Math.random() * 0.4 + 0.1 // Softer opacity
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize(), { passive: true });
        
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = e.clientX;
            this.targetMouse.y = e.clientY;
            this.applyParallax(e.clientX, e.clientY);
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            this.targetMouse.x = -1000;
            this.targetMouse.y = -1000;
        }, { passive: true });
    }

    applyParallax(mouseX, mouseY) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (mouseX - cx) * this.config.parallaxFactor;
        const dy = (mouseY - cy) * this.config.parallaxFactor;
        
        document.querySelectorAll('.aveol-ambient-glow').forEach((glow, index) => {
            const factor = (index + 1) * 0.6;
            glow.style.transform = `translate(${-dx * factor}px, ${-dy * factor}px)`;
        });
    }

    animate() {
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;

        // Optimization: pause heavy drawing if scrolled far down where background isn't visible
        // We assume hero section is roughly window height
        if (window.scrollY < window.innerHeight * 1.5) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.updateParticles();
            this.drawConnections();
            this.drawParticles();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        const { width, height } = this;
        const { mouseRepelRadius, mouseRepelForce } = this.config;
        
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            let dx = p.x - this.mouse.x;
            let dy = p.y - this.mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            // Subtle mouse repulsion
            if (dist < mouseRepelRadius && dist > 0) {
                let force = (mouseRepelRadius - dist) / mouseRepelRadius;
                p.vx += (dx / dist) * force * mouseRepelForce;
                p.vy += (dy / dist) * force * mouseRepelForce;
            }
            
            // Return to natural movement slowly
            p.vx += (p.baseVx - p.vx) * 0.02;
            p.vy += (p.baseVy - p.vy) * 0.02;
            
            p.x += p.vx;
            p.y += p.vy;
            
            // Wrap around edges smoothly
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;
        }
    }

    drawConnections() {
        const maxDistSq = this.config.maxDistance * this.config.maxDistance;
        this.ctx.lineWidth = 0.8;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                let p1 = this.particles[i];
                let p2 = this.particles[j];
                
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let distSq = dx * dx + dy * dy;
                
                if (distSq < maxDistSq) {
                    let dist = Math.sqrt(distSq);
                    let opacity = 1 - (dist / this.config.maxDistance);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${this.config.baseColor}, ${opacity * 0.25})`;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.config.baseColor}, ${p.opacity})`;
            this.ctx.fill();
            
            // Add subtle glow to larger particles
            if (p.radius > 1.3) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = `rgba(${this.config.baseColor}, 0.5)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AveolAABackground();
});
