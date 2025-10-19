import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Convex Workspaces",
  description: "Workspace management system documentation",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "Reference", link: "/reference/callbacks" },
      { text: "Tests", link: "/tests/" },
      { text: "NPM", link: "https://www.npmjs.com/package/convex-workspaces" },
      { text: "GitHub", link: "https://github.com/JuchokJuk/convex-workspaces" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Usage Examples", link: "/guide/examples" },
            { text: "Migration", link: "/guide/migration" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [{ text: "API Callbacks", link: "/reference/callbacks" }],
        },
      ],
      "/tests/": [
        {
          text: "Tests",
          items: [{ text: "Test Overview", link: "/tests/" }],
        },
      ],
    },
  },
});
