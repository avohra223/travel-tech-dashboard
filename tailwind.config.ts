import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amadeus: {
          deep: "#1B365D",
          accent: "#005EB8",
          light: "#F3F4F6",
          hover: "#142847",
        },
        threat: {
          high: "#DC2626",
          medium: "#F59E0B",
          low: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
