import { Plugin, MarkdownPostProcessorContext } from 'obsidian';

export default class ArniemTabsPlugin extends Plugin {
    async onload() {
        console.log("Loading Arniem's Custom Tabs...");

        // Note the capital 'B' in registerMarkdownCodeBlockProcessor
        this.registerMarkdownCodeBlockProcessor("tabs", (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
            
            // 1. Create a root container wrapper
            const container = el.createDiv({ cls: "custom-tabs-container" });
            
            // 2. Parse the lines inside your markdown code block
            const lines: string[] = source.split("\n").filter((line: string) => line.trim() !== "");
            
            // Basic structural arrays
            const tabTitles: string[] = [];
            const tabContents: string[] = [];

            // A basic layout parser
            let currentContent = "";
            lines.forEach((line: string) => {
                if (line.startsWith("=== ")) {
                    if (tabTitles.length > 0) tabContents.push(currentContent);
                    tabTitles.push(line.replace("=== ", "").trim());
                    currentContent = "";
                } else {
                    currentContent += line + "\n";
                }
            });
            if (tabTitles.length > 0) tabContents.push(currentContent);

            // 3. Render the Tab Headers
            const headerBar = container.createDiv({ cls: "tab-header-bar" });
            const contentArea = container.createDiv({ cls: "tab-content-area" });

            tabTitles.forEach((title: string, index: number) => {
                const tabButton = headerBar.createEl("button", { 
                    text: title, 
                    cls: index === 0 ? "tab-btn active" : "tab-btn" 
                });
                
                const tabPane = contentArea.createDiv({ 
                    text: tabContents[index], 
                    cls: "tab-pane" 
                });
                if (index !== 0) tabPane.style.display = "none";

                // Simple vanilla DOM toggle event logic
                tabButton.addEventListener("click", () => {
                    headerBar.querySelectorAll(".tab-btn").forEach((b: Element) => b.classList.remove("active"));
                    contentArea.querySelectorAll(".tab-pane").forEach((p: Element) => (p as HTMLElement).style.display = "none");
                    
                    tabButton.classList.add("active");
                    tabPane.style.display = "block";
                });
            });
        });
    }

    onunload() {
        console.log("Unloading Arniem's Custom Tabs...");
    }
}