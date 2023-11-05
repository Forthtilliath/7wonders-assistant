export const scienceAnimation = {
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    display: 'block',
  },

  hidden: {
    opacity: 0,
    y: 100,
    height: 0,
    transitionEnd: {
      display: 'none',
    },
  },
};

export const modalAnimation = {
  visible: {
    opacity: 1,
    y: 0,
  },
  hidden: {
    opacity: 0,
    y: -100,
  },
};

export const overlayAnimation = {
  visible: {
    opacity: 1,
    display: 'flex',
  },
  hidden: {
    opacity: 0,
    transitionEnd: {
      display: 'none',
    },
  },
};

export const headerOptionsAnimation = {
  visible: {
    opacity: 1,
    display: 'flex',
    
  },
  hidden: {
    opacity: 0,
    transitionEnd: {
      display: 'none',
    },
  },
}