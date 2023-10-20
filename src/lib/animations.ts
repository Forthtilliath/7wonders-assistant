export const scienceAnimation = {
  visible: {
    opacity: 1,
    y: 0,
    display: 'block',
  },
  hidden: {
    opacity: 0,
    y: 50,
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
