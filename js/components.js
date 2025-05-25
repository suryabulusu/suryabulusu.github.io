Vue.component("tabs", {
  template: `
        <div>
            <!-- Mobile Navigation -->
            <div class="mobile-nav">
                <button class="mobile-nav-toggle" @click="toggleMobileMenu">
                    <span>{{ activeTab ? activeTab.name : 'Select Section' }}</span>
                    <span class="dropdown-arrow" :class="{ 'open': showMobileMenu }"></span>
                </button>
                <div class="mobile-nav-menu" :class="{ show: showMobileMenu }">
                    <div 
                        v-for="tab in tabs" 
                        :key="tab.name"
                        class="mobile-nav-item" 
                        :class="{ active: tab.isActive }"
                        @click="selectTabMobile(tab)"
                    >
                        {{ tab.name }}
                    </div>
                </div>
            </div>

            <!-- Desktop Tabs -->
            <div class="tabs" ref="tabsContainer">
                <ul ref="tabsList">
                    <li v-for="tab in tabs" v-bind:class="{'is-active': tab.isActive}">
                        <a @click="selectTab(tab)">{{ tab.name }}</a>
                    </li>
                </ul>
            </div>
            
            <div class="tabs-details">
                <slot></slot>
            </div>
        
        </div>
    `,

  data() {
    return {
      tabs: [],
      activeFilters: [],
      showMobileMenu: false,
    };
  },

  computed: {
    activeTab() {
      return this.tabs.find(tab => tab.isActive);
    },
  },

  created() {
    this.tabs = this.$children;
  },

  mounted() {
    this.initializeTagFiltering();
    // Close mobile menu when clicking outside
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach(tab => {
        tab.isActive = tab.name === selectedTab.name;
      });
      // Re-initialize tag filtering when tab changes
      this.$nextTick(() => {
        this.initializeTagFiltering();
      });
    },

    selectTabMobile(selectedTab) {
      this.selectTab(selectedTab);
      this.showMobileMenu = false;
    },

    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },

    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showMobileMenu = false;
      }
    },

    initializeTagFiltering() {
      // Add click handlers to all tags in the current active tab
      const activeTab =
        this.$el.querySelector(
          '[v-show]:not([style*="display: none"]), [v-show="true"]'
        ) ||
        this.$el.querySelector(
          '.tabs-details > div:not([style*="display: none"])'
        );

      if (!activeTab) {
        return;
      }

      const tags = activeTab.querySelectorAll(".tag");
      const posts = activeTab.querySelectorAll(".post-preview");

      // Remove existing listeners
      tags.forEach(tag => {
        tag.replaceWith(tag.cloneNode(true));
      });

      // Add new listeners
      const newTags = activeTab.querySelectorAll(".tag");
      newTags.forEach(tag => {
        tag.addEventListener("click", e => {
          e.preventDefault();
          this.toggleTagFilter(tag.textContent.trim(), newTags, posts);
        });
      });
    },

    toggleTagFilter(tagText, allTags, allPosts) {
      const index = this.activeFilters.indexOf(tagText);

      if (index > -1) {
        this.activeFilters.splice(index, 1);
      } else {
        this.activeFilters.push(tagText);
      }

      // Update tag appearances
      allTags.forEach(tag => {
        if (this.activeFilters.includes(tag.textContent.trim())) {
          tag.classList.add("tag-active");
        } else {
          tag.classList.remove("tag-active");
        }
      });

      // Filter posts
      allPosts.forEach(post => {
        if (this.activeFilters.length === 0) {
          post.style.display = "block";
          return;
        }

        const postTags = Array.from(post.querySelectorAll(".tag")).map(tag =>
          tag.textContent.trim()
        );

        const hasMatchingTag = postTags.some(tag =>
          this.activeFilters.includes(tag)
        );
        post.style.display = hasMatchingTag ? "block" : "none";
      });
    },
  },
});

Vue.component("tab", {
  template: `
        <div v-show="isActive"><slot></slot></div>
    `,
  props: {
    name: { required: true },
    selected: { default: false },
  },

  data() {
    return { isActive: false };
  },

  mounted() {
    this.isActive = this.selected;
  },

  computed: {
    href() {
      return "#" + this.name;
    },
  },
});

new Vue({
  el: "#root",
});
