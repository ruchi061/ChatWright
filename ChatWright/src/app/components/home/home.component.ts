import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
@ViewChild('logoRef', { static: true }) logoRef!: ElementRef<HTMLDivElement>;

  // Live CSS variables for translate amounts
  logoVars: Record<string, string> = { '--dx': '0px', '--dy': '0px' };

  // Animation state
  private targetDx = 0;
  private targetDy = 0;
  private dx = 0;
  private dy = 0;
  private rafId: number | null = null;

  // Config: how far the pupils can move and how quickly they chase the cursor
  private readonly MAX_MOVE_PX = 14;   // clamp radius; tweak to taste
  private readonly SMOOTHING = 0.12;   // 0..1 (higher = snappier)

  constructor(private zone: NgZone) {
    // start RAF loop outside Angular for best perf
    this.zone.runOutsideAngular(() => this.animate());
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev: MouseEvent) {
    this.updateTarget(ev.clientX, ev.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(ev: TouchEvent) {
    const t = ev.touches[0];
    if (t) this.updateTarget(t.clientX, t.clientY);
  }

  private updateTarget(clientX: number, clientY: number) {
    const rect = this.logoRef.nativeElement.getBoundingClientRect();

    // Use the logo container center as the eye "anchor".
    // If your eyes are placed in a different area, bias the center here.
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let vx = clientX - cx;
    let vy = clientY - cy;

    // Normalize and clamp to MAX_MOVE_PX
    const len = Math.hypot(vx, vy) || 1;
    vx = (vx / len) * this.MAX_MOVE_PX;
    vy = (vy / len) * this.MAX_MOVE_PX;

    this.targetDx = vx;
    this.targetDy = vy;
  }

  private animate = () => {
    // Smoothly approach the target (lerp)
    this.dx += (this.targetDx - this.dx) * this.SMOOTHING;
    this.dy += (this.targetDy - this.dy) * this.SMOOTHING;

    // Push CSS vars (these are read in CSS transform below)
    this.logoVars = {
      '--dx': `${this.dx.toFixed(2)}px`,
      '--dy': `${this.dy.toFixed(2)}px`
    };

    this.rafId = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
  }

  private animationTriggered = false;
  private animationInProgress = false;

  ngOnInit() {
    // Initial scroll check
    this.checkScrollAnimations();
  }



  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations() {
    const workflowSteps = document.querySelectorAll('.workflow-step');
    const workflowArrows = document.querySelectorAll('.workflow-arrow');
    const windowHeight = window.innerHeight;
    const howItWorksSection = document.querySelector('.how-it-works-section');

    if (!howItWorksSection || this.animationTriggered || this.animationInProgress) return;

    const sectionTop = howItWorksSection.getBoundingClientRect().top;
    const sectionVisible = 300;

    // Check if "How It Works" section is visible
    if (sectionTop < windowHeight - sectionVisible) {
      this.animationTriggered = true;
      this.animationInProgress = true;

      // Start progressive reveal animation
      this.startProgressiveAnimation(workflowSteps, workflowArrows);
    }

    // Check for general scroll animations
    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }

  private startProgressiveAnimation(steps: NodeListOf<Element>, arrows: NodeListOf<Element>) {
    // Step 1: Reveal first step
    setTimeout(() => {
      steps[0].classList.add('visible');
    }, 200);

    // Step 2: Show first arrow after step 1
    setTimeout(() => {
      arrows[0].classList.add('visible');
    }, 1200);

    // Step 3: Reveal second step after arrow
    setTimeout(() => {
      steps[1].classList.add('visible');
    }, 2000);

    // Step 4: Show second arrow
    setTimeout(() => {
      arrows[1].classList.add('visible');
    }, 3000);

    // Step 5: Reveal third step
    setTimeout(() => {
      steps[2].classList.add('visible');
    }, 3800);

    // Step 6: Show third arrow
    setTimeout(() => {
      arrows[2].classList.add('visible');
    }, 4800);

    // Step 7: Reveal final step
    setTimeout(() => {
      steps[3].classList.add('visible');
      this.animationInProgress = false;
    }, 5600);
  }
}
