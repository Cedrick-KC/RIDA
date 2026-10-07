import React from 'react';
import { motion } from 'framer-motion';

// Define the moving car icon props type
interface MovingCarIconProps {
  size?: string;
  color?: string;
  speed?: number;
  loop?: boolean;
  className?: string;
}

// MovingCarIcon component
const MovingCarIcon = ({
  size = '3rem',
  color = '#0056b3',
  speed = 2,
  loop = true,
  className = ''
}: MovingCarIconProps) => {
  return (
    <motion.div
      className={`d-inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        style={{ color: color }}
      >
        {/* Car body */}
        <motion.path
          d="M2 30h6l4-18h12l4 18h6l2-8h18l2 8h6l4-18h12l4 18h6V46H36v4H28v-4H16v4H4V30z"
          fill="currentColor"
        >
          {/* Motion animation */}
          <motion.animateTransform
            attributeName="transform"
            type="translate"
            from="-64 0"
            to="64 0"
            dur={speed}s
            repeatCount={loop ? 'indefinite' : 1}
          />
        </motion.path>

        {/* Wheels */}
        <motion.circle
          cx="12"
          cy="46"
          r="6"
          fill="currentColor"
        >
          <motion.animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 46"
            to="360 12 46"
            dur={0.5}s
            repeatCount="indefinite"
          />
        </motion.circle>

        <motion.circle
          cx="52"
          cy="46"
          r="6"
          fill="currentColor"
        >
          <motion.animateTransform
            attributeName="transform"
            type="rotate"
            from="0 52 46"
            to="360 52 46"
            dur={0.5}s
            repeatCount="indefinite"
          />
        </motion.circle>
      </motion.svg>
    </motion.div>
  );
};

export default MovingCarIcon;