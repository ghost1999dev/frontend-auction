import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  fireConfetti(): void {
    const count = 400;
    const defaults: confetti.Options = {
      origin: { y: 0.6 },
      spread: 85,
      startVelocity: 45,
      ticks: 300,
      gravity: 0.4,
      decay: 0.92,
      colors: [
        '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF',
        '#FF8000', '#FF0080', '#00FF80',
        '#FFFFFF'
      ],
      scalar: 1.3,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true
    };

    const fire = (particleRatio: number, opts: Partial<confetti.Options> = {}) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    };

    // Initial shots
    fire(0.3, { 
      spread: 35, 
      startVelocity: 65,
      decay: 0.89,
      scalar: 1.5,
      colors: ['#FF0000', '#FFFF00', '#FFFFFF']
    });
    
    fire(0.25, { 
      spread: 80,
      ticks: 350,
      gravity: 0.3,
      colors: ['#00FF00', '#00FFFF', '#FFFFFF']
    });
    
    fire(0.35, { 
      spread: 120, 
      decay: 0.94,
      scalar: 1.1,
      gravity: 0.35,
      shapes: ['circle'] as const
    });

    // Delayed shots
    setTimeout(() => {
      fire(0.15, { 
        spread: 150, 
        startVelocity: 30, 
        decay: 0.96, 
        scalar: 1.4,
        colors: ['#0000FF', '#00FFFF', '#FFFFFF'],
        shapes: ['square'] as const
      });
      
      fire(0.15, { 
        spread: 150, 
        startVelocity: 50,
        ticks: 400,
        colors: ['#FF0000', '#FF8000', '#FFFF00'],
        scalar: 1.6
      });

      // Side shots
      confetti({
        ...defaults,
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FF0000', '#FF8000']
      });
      
      confetti({
        ...defaults,
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#0000FF', '#00FFFF']
      });
    }, 800);

    // Final phase
    setTimeout(() => {
      fire(0.2, {
        spread: 100,
        startVelocity: 25,
        decay: 0.98,
        ticks: 500,
        gravity: 0.2,
        scalar: 1.8,
        colors: ['#FF00FF', '#FFFFFF', '#FFFF00']
      });
      
      setTimeout(() => {
        fire(0.1, {
          spread: 200,
          startVelocity: 20,
          decay: 0.99,
          ticks: 600,
          gravity: 0.1,
          scalar: 2.0
        });
      }, 500);
    }, 1800);
  }
}