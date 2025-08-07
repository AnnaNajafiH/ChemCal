import React, { useEffect, useRef } from 'react';

const ErlenmeyerFlask: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    
    // Colors
    const flaskColor = '#e5e7eb';
    const liquidColor = '#3b82f6';
    const liquidHighlight = '#60a5fa';
    const bubbleColor = 'rgba(255, 255, 255, 0.7)';
    
    // Add bubbles to simulate chemical reaction
    let bubbles: { x: number, y: number, size: number, speed: number }[] = [];
    
    const drawFlask = () => {
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw flask neck
      const neckWidth = width * 0.15; // Thinner neck
      const neckHeight = height * 0.35; // Longer neck
      const neckX = width / 2 - neckWidth / 2;
      
      // Create a flask shape (with outline)
      const bodyTopWidth = width * 0.35; // Narrower top
      const bodyBottomWidth = width * 0.75; // Wider bottom
      const bodyHeight = height * 0.65; // Shorter body
      const bodyTopY = neckHeight;
      
      // Draw flask outline
      ctx.strokeStyle = '#d1d5db';
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
      
      // Fill flask
      ctx.fillStyle = flaskColor;
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
      
      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.moveTo(liquidTopX, currentLiquidLevel);
      ctx.lineTo(width / 2 - bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + liquidTopWidth / 2, currentLiquidLevel);
      ctx.closePath();
      ctx.fill();
      
      // Add reflection/highlight to liquid (curved surface)
      const gradientHeight = 20;
      const gradient = ctx.createLinearGradient(0, currentLiquidLevel, 0, currentLiquidLevel + gradientHeight);
      gradient.addColorStop(0, liquidHighlight);
      gradient.addColorStop(1, liquidColor);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(
        width / 2, 
        currentLiquidLevel + 5, 
        liquidTopWidth * 0.4, 
        8, 
        0, 
        0, 
        Math.PI
      );
      ctx.fill();
      
      // Draw bubbles in liquid
      ctx.fillStyle = bubbleColor;
      bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw droplets
      droplets.forEach(droplet => {
        // Use opacity for better looking droplets
        ctx.fillStyle = `rgba(59, 130, 246, ${droplet.opacity})`;
        ctx.beginPath();
        ctx.ellipse(droplet.x, droplet.y, droplet.size, droplet.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw pipette and droplets falling into the flask
      if (liquidLevel < 0.95) { // Only draw pipette when flask isn't full
        // Draw the pipette
        const pipetteX = width / 2;
        const pipetteY = neckHeight * 0.4; // Position above the neck
        const pipetteWidth = 4;
        const pipetteHeight = 40;
        const tipWidth = 2;
        const tipHeight = 10;
        
        // Draw pipette body
        ctx.fillStyle = '#d1d5db'; // Pipette color
        ctx.beginPath();
        ctx.rect(pipetteX - pipetteWidth/2, pipetteY - pipetteHeight, pipetteWidth, pipetteHeight);
        ctx.fill();
        
        // Draw pipette tip
        ctx.beginPath();
        ctx.moveTo(pipetteX - pipetteWidth/2, pipetteY);
        ctx.lineTo(pipetteX - tipWidth/2, pipetteY + tipHeight);
        ctx.lineTo(pipetteX + tipWidth/2, pipetteY + tipHeight);
        ctx.lineTo(pipetteX + pipetteWidth/2, pipetteY);
        ctx.closePath();
        ctx.fill();
        
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
          speed: 0.3 + Math.random() * 1.2 // More varied speeds
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
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className="erlenmeyer-flask-container">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ErlenmeyerFlask;
