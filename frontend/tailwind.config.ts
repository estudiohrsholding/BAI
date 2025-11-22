import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5C5CFF",
          foreground: "#F8FAFC"
        }
      }
    }
  },
  plugins: []
};

export default config;
