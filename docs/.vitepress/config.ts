import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Convex Workspaces",
  description: "Workspace management system documentation",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "Reference", link: "/reference/callbacks" },
      { text: "NPM", link: "https://www.npmjs.com/package/convex-workspaces" },
      {
        text: "GitHub",
        link: "https://github.com/JuchokJuk/convex-workspaces",
      },
    ],

    sidebar: {
      "/": [{
        text: "Home",
        items: [{ text: "Quick Start", link: "/guide/quick-start" }],
      }],
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Usage Examples", link: "/guide/examples" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "Callbacks", link: "/reference/callbacks" },
            { text: "API", link: "/reference/api" },
          ],
        },
      ],
    },
  },
});
