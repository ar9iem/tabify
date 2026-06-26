import { Plugin, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild } from 'obsidian';

/**
 * A custom component that manages the asynchronous rendering and lifecycle
 * of our tab container in both Live Preview and Reading View.
 */
class TabRenderChild extends MarkdownRenderChild {
    source: string;
    sourcePath: string;

    constructor(containerEl: HTMLElement, source: string, sourcePath: string) {
        super(containerEl);
        this.source = source;
        this.sourcePath = sourcePath;
    }

    async onload() {
        // Clear the initial raw content element to avoid duplication
        this.containerEl.empty();

        // 1. Create a root container wrapper
        const container = this.containerEl.createDiv({ cls: "custom-tabs-container" });
        
        // 2. Parse the lines inside your markdown code block
        const lines: string[] = this.source.split("\n");
        const tabTitles: string[] = [];
        const tabContents: string[] = [];

        let currentContent = "";
        lines.forEach((line: string) => {
            if (line.startsWith("=== ")) {
                if (tabTitles.length > 0) tabContents.push(currentContent.trim());
                tabTitles.push(line.replace("=== ", "").trim());
                currentContent = "";
            } else {
                currentContent += line + "\n";
            }
        });
        if (tabTitles.length > 0) tabContents.push(currentContent.trim());

        // 3. Render the Tab Headers & Content Panes
        const headerBar = container.createDiv({ cls: "tab-header-bar" });
        const contentArea = container.createDiv({ cls: "tab-content-area" });

        for (let index = 0; index < tabTitles.length; index++) {
            const title = tabTitles[index];
            
            // Header Button
            const tabButton = headerBar.createEl("button", { 
                text: title, 
                cls: index === 0 ? "tab-btn active" : "tab-btn" 
            });
            
            // Content Pane Wrapper
            const tabPane = contentArea.createDiv({ cls: "tab-pane" });
            if (index !== 0) tabPane.style.display = "none";

            // Safely render nested markdown asynchronously
            await MarkdownRenderer.renderMarkdown(
                tabContents[index] ?? "", 
                tabPane, 
                this.sourcePath, 
                this // Pass the MarkdownRenderChild component to manage nested element lifecycles
            );

            // Tab switching click listener
            tabButton.addEventListener("click", () => {
                headerBar.querySelectorAll(".tab-btn").forEach((b: Element) => b.classList.remove("active"));
                contentArea.querySelectorAll(".tab-pane").forEach((p: Element) => (p as HTMLElement).style.display = "none");
                
                tabButton.classList.add("active");
                tabPane.style.display = "block";
            });
        }
    }
}

export default class ArniemTabsPlugin extends Plugin {
    async onload() {
        console.log("Loading Tabify with robust MarkdownRenderChild lifecycle...");

        this.registerMarkdownCodeBlockProcessor("tabs", (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
            // Instantiate the lifecycle child and attach it to the post-processor context
            const tabChild = new TabRenderChild(el, source, ctx.sourcePath ?? "");
            ctx.addChild(tabChild);
        });
    }

    onunload() {
        console.log("Unloading Tabify...");
    }
}