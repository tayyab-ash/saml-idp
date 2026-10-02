/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      colors: {
        canvas: '#f4f7f5',
        idp: '#e7f0ea',
        ink: '#1c2b26',
        mute: '#5c6d66',
        line: '#d2ddd6',
        line2: '#e4ece8',
        navy: '#0e6b56',
        navyhov: '#0a5645',
        panel: '#f7faf8',
        ok: '#1f7a4d',
        okbg: '#e5f5ec',
        warn: '#8a5a12',
        warnbg: '#f8f0dc',
        danger: '#9e2f28',
        dangerbg: '#f6e2e0',
        link: '#0c6b62',
        linkbg: '#e3f4ef',
        side: '#14352c',
        sidetext: '#d5e6de',
        sidemute: '#8aab9e',
        sidebd: '#1f4a3e',
        sidehov: '#1c4338',
      },
      boxShadow: {
        card: '0 10px 28px rgba(20, 53, 44, 0.1)',
      },
    },
  },
  plugins: [],
};
