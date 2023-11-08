import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#387fa3",
      },
    },
  },
  plugins: [],
} satisfies Config;
