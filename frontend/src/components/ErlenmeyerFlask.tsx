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
    let liquidLevel = 0.7; // Start with flask 70% full
    let droplets: { x: number, y: number, size: number, speed: number }[] = [];
    
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
      const neckWidth = width * 0.2;
      const neckHeight = height * 0.3;
      const neckX = width / 2 - neckWidth / 2;
      
      ctx.fillStyle = flaskColor;
      ctx.beginPath();
      ctx.rect(neckX, 0, neckWidth, neckHeight);
      ctx.fill();
      
      // Draw flask body
      const bodyTopWidth = width * 0.4;
      const bodyBottomWidth = width * 0.8;
      const bodyHeight = height * 0.7;
      const bodyTopY = neckHeight;
      
      ctx.beginPath();
      ctx.moveTo(neckX, neckHeight);
      ctx.lineTo(width / 2 - bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(width / 2 - bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyBottomWidth / 2, height);
      ctx.lineTo(width / 2 + bodyTopWidth / 2, bodyTopY);
      ctx.lineTo(neckX + neckWidth, neckHeight);
      ctx.closePath();
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
      
      // Add highlight to liquid
      ctx.fillStyle = liquidHighlight;
      ctx.beginPath();
      ctx.ellipse(
        width / 2, 
        currentLiquidLevel + 10, 
        liquidTopWidth * 0.3, 
        10, 
        0, 
        0, 
        Math.PI * 2
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
      ctx.fillStyle = liquidColor;
      droplets.forEach(droplet => {
        ctx.beginPath();
        ctx.ellipse(droplet.x, droplet.y, droplet.size, droplet.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw liquid stream if pouring
      if (liquidLevel > 0.2) {
        // Draw the pouring liquid
        const streamWidth = 5;
        const streamStartX = neckX + neckWidth;
        const streamStartY = neckHeight / 2;
        
        ctx.fillStyle = liquidColor;
        ctx.beginPath();
        ctx.moveTo(streamStartX, streamStartY);
        ctx.lineTo(streamStartX + 30, streamStartY + 20);
        ctx.lineTo(streamStartX + 30, streamStartY + 20 + streamWidth);
        ctx.lineTo(streamStartX, streamStartY + streamWidth);
        ctx.closePath();
        ctx.fill();
        
        // Generate a new droplet occasionally
        if (Math.random() > 0.7) {
          droplets.push({
            x: streamStartX + 30,
            y: streamStartY + 20 + streamWidth,
            size: 2 + Math.random() * 3,
            speed: 1 + Math.random() * 2
          });
        }
      }
    };
    
    // Helper to calculate width at a given y position
    const interpolateWidth = (y: number): number => {
      const width = rect.width;
      const height = rect.height;
      const neckHeight = height * 0.3;
      const bodyTopY = neckHeight;
      const bodyTopWidth = width * 0.4;
      const bodyBottomWidth = width * 0.8;
      
      if (y <= bodyTopY) return width * 0.2; // Neck width
      
      const ratio = (y - bodyTopY) / (height - bodyTopY);
      return bodyTopWidth + ratio * (bodyBottomWidth - bodyTopWidth);
    };
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      drawFlask();
      
      // Reduce liquid level slowly
      if (liquidLevel > 0.2) {
        liquidLevel -= 0.0005;
      }
      
      // Generate bubbles (chemical reaction effect)
      if (Math.random() > 0.85 && liquidLevel > 0.2) {
        const currentLiquidLevel = rect.height - (liquidLevel * rect.height * 0.7);
        const liquidTopWidth = interpolateWidth(currentLiquidLevel);
        const x = rect.width / 2 - (liquidTopWidth / 2) + Math.random() * liquidTopWidth;
        const y = currentLiquidLevel + Math.random() * (rect.height - currentLiquidLevel);
        
        bubbles.push({
          x,
          y,
          size: 1 + Math.random() * 3,
          speed: 0.5 + Math.random() * 1.5
        });
      }
      
      // Update bubbles
      bubbles.forEach((bubble, index) => {
        bubble.y -= bubble.speed;
        
        // Remove bubbles that reach liquid surface
        const currentLiquidLevel = rect.height - (liquidLevel * rect.height * 0.7);
        if (bubble.y < currentLiquidLevel) {
          bubbles.splice(index, 1);
        }
      });
      
      // Update droplets
      droplets.forEach((droplet, index) => {
        droplet.y += droplet.speed;
        
        // Remove droplets that fall off screen
        if (droplet.y > rect.height + 20) {
          droplets.splice(index, 1);
        }
      });
      
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
