import React, { useEffect, useRef, useState, useCallback } from 'react';

const ErlenmeyerFlask: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for dark mode
  const checkDarkMode = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initial dark mode check
    checkDarkMode();
    
    // For high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set canvas dimensions in CSS
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Animation variables
    let liquidLevel = 0.2; // Start with flask 50% full - we'll be adding to it
    let droplets: { x: number, y: number, size: number, speed: number, opacity: number }[] = [];
    
    // Colors based on mode
    const getColors = () => {
      if (isDarkMode) {
        return {
          flaskColor: '#374151',
          liquidColor: '#3b82f6',
          liquidHighlight: '#60a5fa',
          bubbleColor: 'rgba(255, 255, 255, 0.5)',
          outlineColor: '#4b5563',
          reflectionColor: 'rgba(255, 255, 255, 0.15)',
          glowColor: 'rgba(59, 130, 246, 0.2)'
        };
      } else {
        return {
          flaskColor: '#e5e7eb',
          liquidColor: '#3b82f6',
          liquidHighlight: '#60a5fa',
          bubbleColor: 'rgba(255, 255, 255, 0.7)',
          outlineColor: '#d1d5db',
          reflectionColor: 'rgba(255, 255, 255, 0.2)',
          glowColor: 'rgba(59, 130, 246, 0.1)'
        };
      }
    };
    
    // Add bubbles to simulate chemical reaction
    let bubbles: { x: number, y: number, size: number, speed: number, opacity: number }[] = [];
    
    const drawFlask = () => {
      const width = rect.width;
      const height = rect.height;
      
      // Get current color scheme
      const colors = getColors();
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Add a subtle glow effect in dark mode
      if (isDarkMode) {
        const glow = ctx.createRadialGradient(
          width/2, height/2, 10,
          width/2, height/2, Math.max(width, height)
        );
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      
      // Draw flask neck
      const neckWidth = width * 0.15; // Thinner neck
      const neckHeight = height * 0.35; // Longer neck
      const neckX = width / 2 - neckWidth / 2;
      
      // Create a flask shape (with outline)
      const bodyTopWidth = width * 0.35; // Narrower top
      const bodyBottomWidth = width * 0.75; // Wider bottom
      const bodyHeight = height * 0.65; // Shorter body
      const bodyTopY = neckHeight;
      
      // Draw shadow effect for depth
      if (!isDarkMode) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        // Glow effect in dark mode
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Draw flask outline
      ctx.strokeStyle = colors.outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Neck outline
      ctx.rect(neckX, 0, neckWidth, neckHeight);
      // Body outline
      ctx.moveTo(neckX, neckHeight);
      ctx.lineTo(width / 2 - bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(width / 2 - bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(neckX + neckWidth, neckHeight);
      ctx.stroke();
      
      // Reset shadow for the rest of the drawing
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Fill flask
      ctx.fillStyle = colors.flaskColor;
      ctx.beginPath();
      // Neck
      ctx.rect(neckX, 0, neckWidth, neckHeight);
      ctx.fill();
      
      // Flask body
      ctx.beginPath();
      ctx.moveTo(neckX, neckHeight);
      ctx.lineTo(width / 2 - bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(width / 2 - bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(neckX + neckWidth, neckHeight);
      ctx.closePath();
      ctx.fill();
      
      // Add glass reflections for realism
      // Light reflection on the right side of the flask
      const rightReflection = ctx.createLinearGradient(
        width / 2 + bodyTopWidth * 0.3, 
        bodyTopY,
        width / 2 + bodyBottomWidth * 0.4, 
        height
      );
      rightReflection.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      rightReflection.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      rightReflection.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.fillStyle = rightReflection;
      ctx.beginPath();
      ctx.moveTo(width / 2 + bodyTopWidth * 0.3, bodyTopY);
      ctx.lineTo(width / 2 + bodyBottomWidth * 0.3, height);
      ctx.lineTo(width / 2 + bodyBottomWidth * 0.4, height);
      ctx.lineTo(width / 2 + bodyTopWidth * 0.4, bodyTopY);
      ctx.closePath();
      ctx.fill();
      
      // Light reflection on the neck
      const neckReflection = ctx.createLinearGradient(
        neckX + neckWidth * 0.7,
        0,
        neckX + neckWidth * 0.9,
        neckHeight
      );
      neckReflection.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      neckReflection.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.fillStyle = neckReflection;
      ctx.beginPath();
      ctx.rect(neckX + neckWidth * 0.7, 0, neckWidth * 0.2, neckHeight);
      ctx.fill();
      
      // Draw liquid inside flask
      const currentLiquidLevel = height - (liquidLevel * bodyHeight);
      
      // Calculate where liquid meets the flask walls
      const liquidTopWidth = interpolateWidth(currentLiquidLevel);
      const liquidTopX = width / 2 - liquidTopWidth / 2;
      
      // Create gradient for liquid with different colors based on mode
      const liquidGradient = ctx.createLinearGradient(
        width / 2 - liquidTopWidth / 2, 
        currentLiquidLevel, 
        width / 2 + liquidTopWidth / 2, 
        height
      );
      
      // Enhanced liquid appearance
      if (isDarkMode) {
        liquidGradient.addColorStop(0, '#60a5fa');  // Top color - lighter
        liquidGradient.addColorStop(0.4, '#3b82f6'); // Middle color
        liquidGradient.addColorStop(1, '#2563eb');  // Bottom color - darker
        
        // Add glow effect
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 15;
      } else {
        liquidGradient.addColorStop(0, '#60a5fa');  // Top color - lighter
        liquidGradient.addColorStop(0.4, '#3b82f6'); // Middle color
        liquidGradient.addColorStop(1, '#2563eb');  // Bottom color - darker
      }
      
      ctx.fillStyle = liquidGradient;
      ctx.beginPath();
      ctx.moveTo(liquidTopX, currentLiquidLevel);
      ctx.lineTo(width / 2 - bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + liquidTopWidth / 2, currentLiquidLevel);
      ctx.closePath();
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Add reflection/highlight to liquid (curved surface) - more dynamic
      // const waveHeight = 8 + Math.sin(Date.now() * 0.003) * 3; // Animated wave height
      const gradientHeight = 20;
      const gradient = ctx.createLinearGradient(0, currentLiquidLevel, 0, currentLiquidLevel + gradientHeight);
      gradient.addColorStop(0, colors.liquidHighlight);
      gradient.addColorStop(1, colors.liquidColor);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Create a more natural wavy liquid surface
      ctx.moveTo(liquidTopX, currentLiquidLevel);
      
      // Draw a curved wave pattern
      const segments = 20;
      const segmentWidth = liquidTopWidth / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = liquidTopX + i * segmentWidth;
        const y = currentLiquidLevel + Math.sin(i * 0.5 + Date.now() * 0.002) * 2; // Subtle wave animation
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(width / 2 + liquidTopWidth / 2, currentLiquidLevel + 10);
      ctx.lineTo(liquidTopX, currentLiquidLevel + 10);
      ctx.closePath();
      ctx.fill();
      
      // Draw bubbles in liquid
      bubbles.forEach(bubble => {
        // Create a radial gradient for more realistic bubbles
        const bubbleGradient = ctx.createRadialGradient(
          bubble.x - bubble.size * 0.3, 
          bubble.y - bubble.size * 0.3, 
          0,
          bubble.x, 
          bubble.y, 
          bubble.size
        );
        bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.9})`);
        bubbleGradient.addColorStop(0.8, `rgba(255, 255, 255, ${bubble.opacity * 0.5})`);
        bubbleGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.fillStyle = bubbleGradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a small highlight to each bubble
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw droplets
      droplets.forEach(droplet => {
        // Create gradient for droplets
        const dropletGradient = ctx.createRadialGradient(
          droplet.x - droplet.size * 0.3, 
          droplet.y - droplet.size * 0.3, 
          0,
          droplet.x, 
          droplet.y, 
          droplet.size * 1.5
        );
        
        // Adjust droplet appearance based on dark mode
        if (isDarkMode) {
          dropletGradient.addColorStop(0, `rgba(96, 165, 250, ${droplet.opacity})`);
          dropletGradient.addColorStop(1, `rgba(59, 130, 246, ${droplet.opacity * 0.7})`);
        } else {
          dropletGradient.addColorStop(0, `rgba(96, 165, 250, ${droplet.opacity})`);
          dropletGradient.addColorStop(1, `rgba(59, 130, 246, ${droplet.opacity * 0.7})`);
        }
        
        // Use opacity for better looking droplets
        ctx.fillStyle = dropletGradient;
        ctx.beginPath();
        ctx.ellipse(droplet.x, droplet.y, droplet.size, droplet.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a small highlight to each droplet
        ctx.fillStyle = `rgba(255, 255, 255, ${droplet.opacity * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(
          droplet.x - droplet.size * 0.3, 
          droplet.y - droplet.size * 0.3, 
          droplet.size * 0.2, 
          droplet.size * 0.3, 
          0, 0, Math.PI * 2
        );
        ctx.fill();
      });
      
      // Draw pipette and droplets falling into the flask
      if (liquidLevel < 0.95) { // Only draw pipette when flask isn't full
        // Draw the pipette
        const pipetteX = width / 2;
        const pipetteY = neckHeight * 0.4; // Position above the neck
        const pipetteWidth = 5;
        const pipetteHeight = 40;
        const tipWidth = 3;
        const tipHeight = 10;
        
        // Add subtle animation to pipette position
        const pipetteXOffset = Math.sin(Date.now() * 0.001) * 0.5;
        
        // Add shadow/glow effect to the pipette
        if (isDarkMode) {
          ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        
        // Draw pipette body
        ctx.fillStyle = isDarkMode ? '#4b5563' : '#d1d5db'; // Pipette color
        ctx.beginPath();
        ctx.rect(pipetteX - pipetteWidth/2 + pipetteXOffset, pipetteY - pipetteHeight, pipetteWidth, pipetteHeight);
        ctx.fill();
        
        // Draw pipette tip with gradient
        const tipGradient = ctx.createLinearGradient(
          pipetteX - tipWidth/2 + pipetteXOffset, 
          pipetteY,
          pipetteX + tipWidth/2 + pipetteXOffset, 
          pipetteY + tipHeight
        );
        
        if (isDarkMode) {
          tipGradient.addColorStop(0, '#4b5563');
          tipGradient.addColorStop(1, '#374151');
        } else {
          tipGradient.addColorStop(0, '#d1d5db');
          tipGradient.addColorStop(1, '#9ca3af');
        }
        
        ctx.fillStyle = tipGradient;
        ctx.beginPath();
        ctx.moveTo(pipetteX - pipetteWidth/2 + pipetteXOffset, pipetteY);
        ctx.lineTo(pipetteX - tipWidth/2 + pipetteXOffset, pipetteY + tipHeight);
        ctx.lineTo(pipetteX + tipWidth/2 + pipetteXOffset, pipetteY + tipHeight);
        ctx.lineTo(pipetteX + pipetteWidth/2 + pipetteXOffset, pipetteY);
        ctx.closePath();
        ctx.fill();
        
        // Add a liquid reservoir at the top of the pipette
        const reservoirWidth = pipetteWidth * 3;
        const reservoirHeight = 15;
        
        ctx.fillStyle = colors.liquidColor;
        ctx.beginPath();
        ctx.roundRect(
          pipetteX - reservoirWidth/2 + pipetteXOffset, 
          pipetteY - pipetteHeight - reservoirHeight, 
          reservoirWidth, 
          reservoirHeight,
          4
        );
        ctx.fill();
        
        // Add liquid highlight to reservoir
        const reservoirHighlight = ctx.createLinearGradient(
          0, 
          pipetteY - pipetteHeight - reservoirHeight,
          0, 
          pipetteY - pipetteHeight - reservoirHeight/2
        );
        reservoirHighlight.addColorStop(0, colors.liquidHighlight);
        reservoirHighlight.addColorStop(1, 'transparent');
        
        ctx.fillStyle = reservoirHighlight;
        ctx.beginPath();
        ctx.roundRect(
          pipetteX - reservoirWidth/2 + pipetteXOffset, 
          pipetteY - pipetteHeight - reservoirHeight, 
          reservoirWidth, 
          reservoirHeight/2,
          [4, 4, 0, 0]
        );
        ctx.fill();
        
        // Reset shadows
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw rubber bulb at top of pipette
        ctx.fillStyle = '#cbd5e1'; // Slightly different color for bulb
        ctx.beginPath();
        ctx.ellipse(
          pipetteX,
          pipetteY - pipetteHeight,
          pipetteWidth * 2,
          pipetteWidth * 3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Add highlight to bulb
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
          pipetteX - pipetteWidth/2,
          pipetteY - pipetteHeight - pipetteWidth,
          pipetteWidth,
          pipetteWidth * 1.5,
          Math.PI/4,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Generate droplets from pipette tip
        if (Math.random() > 0.85) {
          // Random droplet position at the tip of the pipette
          const dropletX = pipetteX + (Math.random() - 0.5) * 1;
          const dropletY = pipetteY + tipHeight;
          
          droplets.push({
            x: dropletX,
            y: dropletY,
            size: 1.5 + Math.random() * 1.5, // Slightly larger droplets
            speed: 1 + Math.random(),
            opacity: 0.8 + Math.random() * 0.2 // More opaque droplets
          });
          
          // Increase liquid level when droplets are added
          liquidLevel += 0.01;
        }
      }
    };
    
    // Helper to calculate width at a given y position
    const interpolateWidth = (y: number): number => {
      const width = rect.width;
      const height = rect.height;
      const neckHeight = height * 0.35; // Match the drawing
      const bodyTopY = neckHeight;
      const bodyTopWidth = width * 0.35; // Match the drawing
      const bodyBottomWidth = width * 0.75; // Match the drawing
      
      if (y <= bodyTopY) return width * 0.15; // Match neck width
      
      const ratio = (y - bodyTopY) / (height - bodyTopY);
      return bodyTopWidth + ratio * (bodyBottomWidth - bodyTopWidth);
    };
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      drawFlask();
      
      // Instead of decreasing, we're now increasing the liquid level
      // We still need some management to prevent overflow
      if (liquidLevel > 0.9) {
        // When almost full, slow down the filling rate
        liquidLevel = Math.min(liquidLevel, 0.95);
      }
      
      // Generate bubbles (chemical reaction effect)
      if (Math.random() > 0.85 && liquidLevel > 0.2) {
        const currentLiquidLevel = rect.height - (liquidLevel * rect.height * 0.65);
        const liquidTopWidth = interpolateWidth(currentLiquidLevel);
        // Create bubbles across the width of the liquid
        const x = rect.width / 2 - (liquidTopWidth / 2) + Math.random() * liquidTopWidth;
        // Create bubbles at various heights in the liquid
        const y = rect.height - Math.random() * (rect.height - currentLiquidLevel) * 0.8;
        
        // Add bubble
        bubbles.push({
          x,
          y,
          size: 0.8 + Math.random() * 2.2, // More varied sizes
          speed: 0.3 + Math.random() * 1.2, // More varied speeds
          opacity: 0.4 + Math.random() * 0.5 // Variable opacity for realism
        });
      }
      
      // Update bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.y -= bubble.speed;
        // Add slight horizontal wobble to bubbles
        bubble.x += Math.sin(Date.now() * 0.01 + i) * 0.2;
        
        // Remove bubbles that reach liquid surface
        const currentLiquidLevel = rect.height - (liquidLevel * rect.height * 0.65);
        if (bubble.y < currentLiquidLevel) {
          bubbles.splice(i, 1);
        }
      }
      
      // Update droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const droplet = droplets[i];
        droplet.y += droplet.speed;
        // Add some horizontal movement to simulate real falling droplets
        droplet.x += Math.sin(droplet.y * 0.1) * 0.3;
        // Reduce opacity as droplets fall
        droplet.opacity -= 0.005;
        
        // Remove droplets that fall off screen or become too transparent
        if (droplet.y > rect.height + 20 || droplet.opacity <= 0) {
          droplets.splice(i, 1);
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Listen for dark mode changes
    const darkModeObserver = new MutationObserver(() => {
      checkDarkMode();
    });
    
    darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => {
      cancelAnimationFrame(animationId);
      darkModeObserver.disconnect();
    };
  }, [checkDarkMode]);
  
  return (
    <div className="erlenmeyer-flask-container">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full dark:filter dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ErlenmeyerFlask;
