import pluginRss, {
  dateToRfc3339,
  dateToRfc822,
  getNewestCollectionItemDate,
} from "@11ty/eleventy-plugin-rss";
import writingElsewhere from "./src/_data/writingElsewhere.js";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    if (!url || !base) {
      return url || "";
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return new URL(url, base).toString();
  });
  eleventyConfig.addFilter("dateToRfc822", dateToRfc822);
  eleventyConfig.addFilter("dateToRfc3339", dateToRfc3339);
  eleventyConfig.addFilter("rssLastUpdated", items =>
    dateToRfc3339(getNewestCollectionItemDate(items))
  );

  eleventyConfig.addFilter("readableDate", (value, options) => {
    const date = toDate(value);
    if (!date) {
      return "";
    }
    const formatter = new Intl.DateTimeFormat(
      "en-US",
      options ?? { month: "short", day: "numeric", year: "numeric" }
    );
    return formatter.format(date);
  });

  eleventyConfig.addFilter("isoDate", value => {
    const date = toDate(value);
    if (!date) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter(
    "startsWith",
    (value = "", prefix = "") =>
      typeof value === "string" &&
      typeof prefix === "string" &&
      value.startsWith(prefix)
  );

  eleventyConfig.addFilter("filterTags", (tags = []) =>
    (tags || []).filter(tag => tag && tag !== "posts")
  );

  eleventyConfig.addFilter("unique", (items = []) => {
    const seen = new Set();
    return (items || []).filter(item => {
      if (!item) {
        return false;
      }
      const key =
        typeof item === "string" ? item.toLowerCase() : JSON.stringify(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  });

  eleventyConfig.addFilter("collectTags", (items = []) => {
    const collected = [];
    for (const item of items || []) {
      if (!item) {
        continue;
      }
      const tagList = Array.isArray(item.tags) ? item.tags : [];
      for (const tag of tagList) {
        if (!tag) {
          continue;
        }
        if (!collected.includes(tag)) {
          collected.push(tag);
        }
      }
    }
    return collected.sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addCollection("combinedPosts", collectionApi =>
    buildCombinedPosts(collectionApi)
  );

  eleventyConfig.addCollection("combinedTagEntries", collectionApi => {
    return buildCombinedTagEntries(collectionApi);
  });

  eleventyConfig.addCollection("sitemapPages", collectionApi => {
    const seen = new Set();
    const pages = [];

    const addPage = ({ url, date }) => {
      if (!url || seen.has(url)) {
        return;
      }
      seen.add(url);
      pages.push({ url, date });
    };

    for (const page of collectionApi.getAll()) {
      if (
        !page.url ||
        page.url === "/sitemap.xml" ||
        page.url === "/feed.xml" ||
        page.data.permalink === false ||
        page.data.sitemap === false ||
        !page.data.title
      ) {
        continue;
      }
      addPage({ url: page.url, date: page.data.date ? page.date : null });
    }

    for (const tagEntry of buildCombinedTagEntries(collectionApi)) {
      addPage({ url: `/tags/${tagEntry.slug}/` });
    }

    return pages;
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({
    "src/assets/favicon.ico": "favicon.ico",
  });
  eleventyConfig.addPassthroughCopy({
    "src/assets/favicon.svg": "favicon.svg",
  });
  eleventyConfig.addPassthroughCopy(
    "src/posts/**/*.{png,jpg,jpeg,gif,webp,svg,pdf,bib,py,md,txt}"
  );

  eleventyConfig.addTransform("inline-disqus", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    if (content.includes("disqus_thread")) {
      return content;
    }

    if (outputPath.includes("/posts/") && content.includes("<d-article>")) {
      let updated = content;
      if (!content.includes("/assets/favicon")) {
        updated = updated.replace(
          "<head>",
          `<head>
  <link rel="icon" href="/assets/favicon.ico" />
  <link rel="alternate icon" type="image/svg+xml" href="/assets/favicon.svg" />`
        );
      }

      const snippet = `
<section id="comments" style="max-width: 740px; margin: 3rem auto; padding: 0 1rem;">
  <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 1.3rem; color: #1a1a1a; margin-bottom: 0.6rem;">Join the discussion</h2>
  <div id="disqus_thread"></div>
  <noscript>Please enable JavaScript to view the comments.</noscript>
</section>
<script src="/js/disqus.js" defer></script>
`;
      return updated.replace("</body>", `${snippet}\n</body>`);
    }

    return content;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}

function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildCombinedPosts(collectionApi) {
  const posts = (collectionApi.getFilteredByTag("posts") || []).map(item => ({
    id: item.url,
    title: item.data.title,
    description: item.data.description,
    url: item.url,
    date: item.date ?? toDate(item.data.date),
    tags: (item.data.tags || []).filter(tag => tag && tag !== "posts"),
    isExternal: false,
  }));

  const externalEntries = (writingElsewhere || [])
    .map(piece => ({
      id: piece.url,
      title: piece.title,
      description: piece.summary,
      url: piece.url,
      date: toDate(piece.published),
      tags: (piece.tags || []).filter(Boolean),
      isExternal: true,
    }))
    .filter(item => item.date instanceof Date);

  return [...posts, ...externalEntries].sort((a, b) => b.date - a.date);
}

function buildCombinedTagEntries(collectionApi) {
  const combined = buildCombinedPosts(collectionApi);
  const tagMap = new Map();

  for (const entry of combined) {
    for (const tag of entry.tags) {
      if (!tag) {
        continue;
      }
      const slug = toSlug(tag);
      if (!slug) {
        continue;
      }
      const current = tagMap.get(slug) ?? { name: tag, slug, items: [] };
      if (!current.name) {
        current.name = tag;
      }
      current.items.push(entry);
      tagMap.set(slug, current);
    }
  }

  return Array.from(tagMap.entries())
    .map(([, payload]) => ({
      name: payload.name,
      slug: payload.slug,
      items: payload.items.slice().sort((a, b) => b.date - a.date),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toSlug(value) {
  if (!value) {
    return "";
  }
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
