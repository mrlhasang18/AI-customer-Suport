'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button } from '@mui/material';

// maths for the generation of multiple shapes with multiple color
const Welcome = () => {
  const router = useRouter();
  const [particles, setParticles] = useState([]);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 100; i++) {
        const shape = Math.random() < 0.5 ? 'circle' : Math.random() < 0.5 ? 'square' : 'triangle';
        newParticles.push({
          x: Math.random() * windowWidth,
          y: Math.random() * windowHeight,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 - 1,
          radius: Math.random() * 5 + 2,
          color: getRandomColor(),
          shape,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, [windowWidth, windowHeight]);

  useEffect(() => {
    const updateParticles = () => {
      const newParticles = particles.map((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > windowWidth) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > windowHeight) {
          particle.vy *= -1;
        }
        return particle;
      });
      setParticles(newParticles);
    };
    const intervalId = setInterval(updateParticles, 16);
    return () => clearInterval(intervalId);
  }, [particles, windowWidth, windowHeight]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = () => {
    router.push('/auth');
  };

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a', // Dark background
      }}
    >
      <h1
        style={{
          color: '#fff',
          zIndex: 1,
          fontSize: windowWidth < 768 ? '2rem' : '3rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          animation: 'pulse 2s infinite',
        }}
      >
        Welcome to Yeti AI
      </h1>
      <p
        style={{
          color: '#fff',
          zIndex: 1,
          fontSize: windowWidth < 768 ? '1.2rem' : '1.5rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          animation: 'pulse 2s infinite',
        }}
      >
        Explore the power of AI with us
      </p>
      <Button
        variant="contained"
        onClick={handleNavigate}
        style={{
          zIndex: 1,
          backgroundColor: '#4CAF50',
          color: '#ccc',
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          fontWeight: 'regular',
          textTransform: 'uppercase',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Get Started
      </Button>
      {particles.map((particle, index) => {
        const distance = Math.sqrt((particle.x - mouseX) ** 2 + (particle.y - mouseY) ** 2);
        const isClose = distance < 50;
        let shapeStyle;
        switch (particle.shape) {
          case 'circle':
            shapeStyle = {
              borderRadius: '50%',
              width: particle.radius * 2,
              height: particle.radius * 2,
            };
            break;
          case 'square':
            shapeStyle = {
              width: particle.radius * 2,
              height: particle.radius * 2,
            };
            break;
          case 'triangle':
            shapeStyle = {
              width: 0,
              height: 0,
              borderLeft: `${particle.radius}px solid transparent`,
              borderRight: `${particle.radius}px solid transparent`,
              borderBottom: `${particle.radius * 2}px solid ${particle.color}`,
            };
            break;
          default:
            shapeStyle = {};
        }
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              ...shapeStyle,
              backgroundColor: particle.shape === 'triangle' ? 'transparent' : particle.color,
              opacity: isClose ? 0 : 1,
            }}
          />
        );
      })}
      {particles.map((particle, index) => {
        const closestParticles = particles.filter((otherParticle, otherIndex) => {
          if (index === otherIndex) return false;
          const distance = Math.sqrt((particle.x - otherParticle.x) ** 2 + (particle.y - otherParticle.y) ** 2);
          return distance < 50;
        });
        return closestParticles.map((closestParticle, closestIndex) => {
          const lineStyle = {
            position: 'absolute',
            top: particle.y,
            left: particle.x,
            width: Math.abs(closestParticle.x - particle.x),
            height: 1,
            backgroundColor: particle.color,
            transform: `rotate(${Math.atan2(closestParticle.y - particle.y, closestParticle.x - particle.x)}rad)`,
            transformOrigin: 'left top',
          };
          return <div key={closestIndex} style={lineStyle} />;
        });
      })}
    </Box>
  );
};

export default Welcome;