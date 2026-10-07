import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define the holographic display props type
interface HolographicDisplayProps {
  title?: React.ReactNode;
  content?: React.ReactNode | string | any[];
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

// HolographicDisplay component - Futuristic UI element
const HolographicDisplay = ({
  title,
  content,
  icon = null,
  color = '#00ffff',
  size = 'md',
  animated = true,
  className = ''
}: HolographicDisplayProps) => {
  const [pulse, setPulse] = useState<boolean>(false);
  const [rotate, setRotate] = useState<number>(0);

  useEffect(() => {
    if (animated) {
      const pulseInterval = setInterval(() => {
        setPulse(!pulse);
      }, 2000);

      const rotateInterval = setInterval(() => {
        setRotate(prev => (prev + 1) % 360);
      }, 5000);

      return () => {
        clearInterval(pulseInterval);
        clearInterval(rotateInterval);
      };
    }
  }, [animated, pulse, rotate]);

  const sizeStyles = {
    sm: {
      width: '200px',
      height: '150px',
      fontSize: '0.9rem'
    },
    md: {
      width: '300px',
      height: '200px',
      fontSize: '1rem'
    },
    lg: {
      width: '400px',
      height: '250px',
      fontSize: '1.1rem'
    },
    xl: {
      width: '500px',
      height: '300px',
      fontSize: '1.25rem'
    }
  };

  const styles = sizeStyles[size] || sizeStyles.md;

  return (
    <motion.div
      className={`holographic-display ${className}`}
      style={{
        width: styles.width,
        height: styles.height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: `
          radial-gradient(circle at center,
            ${color}05 0%,
            ${color}02 30%,
            transparent 70%
          ),
          linear-gradient(45deg,
            transparent 0%,
            transparent 47%,
            ${color}08 50%,
            transparent 53%,
            transparent 100%
          )
        `,
        border: `1px solid ${color}33`,
        boxShadow: `
          0 0 20px ${color}44,
          inset 0 0 20px ${color}33
        `,
        ...(pulse && {
          boxShadow: `
            0 0 30px ${color}66,
            inset 0 0 30px ${color}44
          `
        })
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Holographic scan lines */}
      <div className="scan-lines" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            ${color}11,
            ${color}11 1px,
            transparent 1px,
            transparent 4px
          )
        `,
        pointerEvents: 'none',
        animation: 'scanMove 4s linear infinite'
      }}></div>

      {/* Holographic glow */}
      <div className="holographic-glow" style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        background: `radial-gradient(circle at center, ${color}11, transparent 70%)`,
        opacity: 0.6,
        pointerEvents: 'none',
        animation: 'glowPulse 3s ease-in-out infinite alternate'
      }}></div>

      {/* Content */}
      <div className="holographic-content" style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: color,
        fontFamily: '"Courier New", monospace',
        letterSpacing: '0.5px',
        pointerEvents: 'none',
        padding: '1rem',
        zIndex: 2
      }}>
        {icon && (
          <div className="holographic-icon" style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color})`,
            animation: 'iconFloat 3s ease-in-out infinite'
          }}>
            {icon}
          </div>
        )}

        {title && (
          <div className="holographic-title" style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textShadow: `0 0 3px ${color}`,
            background: `linear-gradient(to right, ${color}44, ${color}88, ${color}44)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
          }}>
            {title}
          </div>
        )}

        {content && (
          <div className="holographic-text" style={{
            fontSize: styles.fontSize,
            lineHeight: '1.5',
            textShadow: `0 0 2px ${color}`,
            opacity: 0.9
          }}>
            {typeof content === 'string' ? content :
              Array.isArray(content) ? (
                content.map((item, index) => (
                  <div key={index} className="holographic-item" style={{
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span className="holographic-dot" style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: color,
                      borderRadius: '50%',
                      marginRight: '0.5rem',
                      animation: `pulseDot ${2 + index * 0.5}s ease-in-out infinite`
                    }}></span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div>{content}</div>
              )}
          </div>
        )}
      </div>

      {/* Holographic particles */}
      <div className="holographic-particles" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Generate some particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="holographic-particle"
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              backgroundColor: color,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `
                floatParticle ${3 + Math.random() * 2}s
                ${Math.random() * 2}s
                ease-in-out
                infinite
              `,
              opacity: `${0.2 + Math.random() * 0.6}`
            }}
          >
          </div>
        ))}
      </div>

      {/* Decorative corner elements */}
      <div className="holographic-corners" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        <div className="corner top-left" style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderTop: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`
        }}></div>
        <div className="corner top-right" style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`
        }}></div>
        <div className="corner bottom-left" style={{
          position: 'absolute',
          bottom: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`
        }}></div>
        <div className="corner bottom-right" style={{
          position: 'absolute';
          bottom: '-2px';
          right: '-2px';
          width: '20px';
          height: '20px';
          borderBottom: `2px solid ${color}`;
          borderRight: `2px solid ${color}`
        }}></div>
      </div>
    </motion.div>
  );
};

export default HolographicDisplay;